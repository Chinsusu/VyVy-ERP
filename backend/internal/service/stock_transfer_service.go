package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"gorm.io/gorm"
)

type StockTransferService interface {
	CreateTransfer(req *dto.CreateStockTransferRequest, userID uint) (*models.SafeStockTransfer, error)
	GetTransferByID(id uint) (*models.SafeStockTransfer, error)
	ListTransfers(filter *dto.StockTransferFilterRequest) ([]*models.SafeStockTransfer, int64, error)
	PostTransfer(id uint, userID uint) (*models.SafeStockTransfer, error)
	CancelTransfer(id uint, userID uint) (*models.SafeStockTransfer, error)
}

type stockTransferService struct {
	db              *gorm.DB
	stRepo          repository.StockTransferRepository
	warehouseRepo   repository.WarehouseRepository
	stockRepo       repository.StockBalanceRepository
}

func NewStockTransferService(
	db *gorm.DB,
	stRepo repository.StockTransferRepository,
	warehouseRepo repository.WarehouseRepository,
	stockRepo repository.StockBalanceRepository,
) StockTransferService {
	return &stockTransferService{
		db:            db,
		stRepo:        stRepo,
		warehouseRepo: warehouseRepo,
		stockRepo:     stockRepo,
	}
}

func (s *stockTransferService) CreateTransfer(req *dto.CreateStockTransferRequest, userID uint) (*models.SafeStockTransfer, error) {
	if req.FromWarehouseID == req.ToWarehouseID {
		return nil, errors.New("source and destination warehouse cannot be the same")
	}

	// 1. Validate warehouses
	_, err := s.warehouseRepo.GetByID(req.FromWarehouseID)
	if err != nil {
		return nil, errors.New("source warehouse not found")
	}
	_, err = s.warehouseRepo.GetByID(req.ToWarehouseID)
	if err != nil {
		return nil, errors.New("destination warehouse not found")
	}

	// 2. Parse date
	trDate, err := time.Parse("2006-01-02", req.TransferDate)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}

	// 3. Generate number: TR-YYYY-XXXXXX
	year := time.Now().Format("2006")
	var count int64
	s.db.Model(&models.StockTransfer{}).Where("transfer_number LIKE ?", "TR-"+year+"-%").Count(&count)
	trNumber := fmt.Sprintf("TR-%s-%06d", year, count+1)

	// 4. Create Transfer model
	st := &models.StockTransfer{
		TransferNumber:  trNumber,
		FromWarehouseID: req.FromWarehouseID,
		ToWarehouseID:   req.ToWarehouseID,
		TransferDate:    trDate,
		Notes:           req.Notes,
		Status:          "draft",
		CreatedBy:       &userID,
		UpdatedBy:       &userID,
	}

	// 5. Items
	items := make([]models.StockTransferItem, len(req.Items))
	for i, itemReq := range req.Items {
		// Verify source stock (simple check)
		balance, err := s.stockRepo.Get(itemReq.ItemType, itemReq.ItemID, req.FromWarehouseID, itemReq.FromLocationID, itemReq.BatchNumber, itemReq.LotNumber)
		if err != nil || balance.Quantity < itemReq.Quantity {
			return nil, fmt.Errorf("insufficient stock for item %d in source warehouse", itemReq.ItemID)
		}

		items[i] = models.StockTransferItem{
			ItemType:       itemReq.ItemType,
			ItemID:         itemReq.ItemID,
			FromLocationID: itemReq.FromLocationID,
			ToLocationID:   itemReq.ToLocationID,
			BatchNumber:    itemReq.BatchNumber,
			LotNumber:      itemReq.LotNumber,
			Quantity:       itemReq.Quantity,
			UnitCost:       balance.UnitCost,
			Notes:          itemReq.Notes,
			CreatedBy:      &userID,
			UpdatedBy:      &userID,
		}
	}
	st.Items = items

	if err := s.stRepo.Create(st); err != nil {
		return nil, err
	}

	return s.GetTransferByID(st.ID)
}

func (s *stockTransferService) GetTransferByID(id uint) (*models.SafeStockTransfer, error) {
	st, err := s.stRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	return s.MapToSafe(st), nil
}

