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

type StockAdjustmentService interface {
	CreateAdjustment(req *dto.CreateStockAdjustmentRequest, userID uint) (*models.SafeStockAdjustment, error)
	GetAdjustmentByID(id uint) (*models.SafeStockAdjustment, error)
	ListAdjustments(filter *dto.StockAdjustmentFilterRequest) ([]*models.SafeStockAdjustment, int64, error)
	PostAdjustment(id uint, userID uint) (*models.SafeStockAdjustment, error)
	CancelAdjustment(id uint, userID uint) (*models.SafeStockAdjustment, error)
}

type stockAdjustmentService struct {
	db              *gorm.DB
	saRepo          repository.StockAdjustmentRepository
	warehouseRepo   repository.WarehouseRepository
	materialRepo    repository.MaterialRepository
	fpRepo          repository.FinishedProductRepository
	stockRepo       repository.StockBalanceRepository
}

func NewStockAdjustmentService(
	db *gorm.DB,
	saRepo repository.StockAdjustmentRepository,
	warehouseRepo repository.WarehouseRepository,
	materialRepo repository.MaterialRepository,
	fpRepo repository.FinishedProductRepository,
	stockRepo repository.StockBalanceRepository,
) StockAdjustmentService {
	return &stockAdjustmentService{
		db:            db,
		saRepo:        saRepo,
		warehouseRepo: warehouseRepo,
		materialRepo:  materialRepo,
		fpRepo:        fpRepo,
		stockRepo:     stockRepo,
	}
}

func (s *stockAdjustmentService) CreateAdjustment(req *dto.CreateStockAdjustmentRequest, userID uint) (*models.SafeStockAdjustment, error) {
	// 1. Validate warehouse
	_, err := s.warehouseRepo.GetByID(req.WarehouseID)
	if err != nil {
		return nil, errors.New("warehouse not found")
	}

	// 2. Parse date
	adjDate, err := time.Parse("2006-01-02", req.AdjustmentDate)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}

	// 3. Generate number: ADJ-YYYY-XXXXXX
	year := time.Now().Format("2006")
	var count int64
	s.db.Model(&models.StockAdjustment{}).Where("adjustment_number LIKE ?", "ADJ-"+year+"-%").Count(&count)
	adjNumber := fmt.Sprintf("ADJ-%s-%06d", year, count+1)

	// 4. Create Header
	sa := &models.StockAdjustment{
		AdjustmentNumber: adjNumber,
		WarehouseID:      req.WarehouseID,
		AdjustmentDate:   adjDate,
		AdjustmentType:   req.AdjustmentType,
		Reason:           req.Reason,
		Notes:            req.Notes,
		Status:           "draft",
		CreatedBy:        &userID,
		UpdatedBy:        &userID,
	}

	// 5. Create Items and take snapshots
	items := make([]models.StockAdjustmentItem, len(req.Items))
	for i, itemReq := range req.Items {
		// Get current stock level
		var currentQty float64
		var unitCost float64
		
		balance, err := s.stockRepo.Get(itemReq.ItemType, itemReq.ItemID, req.WarehouseID, itemReq.WarehouseLocationID, itemReq.BatchNumber, itemReq.LotNumber)
		if err == nil && balance != nil {
			currentQty = balance.Quantity
			unitCost = balance.UnitCost
		} else {
			// If no balance, find unit cost from item master
			if itemReq.ItemType == "material" {
				m, err := s.materialRepo.GetByID(int64(itemReq.ItemID))
				if err == nil && m.StandardCost != nil {
					unitCost = *m.StandardCost
				}
			} else {
				fp, err := s.fpRepo.GetByID(itemReq.ItemID)
				if err == nil && fp.StandardCost != nil {
					unitCost = *fp.StandardCost
				}
			}
		}

		items[i] = models.StockAdjustmentItem{
			ItemType:           itemReq.ItemType,
			ItemID:             itemReq.ItemID,
			WarehouseLocationID: itemReq.WarehouseLocationID,
			BatchNumber:       itemReq.BatchNumber,
			LotNumber:         itemReq.LotNumber,
			AdjustmentQuantity: itemReq.AdjustmentQuantity,
			PreviousQuantity:   currentQty,
			NewQuantity:        currentQty + itemReq.AdjustmentQuantity,
			UnitCost:           unitCost,
			Notes:             itemReq.Notes,
			CreatedBy:         &userID,
			UpdatedBy:         &userID,
		}
	}
	sa.Items = items

	if err := s.saRepo.Create(sa); err != nil {
		return nil, err
	}

	return s.GetAdjustmentByID(sa.ID)
}

func (s *stockAdjustmentService) GetAdjustmentByID(id uint) (*models.SafeStockAdjustment, error) {
	sa, err := s.saRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	return s.MapToSafe(sa), nil
}

func (s *stockAdjustmentService) ListAdjustments(filter *dto.StockAdjustmentFilterRequest) ([]*models.SafeStockAdjustment, int64, error) {
	filters := make(map[string]interface{})
	if filter.WarehouseID > 0 {
		filters["warehouse_id"] = filter.WarehouseID
	}
	if filter.Status != "" {
		filters["status"] = filter.Status
	}
	if filter.AdjustmentNumber != "" {
		filters["adjustment_number"] = filter.AdjustmentNumber
	}
	if filter.AdjustmentType != "" {
		filters["adjustment_type"] = filter.AdjustmentType
	}

	sas, total, err := s.saRepo.List(filters, filter.Offset, filter.Limit)
	if err != nil {
		return nil, 0, err
	}

	safeSAs := make([]*models.SafeStockAdjustment, len(sas))
	for i, sa := range sas {
		safeSAs[i] = s.MapToSafe(sa)
	}

	return safeSAs, total, nil
}

