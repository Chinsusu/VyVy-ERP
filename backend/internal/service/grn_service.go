package service

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

// GRNService defines the interface for GRN business logic
type GRNService interface {
	CreateGRN(req *dto.CreateGRNRequest, userID uint) (*models.SafeGoodsReceiptNote, error)
	GetGRNByID(id uint) (*models.SafeGoodsReceiptNote, error)
	ListGRNs(filter *dto.GRNFilterRequest) ([]*models.SafeGoodsReceiptNote, int64, error)
	UpdateQC(id uint, req *dto.UpdateGRNQCRequest, userID uint) (*models.SafeGoodsReceiptNote, error)
	PostGRN(id uint, userID uint) (*models.SafeGoodsReceiptNote, error)
}

type grnService struct {
	db                *gorm.DB
	grnRepo           repository.GoodsReceiptNoteRepository
	grnItemRepo       repository.GoodsReceiptNoteItemRepository
	poRepo            repository.PurchaseOrderRepository
	poItemRepo        repository.PurchaseOrderItemRepository
	warehouseRepo     repository.WarehouseRepository
	stockLedgerRepo   repository.StockLedgerRepository
	stockBalanceRepo  repository.StockBalanceRepository
}

// NewGRNService creates a new GRNService
func NewGRNService(
	db *gorm.DB,
	grnRepo repository.GoodsReceiptNoteRepository,
	grnItemRepo repository.GoodsReceiptNoteItemRepository,
	poRepo repository.PurchaseOrderRepository,
	poItemRepo repository.PurchaseOrderItemRepository,
	warehouseRepo repository.WarehouseRepository,
	stockLedgerRepo repository.StockLedgerRepository,
	stockBalanceRepo repository.StockBalanceRepository,
) GRNService {
	return &grnService{
		db:               db,
		grnRepo:          grnRepo,
		grnItemRepo:      grnItemRepo,
		poRepo:           poRepo,
		poItemRepo:       poItemRepo,
		warehouseRepo:    warehouseRepo,
		stockLedgerRepo:  stockLedgerRepo,
		stockBalanceRepo: stockBalanceRepo,
	}
}

func (s *grnService) CreateGRN(req *dto.CreateGRNRequest, userID uint) (*models.SafeGoodsReceiptNote, error) {
	// Validate GRN number uniqueness
	existing, err := s.grnRepo.GetByGRNNumber(req.GRNNumber)
	if err == nil && existing.ID > 0 {
		return nil, errors.New("GRN number already exists")
	}

	// Validate PO exists and is approved
	po, err := s.poRepo.GetByID(req.PurchaseOrderID)
	if err != nil {
		return nil, errors.New("purchase order not found")
	}
	if po.Status != "approved" {
		return nil, errors.New("can only create GRN for approved purchase orders")
	}

	// Validate warehouse exists
	_, err = s.warehouseRepo.GetByID(req.WarehouseID)
	if err != nil {
		return nil, errors.New("warehouse not found")
	}

	grn := &models.GoodsReceiptNote{
		GRNNumber:       req.GRNNumber,
		PurchaseOrderID: req.PurchaseOrderID,
		WarehouseID:     req.WarehouseID,
		ReceiptDate:     req.ReceiptDate,
		Status:          "pending_qc",
		Notes:           req.Notes,
		CreatedBy:       &userID,
		UpdatedBy:       &userID,
	}

	// Start transaction
	err = s.db.Transaction(func(tx *gorm.DB) error {
		txGRNRepo := repository.NewGoodsReceiptNoteRepository(tx)
		txGRNItemRepo := repository.NewGoodsReceiptNoteItemRepository(tx)

		if err := txGRNRepo.Create(grn); err != nil {
			return err
		}

		items := make([]*models.GoodsReceiptNoteItem, len(req.Items))
		for i, itemReq := range req.Items {
			items[i] = &models.GoodsReceiptNoteItem{
				GRNID:               grn.ID,
				POItemID:            itemReq.POItemID,
				MaterialID:          itemReq.MaterialID,
				WarehouseLocationID: itemReq.WarehouseLocationID,
				Quantity:            itemReq.Quantity,
				UnitCost:            itemReq.UnitCost,
				BatchNumber:         itemReq.BatchNumber,
				LotNumber:           itemReq.LotNumber,
				Notes:               itemReq.Notes,
				CreatedBy:           &userID,
				UpdatedBy:           &userID,
			}
			if itemReq.ManufactureDate != "" {
				items[i].ManufactureDate = &itemReq.ManufactureDate
			}
			if itemReq.ExpiryDate != "" {
				items[i].ExpiryDate = &itemReq.ExpiryDate
			}
		}

		if err := txGRNItemRepo.CreateBulk(items); err != nil {
			return err
		}

		// Fetch complete GRN for return
		updatedGRN, err := txGRNRepo.GetByID(grn.ID)
		if err != nil {
			return err
		}
		*grn = *updatedGRN
		return nil
	})

	if err != nil {
		return nil, err
	}

	return grn.ToSafe(), nil
}