func (s *stockTransferService) ListTransfers(filter *dto.StockTransferFilterRequest) ([]*models.SafeStockTransfer, int64, error) {
	filters := make(map[string]interface{})
	if filter.FromWarehouseID > 0 {
		filters["from_warehouse_id"] = filter.FromWarehouseID
	}
	if filter.ToWarehouseID > 0 {
		filters["to_warehouse_id"] = filter.ToWarehouseID
	}
	if filter.Status != "" {
		filters["status"] = filter.Status
	}
	if filter.TransferNumber != "" {
		filters["transfer_number"] = filter.TransferNumber
	}

	sts, total, err := s.stRepo.List(filters, filter.Offset, filter.Limit)
	if err != nil {
		return nil, 0, err
	}

	safeSTs := make([]*models.SafeStockTransfer, len(sts))
	for i, st := range sts {
		safeSTs[i] = s.MapToSafe(st)
	}

	return safeSTs, total, nil
}

func (s *stockTransferService) PostTransfer(id uint, userID uint) (*models.SafeStockTransfer, error) {
	st, err := s.stRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if st.IsPosted {
		return nil, errors.New("transfer is already posted")
	}

	now := time.Now()
	err = s.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range st.Items {
			// --- SOURCE WAREHOUSE: TRANSIT OUT ---
			var sourceBalance models.StockBalance
			err := tx.Where("item_type = ? AND item_id = ? AND warehouse_id = ?", item.ItemType, item.ItemID, st.FromWarehouseID).
				Where("COALESCE(warehouse_location_id, 0) = COALESCE(?, 0)", item.FromLocationID).
				Where("COALESCE(batch_number, '') = COALESCE(?, '')", item.BatchNumber).
				First(&sourceBalance).Error
			
			if err != nil || sourceBalance.Quantity < item.Quantity {
				return fmt.Errorf("insufficient stock for item %d at source", item.ItemID)
			}

			sourceBalance.Quantity -= item.Quantity
			sourceBalance.TotalCost = sourceBalance.Quantity * sourceBalance.UnitCost
			sourceBalance.LastTransactionDate = &now
			if err := tx.Save(&sourceBalance).Error; err != nil {
				return err
			}

			// Source Ledger (Issue)
			sourceLedger := models.StockLedger{
				TransactionType:   "transfer_out",
				TransactionNumber: st.TransferNumber,
				TransactionDate:   now,
				ItemType:          item.ItemType,
				ItemID:            item.ItemID,
				WarehouseID:       st.FromWarehouseID,
				WarehouseLocationID: item.FromLocationID,
				BatchNumber:       item.BatchNumber,
				LotNumber:         item.LotNumber,
				Quantity:          -item.Quantity,
				UnitCost:          item.UnitCost,
				TotalCost:         -item.Quantity * item.UnitCost,
				BalanceQuantity:   sourceBalance.Quantity,
				ReferenceType:     "Transfer",
				ReferenceID:       st.ID,
				CreatedBy:         &userID,
			}
			if err := tx.Create(&sourceLedger).Error; err != nil {
				return err
			}

			// --- DESTINATION WAREHOUSE: TRANSIT IN ---
			var destBalance models.StockBalance
			err = tx.Where("item_type = ? AND item_id = ? AND warehouse_id = ?", item.ItemType, item.ItemID, st.ToWarehouseID).
				Where("COALESCE(warehouse_location_id, 0) = COALESCE(?, 0)", item.ToLocationID).
				Where("COALESCE(batch_number, '') = COALESCE(?, '')", item.BatchNumber).
				First(&destBalance).Error

			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					destBalance = models.StockBalance{
						ItemType:            item.ItemType,
						ItemID:              item.ItemID,
						WarehouseID:         st.ToWarehouseID,
						WarehouseLocationID: item.ToLocationID,
						BatchNumber:         item.BatchNumber,
						LotNumber:           item.LotNumber,
						Quantity:            item.Quantity,
						UnitCost:            item.UnitCost,
						TotalCost:           item.Quantity * item.UnitCost,
						LastTransactionDate: &now,
					}
					if item.ExpiryDate != nil {
						exp := item.ExpiryDate.Format("2006-01-02")
						destBalance.ExpiryDate = &exp
					}
					if err := tx.Create(&destBalance).Error; err != nil {
						return err
					}
				} else {
					return err
				}
			} else {
				destBalance.Quantity += item.Quantity
				destBalance.TotalCost = destBalance.Quantity * destBalance.UnitCost
				destBalance.LastTransactionDate = &now
				if err := tx.Save(&destBalance).Error; err != nil {
					return err
				}
			}

			// Destination Ledger (Receipt)
			destLedger := models.StockLedger{
				TransactionType:   "transfer_in",
				TransactionNumber: st.TransferNumber,
				TransactionDate:   now,
				ItemType:          item.ItemType,
				ItemID:            item.ItemID,
				WarehouseID:       st.ToWarehouseID,
				WarehouseLocationID: item.ToLocationID,
				BatchNumber:       item.BatchNumber,
				LotNumber:         item.LotNumber,
				Quantity:          item.Quantity,
				UnitCost:          item.UnitCost,
				TotalCost:         item.Quantity * item.UnitCost,
				BalanceQuantity:   destBalance.Quantity,
				ReferenceType:     "Transfer",
				ReferenceID:       st.ID,
				CreatedBy:         &userID,
			}
			if err := tx.Create(&destLedger).Error; err != nil {
				return err
			}
		}

		// Update Header
		st.Status = "posted"
		st.IsPosted = true
		st.PostedBy = &userID
		st.PostedAt = &now
		if err := tx.Save(st).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.GetTransferByID(id)
}

