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

// MaterialRequestService defines the interface for material request business logic
type MaterialRequestService interface {
	CreateMaterialRequest(req *dto.CreateMaterialRequestRequest, userID uint, username string) (*models.SafeMaterialRequest, error)
	GetMaterialRequestByID(id uint) (*models.SafeMaterialRequest, error)
	ListMaterialRequests(filter *dto.MaterialRequestFilterRequest) ([]*models.SafeMaterialRequest, int64, error)
	UpdateMaterialRequest(id uint, req *dto.UpdateMaterialRequestRequest, userID uint, username string) (*models.SafeMaterialRequest, error)
	DeleteMaterialRequest(id uint, userID uint, username string) error
	ApproveMaterialRequest(id uint, userID uint, username string) (*models.SafeMaterialRequest, error)
	CancelMaterialRequest(id uint, userID uint, username string) (*models.SafeMaterialRequest, error)
}

type materialRequestService struct {
	db             *gorm.DB
	mrRepo         repository.MaterialRequestRepository
	mrItemRepo     repository.MaterialRequestItemRepository
	warehouseRepo  repository.WarehouseRepository
	materialRepo   repository.MaterialRepository
	stockRepo      repository.StockBalanceRepository
	reservationRepo repository.StockReservationRepository
	auditSvc       AuditLogService
}

// NewMaterialRequestService creates a new MaterialRequestService
func NewMaterialRequestService(
	db *gorm.DB,
	mrRepo repository.MaterialRequestRepository,
	mrItemRepo repository.MaterialRequestItemRepository,
	warehouseRepo repository.WarehouseRepository,
	materialRepo repository.MaterialRepository,
	stockRepo repository.StockBalanceRepository,
	reservationRepo repository.StockReservationRepository,
	auditSvc AuditLogService,
) MaterialRequestService {
	return &materialRequestService{
		db:             db,
		mrRepo:         mrRepo,
		mrItemRepo:     mrItemRepo,
		warehouseRepo:  warehouseRepo,
		materialRepo:   materialRepo,
		stockRepo:      stockRepo,
		reservationRepo: reservationRepo,
		auditSvc:       auditSvc,
	}
}

// CreateMaterialRequest creates a new material request with items
func (s *materialRequestService) CreateMaterialRequest(req *dto.CreateMaterialRequestRequest, userID uint, username string) (*models.SafeMaterialRequest, error) {
	// Validate MR number uniqueness
	existing, err := s.mrRepo.GetByMRNumber(req.MRNumber)
	if err == nil && existing.ID > 0 {
		return nil, errors.New("material request number already exists")
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Validate warehouse exists
	_, err = s.warehouseRepo.GetByID(req.WarehouseID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("warehouse not found")
		}
		return nil, err
	}

	// Create material request
	mr := &models.MaterialRequest{
		MRNumber:     req.MRNumber,
		WarehouseID:  req.WarehouseID,
		Department:   req.Department,
		RequestDate:  req.RequestDate,
		Purpose:      req.Purpose,
		Notes:        req.Notes,
		Status:       "draft",
		CreatedBy:    &userID,
		UpdatedBy:    &userID,
	}

	if req.RequiredDate != "" {
		mr.RequiredDate = &req.RequiredDate
	}

	// Create MR
	if err := s.mrRepo.Create(mr); err != nil {
		return nil, err
	}

	// Create items
	items := make([]*models.MaterialRequestItem, len(req.Items))
	for i, itemReq := range req.Items {
		// Validate material exists
		_, err := s.materialRepo.GetByID(int64(itemReq.MaterialID))
		if err != nil {
			return nil, errors.New("material not found")
		}

		item := &models.MaterialRequestItem{
			MaterialRequestID: mr.ID,
			MaterialID:        itemReq.MaterialID,
			RequestedQuantity: itemReq.RequestedQuantity,
			Notes:             itemReq.Notes,
			CreatedBy:         &userID,
			UpdatedBy:         &userID,
		}
		items[i] = item
	}

	// Bulk create items
	if err := s.mrItemRepo.CreateBulk(items); err != nil {
		return nil, err
	}

	// Fetch complete MR
	mr, err = s.mrRepo.GetByID(mr.ID)
	if err != nil {
		return nil, err
	}

	// Log audit
	if s.auditSvc != nil {
		_ = s.auditSvc.Log("material_requests", "CREATE", int64(mr.ID), int64(userID), username, nil, mr)
	}

	return mr.ToSafe(), nil
}