func (s *grnService) GetGRNByID(id uint) (*models.SafeGoodsReceiptNote, error) {
	grn, err := s.grnRepo.GetByID(id)
	if err != nil {
		return nil, errors.New("GRN not found")
	}
	return grn.ToSafe(), nil
}

func (s *grnService) ListGRNs(filter *dto.GRNFilterRequest) ([]*models.SafeGoodsReceiptNote, int64, error) {
	grns, total, err := s.grnRepo.List(filter)
	if err != nil {
		return nil, 0, err
	}

	safeGRNs := make([]*models.SafeGoodsReceiptNote, len(grns))
	for i, grn := range grns {
		safeGRNs[i] = grn.ToSafe()
	}

	return safeGRNs, total, nil
}

func (s *grnService) UpdateQC(id uint, req *dto.UpdateGRNQCRequest, userID uint) (*models.SafeGoodsReceiptNote, error) {
	grn, err := s.grnRepo.GetByID(id)
	if err != nil {
		return nil, errors.New("GRN not found")
	}

	if grn.Posted {
		return nil, errors.New("cannot update QC for posted GRN")
	}

	now := time.Now()
	// Overall status for GRN based on items
	overallQCStatus := "pass"

	err = s.db.Transaction(func(tx *gorm.DB) error {
		txGRNRepo := repository.NewGoodsReceiptNoteRepository(tx)
		txGRNItemRepo := repository.NewGoodsReceiptNoteItemRepository(tx)

		for itemID, qcReq := range req.Items {
			if qcReq.QCStatus == "fail" || qcReq.QCStatus == "partial" {
				overallQCStatus = "conditional"
			}
			if err := txGRNItemRepo.UpdateQC(itemID, qcReq.AcceptedQuantity, qcReq.RejectedQuantity, qcReq.QCStatus, qcReq.QCNotes); err != nil {
				return err
			}
		}

		if err := txGRNRepo.UpdateQC(id, overallQCStatus, userID, now, req.Notes); err != nil {
			return err
		}

		updatedGRN, err := txGRNRepo.GetByID(id)
		if err != nil {
			return err
		}
		*grn = *updatedGRN
		return nil
	})

	if err != nil {
		return nil, err
	}

	return grn.ToSafe(), nil
}