func (s *stockTransferService) CancelTransfer(id uint, userID uint) (*models.SafeStockTransfer, error) {
	st, err := s.stRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if st.IsPosted {
		return nil, errors.New("cannot cancel a posted transfer")
	}

	st.Status = "cancelled"
	st.UpdatedBy = &userID
	if err := s.stRepo.Update(st); err != nil {
		return nil, err
	}

	return s.MapToSafe(st), nil
}

func (s *stockTransferService) MapToSafe(st *models.StockTransfer) *models.SafeStockTransfer {
	safe := &models.SafeStockTransfer{
		ID:                st.ID,
		TransferNumber:    st.TransferNumber,
		FromWarehouseID:   st.FromWarehouseID,
		FromWarehouseName: st.FromWarehouse.Name,
		ToWarehouseID:     st.ToWarehouseID,
		ToWarehouseName:   st.ToWarehouse.Name,
		TransferDate:      st.TransferDate,
		Status:            st.Status,
		IsPosted:          st.IsPosted,
		PostedAt:          st.PostedAt,
		Notes:             st.Notes,
		CreatedAt:         st.CreatedAt,
	}
	if st.PostedByUser != nil {
		safe.PostedByName = st.PostedByUser.FullName
	}
	if st.ApprovedByUser != nil {
		safe.ApprovedByName = st.ApprovedByUser.FullName
	}
	if st.ShippedByUser != nil {
		safe.ShippedByName = st.ShippedByUser.FullName
	}
	if st.ReceivedByUser != nil {
		safe.ReceivedByName = st.ReceivedByUser.FullName
	}
	if st.CreatedByUser != nil {
		safe.CreatedByName = st.CreatedByUser.FullName
	}

	if len(st.Items) > 0 {
		safe.Items = make([]models.SafeStockTransferItem, len(st.Items))
		for i, item := range st.Items {
			safeItem := models.SafeStockTransferItem{
				ID:               item.ID,
				ItemType:         item.ItemType,
				ItemID:           item.ItemID,
				FromLocationID:   item.FromLocationID,
				ToLocationID:     item.ToLocationID,
				BatchNumber:      item.BatchNumber,
				LotNumber:        item.LotNumber,
				Quantity:         item.Quantity,
				ReceivedQuantity: item.ReceivedQuantity,
				UnitCost:         item.UnitCost,
			}
			if item.FromLocation != nil {
				safeItem.FromLocationCode = item.FromLocation.Code
			}
			if item.ToLocation != nil {
				safeItem.ToLocationCode = item.ToLocation.Code
			}
			safe.Items[i] = safeItem
		}
	}
	return safe
}
