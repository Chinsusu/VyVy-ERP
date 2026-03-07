package service

import (
	"fmt"
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

// GRNService defines the interface for GRN business logic
type GRNService interface {
	CreateGRN(req *dto.CreateGRNRequest, userID uint, username string) (*models.SafeGoodsReceiptNote, error)
	GetGRNByID(id uint) (*models.SafeGoodsReceiptNote, error)
	ListGRNs(filter *dto.GRNFilterRequest) ([]*models.SafeGoodsReceiptNote, int64, error)
	UpdateQC(id uint, req *dto.UpdateGRNQCRequest, userID uint, username string) (*models.SafeGoodsReceiptNote, error)
	PostGRN(id uint, userID uint, username string) (*models.SafeGoodsReceiptNote, error)
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
	ppRepo            repository.ProductionPlanRepository // for KHSX status hooks
	auditSvc          AuditLogService
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
	ppRepo repository.ProductionPlanRepository,
	auditSvc AuditLogService,
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
		ppRepo:           ppRepo,
		auditSvc:         auditSvc,
	}
}

func (s *grnService) CreateGRN(req *dto.CreateGRNRequest, userID uint, username string) (*models.SafeGoodsReceiptNote, error) {
	// Validate GRN number uniqueness
	existing, err := s.grnRepo.GetByGRNNumber(req.GRNNumber)
	if err == nil && existing.ID > 0 {
		return nil, errors.New("GRN number already exists")
	}

	// Validate PO exists and is approved (if PO is specified)
	if req.PurchaseOrderID > 0 {
		po, err := s.poRepo.GetByID(req.PurchaseOrderID)
		if err != nil {
			return nil, errors.New("purchase order not found")
		}
		if po.Status != "approved" {
			return nil, errors.New("can only create GRN for approved purchase orders")
		}
	}

	// Validate warehouse exists
	_, err = s.warehouseRepo.GetByID(req.WarehouseID)
	if err != nil {
		return nil, errors.New("warehouse not found")
	}

	grn := &models.GoodsReceiptNote{
		GRNNumber:       req.GRNNumber,
		WarehouseID:     req.WarehouseID,
		ReceiptDate:     req.ReceiptDate,
		Status:          "pending_qc",
		Notes:           req.Notes,
		CreatedBy:       &userID,
		UpdatedBy:       &userID,
	}
	if req.PurchaseOrderID > 0 {
		grn.PurchaseOrderID = &req.PurchaseOrderID
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

	// Audit log: CREATE
	_ = s.auditSvc.Log("goods_receipt_notes", "CREATE", int64(grn.ID), int64(userID), username, nil, map[string]interface{}{
		"grn_number":  grn.GRNNumber,
		"po_id":       grn.PurchaseOrderID,
		"warehouse_id": grn.WarehouseID,
		"receipt_date": grn.ReceiptDate,
		"items_count":  len(grn.Items),
	})

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

func (s *grnService) UpdateQC(id uint, req *dto.UpdateGRNQCRequest, userID uint, username string) (*models.SafeGoodsReceiptNote, error) {
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
			if err := txGRNItemRepo.UpdateQC(itemID, qcReq.ReceivedQuantity, qcReq.AcceptedQuantity, qcReq.RejectedQuantity, qcReq.QCStatus, qcReq.QCNotes); err != nil {
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

	// Audit log: UPDATE_QC — build per-item detail
	itemDetails := make([]map[string]interface{}, 0, len(req.Items))
	// Build lookup for item material names from updated grn
	itemNameMap := make(map[uint]string)
	for _, grnItem := range grn.Items {
		if grnItem.Material != nil {
			itemNameMap[grnItem.ID] = grnItem.Material.TradingName
		} else {
			itemNameMap[grnItem.ID] = fmt.Sprintf("Item #%d", grnItem.ID)
		}
	}
	for itemID, qcReq := range req.Items {
		receivedQty := qcReq.AcceptedQuantity + qcReq.RejectedQuantity // fallback
		if qcReq.ReceivedQuantity != nil {
			receivedQty = *qcReq.ReceivedQuantity
		}
		detail := map[string]interface{}{
			"item_id":           itemID,
			"material":          itemNameMap[itemID],
			"received_quantity": receivedQty,
			"accepted_quantity": qcReq.AcceptedQuantity,
			"rejected_quantity": qcReq.RejectedQuantity,
			"qc_status":         qcReq.QCStatus,
		}
		itemDetails = append(itemDetails, detail)
	}
	_ = s.auditSvc.Log("goods_receipt_notes", "UPDATE_QC", int64(id), int64(userID), username, nil, map[string]interface{}{
		"qc_status": overallQCStatus,
		"notes":     req.Notes,
		"items":     itemDetails,
	})

	return grn.ToSafe(), nil
}

func (s *grnService) PostGRN(id uint, userID uint, username string) (*models.SafeGoodsReceiptNote, error) {
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

	// B7: Auto-complete PO if all items fully received
	if grn.PurchaseOrderID != nil {
		_ = s.poRepo.CompleteIfFullyReceived(*grn.PurchaseOrderID, userID)
		// Hook: tìm KHSX liên kết với PO này, cập nhật procurement_status='receiving'
		if s.ppRepo != nil {
			po, err2 := s.poRepo.GetByID(*grn.PurchaseOrderID)
			if err2 == nil && len(po.Notes) >= 10 {
				var plans []models.ProductionPlan
				if err3 := s.db.Where("? ILIKE '%' || plan_number || '%'", po.Notes).Find(&plans).Error; err3 == nil {
					for _, p := range plans {
						_ = s.ppRepo.UpdateProcurementStatus(p.ID, "receiving")
					}
				}
			}
		}
	}

	// Audit log: POST
	_ = s.auditSvc.Log("goods_receipt_notes", "POST", int64(id), int64(userID), username, nil, map[string]interface{}{
		"grn_number": grn.GRNNumber,
		"status":     "posted",
	})

	return grn.ToSafe(), nil
}