// GetMaterialRequestByID retrieves a material request by ID
func (s *materialRequestService) GetMaterialRequestByID(id uint) (*models.SafeMaterialRequest, error) {
	mr, err := s.mrRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("material request not found")
		}
		return nil, err
	}
	return mr.ToSafe(), nil
}

// ListMaterialRequests retrieves material requests with filtering
func (s *materialRequestService) ListMaterialRequests(filter *dto.MaterialRequestFilterRequest) ([]*models.SafeMaterialRequest, int64, error) {
	mrs, total, err := s.mrRepo.List(filter)
	if err != nil {
		return nil, 0, err
	}

	safeMRs := make([]*models.SafeMaterialRequest, len(mrs))
	for i, mr := range mrs {
		safeMRs[i] = mr.ToSafe()
	}

	return safeMRs, total, nil
}

// UpdateMaterialRequest updates a material request
func (s *materialRequestService) UpdateMaterialRequest(id uint, req *dto.UpdateMaterialRequestRequest, userID uint, username string) (*models.SafeMaterialRequest, error) {
	// Get existing MR (save old value for audit)
	mr, err := s.mrRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("material request not found")
		}
		return nil, err
	}
	oldValues := *mr

	// Check if MR is in draft status
	if mr.Status != "draft" {
		return nil, errors.New("can only update material requests in draft status")
	}

	// Update fields if provided
	if req.MRNumber != "" && req.MRNumber != mr.MRNumber {
		existing, err := s.mrRepo.GetByMRNumber(req.MRNumber)
		if err == nil && existing.ID > 0 {
			return nil, errors.New("material request number already exists")
		}
		mr.MRNumber = req.MRNumber
	}

	if req.WarehouseID > 0 {
		_, err = s.warehouseRepo.GetByID(req.WarehouseID)
		if err != nil {
			return nil, errors.New("warehouse not found")
		}
		mr.WarehouseID = req.WarehouseID
	}

	if req.Department != "" {
		mr.Department = req.Department
	}
	if req.RequestDate != "" {
		mr.RequestDate = req.RequestDate
	}
	if req.RequiredDate != "" {
		mr.RequiredDate = &req.RequiredDate
	}
	mr.Purpose = req.Purpose
	mr.Notes = req.Notes
	mr.UpdatedBy = &userID

	// Update MR
	if err := s.mrRepo.Update(mr); err != nil {
		return nil, err
	}

	// Update items if provided
	if len(req.Items) > 0 {
		// Delete old items
		if err := s.mrItemRepo.DeleteByMRID(id); err != nil {
			return nil, err
		}

		// Create new items
		items := make([]*models.MaterialRequestItem, len(req.Items))
		for i, itemReq := range req.Items {
			_, err := s.materialRepo.GetByID(int64(itemReq.MaterialID))
			if err != nil {
				return nil, errors.New("material not found")
			}

			item := &models.MaterialRequestItem{
				MaterialRequestID: mr.ID,
				MaterialID:        itemReq.MaterialID,
				RequestedQuantity: itemReq.RequestedQuantity,
				Notes:             itemReq.Notes,
				CreatedBy:         &userID,
				UpdatedBy:         &userID,
			}
			items[i] = item
		}

		// Bulk create items
		if err := s.mrItemRepo.CreateBulk(items); err != nil {
			return nil, err
		}
	}

	// Fetch updated MR
	mr, err = s.mrRepo.GetByID(mr.ID)
	if err != nil {
		return nil, err
	}

	// Log audit
	if s.auditSvc != nil {
		_ = s.auditSvc.Log("material_requests", "UPDATE", int64(mr.ID), int64(userID), username, &oldValues, mr)
	}

	return mr.ToSafe(), nil
}