func (s *stockAdjustmentService) PostAdjustment(id uint, userID uint) (*models.SafeStockAdjustment, error) {
	sa, err := s.saRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if sa.IsPosted {
		return nil, errors.New("adjustment is already posted")
	}

	now := time.Now()
	err = s.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range sa.Items {
			// 1. Update/Create Stock Balance
			var balance models.StockBalance
			err := tx.Where("item_type = ? AND item_id = ? AND warehouse_id = ?", item.ItemType, item.ItemID, sa.WarehouseID).
				Where("COALESCE(warehouse_location_id, 0) = COALESCE(?, 0)", item.WarehouseLocationID).
				Where("COALESCE(batch_number, '') = COALESCE(?, '')", item.BatchNumber).
				First(&balance).Error

			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					// Create new balance
					balance = models.StockBalance{
						ItemType:            item.ItemType,
						ItemID:              item.ItemID,
						WarehouseID:         sa.WarehouseID,
						WarehouseLocationID: item.WarehouseLocationID,
						BatchNumber:         item.BatchNumber,
						LotNumber:           item.LotNumber,
						Quantity:            item.AdjustmentQuantity,
						UnitCost:            item.UnitCost,
						TotalCost:           item.AdjustmentQuantity * item.UnitCost,
						LastTransactionDate: &now,
					}
					if item.ExpiryDate != nil {
						exp := item.ExpiryDate.Format("2006-01-02")
						balance.ExpiryDate = &exp
					}
					if err := tx.Create(&balance).Error; err != nil {
						return err
					}
				} else {
					return err
				}
			} else {
				// Update existing balance
				balance.Quantity += item.AdjustmentQuantity
				balance.TotalCost = balance.Quantity * balance.UnitCost // Simple adjustment doesn't recalculate unit cost usually
				balance.LastTransactionDate = &now
				if err := tx.Save(&balance).Error; err != nil {
					return err
				}
			}

			// 2. Create Ledger Entry
			ledger := models.StockLedger{
				TransactionType:   "adjustment",
				TransactionNumber: sa.AdjustmentNumber,
				TransactionDate:   now,
				ItemType:          item.ItemType,
				ItemID:            item.ItemID,
				WarehouseID:       sa.WarehouseID,
				WarehouseLocationID: item.WarehouseLocationID,
				BatchNumber:       item.BatchNumber,
				LotNumber:         item.LotNumber,
				Quantity:          item.AdjustmentQuantity,
				UnitCost:          item.UnitCost,
				TotalCost:         item.AdjustmentQuantity * item.UnitCost,
				BalanceQuantity:   balance.Quantity,
				ReferenceType:     "Adjustment",
				ReferenceID:       sa.ID,
				CreatedBy:         &userID,
			}
			if err := tx.Create(&ledger).Error; err != nil {
				return err
			}
		}

		// Update Header
		sa.Status = "posted"
		sa.IsPosted = true
		sa.PostedBy = &userID
		sa.PostedAt = &now
		if err := tx.Save(sa).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.GetAdjustmentByID(id)
}

func (s *stockAdjustmentService) CancelAdjustment(id uint, userID uint) (*models.SafeStockAdjustment, error) {
	sa, err := s.saRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if sa.IsPosted {
		return nil, errors.New("cannot cancel a posted adjustment")
	}

	sa.Status = "cancelled"
	sa.UpdatedBy = &userID
	if err := s.saRepo.Update(sa); err != nil {
		return nil, err
	}

	return s.MapToSafe(sa), nil
}

func (s *stockAdjustmentService) MapToSafe(sa *models.StockAdjustment) *models.SafeStockAdjustment {
	safe := &models.SafeStockAdjustment{
		ID:               sa.ID,
		AdjustmentNumber: sa.AdjustmentNumber,
		WarehouseID:      sa.WarehouseID,
		WarehouseName:    sa.Warehouse.Name,
		AdjustmentDate:   sa.AdjustmentDate,
		AdjustmentType:   sa.AdjustmentType,
		Reason:           sa.Reason,
		Status:           sa.Status,
		IsPosted:         sa.IsPosted,
		PostedAt:         sa.PostedAt,
		ApprovedAt:       sa.ApprovedAt,
		Notes:            sa.Notes,
		CreatedAt:       sa.CreatedAt,
	}
	if sa.PostedByUser != nil {
		safe.PostedByName = sa.PostedByUser.FullName
	}
	if sa.ApprovedByUser != nil {
		safe.ApprovedByName = sa.ApprovedByUser.FullName
	}
	if sa.CreatedByUser != nil {
		safe.CreatedByName = sa.CreatedByUser.FullName
	}

	if len(sa.Items) > 0 {
		safe.Items = make([]models.SafeStockAdjustmentItem, len(sa.Items))
		for i, item := range sa.Items {
			safeItem := models.SafeStockAdjustmentItem{
				ID:                 item.ID,
				ItemType:           item.ItemType,
				ItemID:             item.ItemID,
				WarehouseLocationID: item.WarehouseLocationID,
				BatchNumber:       item.BatchNumber,
				LotNumber:         item.LotNumber,
				AdjustmentQuantity: item.AdjustmentQuantity,
				PreviousQuantity:   item.PreviousQuantity,
				NewQuantity:        item.NewQuantity,
				UnitCost:           item.UnitCost,
				Notes:             item.Notes,
			}
			if item.Location != nil {
				safeItem.LocationCode = item.Location.Code
			}
			// In a real scenario we'd join item names here, but for brevity using repo preloads if available
			safe.Items[i] = safeItem
		}
	}
	return safe
}