func (s *grnService) PostGRN(id uint, userID uint) (*models.SafeGoodsReceiptNote, error) {
	grn, err := s.grnRepo.GetByID(id)
	if err != nil {
		return nil, errors.New("GRN not found")
	}

	if grn.Status != "qc_completed" {
		return nil, errors.New("GRN must be QC completed before posting")
	}

	if grn.Posted {
		return nil, errors.New("GRN is already posted")
	}

	now := time.Now()

	err = s.db.Transaction(func(tx *gorm.DB) error {
		txGRNRepo := repository.NewGoodsReceiptNoteRepository(tx)
		txStockLedgerRepo := repository.NewStockLedgerRepository(tx)
		txStockBalanceRepo := repository.NewStockBalanceRepository(tx)

		for _, item := range grn.Items {
			// Only post accepted quantity
			if item.AcceptedQuantity <= 0 {
				continue
			}

			// 1. Get latest balance for ledger entry
			prevBalance, err := txStockLedgerRepo.GetLatestBalance("material", item.MaterialID, grn.WarehouseID, item.WarehouseLocationID, item.BatchNumber, item.LotNumber)
			if err != nil {
				return err
			}

			newBalance := prevBalance + item.AcceptedQuantity

			// 2. Create Stock Ledger entry
			ledgerEntry := &models.StockLedger{
				TransactionType:     "GRN",
				TransactionNumber:   grn.GRNNumber,
				TransactionDate:     now,
				ItemType:            "material",
				ItemID:              item.MaterialID,
				WarehouseID:         grn.WarehouseID,
				WarehouseLocationID: item.WarehouseLocationID,
				BatchNumber:         item.BatchNumber,
				LotNumber:           item.LotNumber,
				ExpiryDate:          item.ExpiryDate,
				Quantity:            item.AcceptedQuantity,
				UnitCost:            item.UnitCost,
				TotalCost:           item.AcceptedQuantity * item.UnitCost,
				BalanceQuantity:     newBalance,
				ReferenceType:       "GRN",
				ReferenceID:         grn.ID,
				CreatedBy:           &userID,
			}
			if err := txStockLedgerRepo.Create(ledgerEntry); err != nil {
				return err
			}

			// 3. Update Stock Balance (Upsert)
			balance, err := txStockBalanceRepo.Get("material", item.MaterialID, grn.WarehouseID, item.WarehouseLocationID, item.BatchNumber, item.LotNumber)
			if err != nil && err != gorm.ErrRecordNotFound {
				return err
			}

			if err == gorm.ErrRecordNotFound {
				// Create new balance
				balance = &models.StockBalance{
					ItemType:            "material",
					ItemID:              item.MaterialID,
					WarehouseID:         grn.WarehouseID,
					WarehouseLocationID: item.WarehouseLocationID,
					BatchNumber:         item.BatchNumber,
					LotNumber:           item.LotNumber,
					ManufactureDate:     item.ManufactureDate,
					ExpiryDate:          item.ExpiryDate,
					Quantity:            item.AcceptedQuantity,
					UnitCost:            item.UnitCost,
					TotalCost:           item.AcceptedQuantity * item.UnitCost,
					LastTransactionDate: &now,
				}
			} else {
				// Update existing balance (using weighted average cost if possible, simple update for now)
				// total_cost = (prev_qty * prev_cost) + (new_qty * new_cost)
				newTotalCost := balance.TotalCost + (item.AcceptedQuantity * item.UnitCost)
				newTotalQty := balance.Quantity + item.AcceptedQuantity
				
				balance.Quantity = newTotalQty
				balance.TotalCost = newTotalCost
				if newTotalQty > 0 {
					balance.UnitCost = newTotalCost / newTotalQty
				}
				balance.LastTransactionDate = &now
			}

			if err := txStockBalanceRepo.Upsert(balance); err != nil {
				return err
			}

			// 4. Update Purchase Order Item fulfillment
			if err := tx.Model(&models.PurchaseOrderItem{}).
				Where("id = ?", item.POItemID).
				Update("received_quantity", gorm.Expr("received_quantity + ?", item.AcceptedQuantity)).Error; err != nil {
				return err
			}
		}

		// 5. Update GRN status to posted
		if err := txGRNRepo.UpdatePosting(id, userID, now); err != nil {
			return err
		}

		updatedGRN, err := txGRNRepo.GetByID(id)
		if err != nil {
			return err
		}
		*grn = *updatedGRN
		return nil
	})

	if err != nil {
		return nil, err
	}

	return grn.ToSafe(), nil
}