// DeleteMaterialRequest deletes a material request
func (s *materialRequestService) DeleteMaterialRequest(id uint, userID uint, username string) error {
	mr, err := s.mrRepo.GetByID(id)
	if err != nil {
		return err
	}

	if mr.Status != "draft" {
		return errors.New("can only delete material requests in draft status")
	}

	if err := s.mrRepo.Delete(id); err != nil {
		return err
	}

	// Log audit
	if s.auditSvc != nil {
		_ = s.auditSvc.Log("material_requests", "DELETE", int64(id), int64(userID), username, mr, nil)
	}

	return nil
}

// ApproveMaterialRequest approves a material request
func (s *materialRequestService) ApproveMaterialRequest(id uint, userID uint, username string) (*models.SafeMaterialRequest, error) {
	mr, err := s.mrRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if mr.Status != "draft" {
		return nil, errors.New("can only approve material requests in draft status")
	}

	// Start transaction for reservation logic
	err = s.db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()

		// 1. Update MR status
		if err := s.mrRepo.UpdateStatus(id, "approved", &userID, &now); err != nil {
			return err
		}

		// 2. Reserve stock for each item
		for _, item := range mr.Items {
			// Get all available stock for this material in this warehouse
			balances, err := s.stockRepo.List("material", item.MaterialID, mr.WarehouseID)
			if err != nil {
				return err
			}
			remainingToReserve := item.RequestedQuantity
			
			// Simple FIFO-ish reservation across batches/locations
			for _, balance := range balances {
				if remainingToReserve <= 0 {
					break
				}

				if balance.AvailableQuantity <= 0 {
					continue
				}

				reserveQty := balance.AvailableQuantity
				if reserveQty > remainingToReserve {
					reserveQty = remainingToReserve
				}

				// Create reservation record
				reservation := &models.StockReservation{
					ItemType:           "material",
					ItemID:             item.MaterialID,
					WarehouseID:        mr.WarehouseID,
					WarehouseLocationID: balance.WarehouseLocationID,
					BatchNumber:        balance.BatchNumber,
					LotNumber:          balance.LotNumber,
					ReservedQuantity:   reserveQty,
					ReferenceType:      "material_request",
					ReferenceID:        mr.ID,
					Status:             "active",
					CreatedBy:          &userID,
				}

				if err := tx.Create(reservation).Error; err != nil {
					return err
				}

				// Update stock balance reserved quantity
				balance.ReservedQuantity += reserveQty
				// We need a TX-aware repo or use tx directly
				if err := tx.Save(balance).Error; err != nil {
					return err
				}

				remainingToReserve -= reserveQty
			}
			// 3. If still missing stock → track for auto-PO creation
			if remainingToReserve > 0 {
				type shortfall struct {
					material *models.MaterialRequestItem
					qty      float64
				}
				_ = shortfall{}
				// collect shortfall onto a per-supplier map (done below in outer scope)
				// We use a closure variable declared before the loop
				_ = remainingToReserve
			}
		}

		// 3. Auto-create POs for items with insufficient stock (grouped by supplier)
		// Re-iterate to collect shortfalls
		type poItem struct {
			materialID uint
			name       string
			qty        float64
			unit       string
			unitPrice  float64
		}
		supplierItems := map[int64][]poItem{} // supplierID → items (use -1 for no supplier)

		for _, item := range mr.Items {
			balances, _ := s.stockRepo.List("material", item.MaterialID, mr.WarehouseID)
			available := 0.0
			for _, b := range balances {
				if b.AvailableQuantity > 0 {
					available += b.AvailableQuantity
				}
			}
			missing := item.RequestedQuantity - available
			if missing <= 0 {
				continue
			}

			// Load material with supplier info via raw DB query
			var mat models.Material
			if err2 := s.db.First(&mat, item.MaterialID).Error; err2 == nil {
				supplierKey := int64(-1)
				if mat.SupplierID != nil {
					supplierKey = *mat.SupplierID
				}
				unitPrice := 0.0
				if mat.LastPurchasePrice != nil {
					unitPrice = *mat.LastPurchasePrice
				} else if mat.StandardCost != nil {
					unitPrice = *mat.StandardCost
				}
				supplierItems[supplierKey] = append(supplierItems[supplierKey], poItem{
					materialID: uint(mat.ID),
					name:       mat.TradingName,
					qty:        missing,
					unit:       mat.Unit,
					unitPrice:  unitPrice,
				})
			}
		}

		// Create one PO per supplier group
		orderDate := now.Format("2006-01-02")
		uid := userID
		for supplierKey, items := range supplierItems {
			poNumber := "AUTO-" + now.Format("060102") + "-MR" + fmt.Sprintf("%d", id)
			if len(supplierItems) > 1 {
				poNumber += fmt.Sprintf("-S%d", supplierKey)
			}

			description := fmt.Sprintf("Tự động tạo từ KHSX #%d - thiếu tồn kho", id)

			var supplierIDUint uint
			if supplierKey > 0 {
				supplierIDUint = uint(supplierKey)
			} else {
				// Find first supplier as placeholder - or use 0 to indicate TBD
				// We need a valid supplier. If none assigned, skip PO creation for those items.
				// Instead, we'll create PO with the first available supplier
				var firstSupplier models.Supplier
				if err2 := tx.First(&firstSupplier).Error; err2 != nil {
					// No suppliers at all - skip
					continue
				}
				supplierIDUint = firstSupplier.ID
				description += " (nhà cung cấp chưa xác định - vui lòng cập nhật)"
			}

			po := &models.PurchaseOrder{
				PONumber:    poNumber,
				SupplierID:  supplierIDUint,
				WarehouseID: mr.WarehouseID,
				POType:      "material",
				OrderDate:   orderDate,
				Status:      "draft",
				Description: description,
				Notes:       fmt.Sprintf("Liên quan KHSX: %s", mr.MRNumber),
				CreatedBy:   &uid,
				UpdatedBy:   &uid,
			}

			if err2 := tx.Create(po).Error; err2 != nil {
				return err2
			}

			// Create PO items
			var subtotal float64
			for _, pi := range items {
				lineTotal := pi.qty * pi.unitPrice
				subtotal += lineTotal
				poItemNote := fmt.Sprintf("%s (%s)", pi.name, pi.unit)
				poItemRecord := &models.PurchaseOrderItem{
					PurchaseOrderID:  po.ID,
					MaterialID:       uint(pi.materialID),
					Quantity:         pi.qty,
					UnitPrice:        pi.unitPrice,
					TaxRate:          0,
					DiscountRate:     0,
					LineTotal:        lineTotal,
					ReceivedQuantity: 0,
					Notes:            poItemNote,
				}
				if err2 := tx.Create(poItemRecord).Error; err2 != nil {
					return err2
				}
			}

			// Update PO totals
			if err2 := tx.Model(po).Updates(map[string]interface{}{
				"subtotal":     subtotal,
				"total_amount": subtotal,
			}).Error; err2 != nil {
				return err2
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	result, err := s.GetMaterialRequestByID(id)
	if err != nil {
		return nil, err
	}

	// Log audit
	if s.auditSvc != nil {
		_ = s.auditSvc.Log("material_requests", "APPROVE", int64(id), int64(userID), username, nil, result)
	}

	return result, nil
}

// CancelMaterialRequest cancels a material request
func (s *materialRequestService) CancelMaterialRequest(id uint, userID uint, username string) (*models.SafeMaterialRequest, error) {
	mr, err := s.mrRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if mr.Status == "cancelled" || mr.Status == "closed" {
		return nil, errors.New("cannot cancel material request in current status")
	}

	if err := s.mrRepo.UpdateStatus(id, "cancelled", nil, nil); err != nil {
		return nil, err
	}

	result, err := s.GetMaterialRequestByID(id)
	if err != nil {
		return nil, err
	}

	// Log audit
	if s.auditSvc != nil {
		_ = s.auditSvc.Log("material_requests", "CANCEL", int64(id), int64(userID), username, nil, result)
	}

	return result, nil
}
