package service

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

// PurchaseOrderService defines the interface for purchase order business logic
type PurchaseOrderService interface {
	CreatePurchaseOrder(req *dto.CreatePurchaseOrderRequest, userID uint) (*models.SafePurchaseOrder, error)
	GetPurchaseOrderByID(id uint) (*models.SafePurchaseOrder, error)
	ListPurchaseOrders(filter *dto.PurchaseOrderFilterRequest) ([]*models.SafePurchaseOrder, int64, error)
	UpdatePurchaseOrder(id uint, req *dto.UpdatePurchaseOrderRequest, userID uint) (*models.SafePurchaseOrder, error)
	DeletePurchaseOrder(id uint) error
	ApprovePurchaseOrder(id uint, userID uint) (*models.SafePurchaseOrder, error)
	CancelPurchaseOrder(id uint) (*models.SafePurchaseOrder, error)
}

type purchaseOrderService struct {
	poRepo         repository.PurchaseOrderRepository
	poItemRepo     repository.PurchaseOrderItemRepository
	supplierRepo   repository.SupplierRepository
	warehouseRepo  repository.WarehouseRepository
}

// NewPurchaseOrderService creates a new PurchaseOrderService
func NewPurchaseOrderService(
	poRepo repository.PurchaseOrderRepository,
	poItemRepo repository.PurchaseOrderItemRepository,
	supplierRepo repository.SupplierRepository,
	warehouseRepo repository.WarehouseRepository,
) PurchaseOrderService {
	return &purchaseOrderService{
		poRepo:        poRepo,
		poItemRepo:    poItemRepo,
		supplierRepo:  supplierRepo,
		warehouseRepo: warehouseRepo,
	}
}

// CreatePurchaseOrder creates a new purchase order with items
func (s *purchaseOrderService) CreatePurchaseOrder(req *dto.CreatePurchaseOrderRequest, userID uint) (*models.SafePurchaseOrder, error) {
	// Validate PO number uniqueness
	existing, err := s.poRepo.GetByPONumber(req.PONumber)
	if err == nil && existing.ID > 0 {
		return nil, errors.New("purchase order number already exists")
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Validate supplier exists
	_, err = s.supplierRepo.GetByID(req.SupplierID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("supplier not found")
		}
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

	// Create purchase order
	po := &models.PurchaseOrder{
		PONumber:             req.PONumber,
		SupplierID:           req.SupplierID,
		WarehouseID:          req.WarehouseID,
		OrderDate:            req.OrderDate,
		PaymentTerms:         req.PaymentTerms,
		ShippingMethod:       req.ShippingMethod,
		Notes:                req.Notes,
		Status:               "draft",
		CreatedBy:            &userID,
		UpdatedBy:            &userID,
	}

	// Set expected delivery date if provided
	if req.ExpectedDeliveryDate != "" {
		po.ExpectedDeliveryDate = &req.ExpectedDeliveryDate
	}

	// Create PO
	if err := s.poRepo.Create(po); err != nil {
		return nil, err
	}

	// Create items
	items := make([]*models.PurchaseOrderItem, len(req.Items))
	for i, itemReq := range req.Items {
		item := &models.PurchaseOrderItem{
			PurchaseOrderID: po.ID,
			MaterialID:      itemReq.MaterialID,
			Quantity:        itemReq.Quantity,
			UnitPrice:       itemReq.UnitPrice,
			TaxRate:         itemReq.TaxRate,
			DiscountRate:    itemReq.DiscountRate,
			Notes:           itemReq.Notes,
			CreatedBy:       &userID,
			UpdatedBy:       &userID,
		}
		// Calculate line total
		item.CalculateLineTotal()
		items[i] = item
	}

	// Bulk create items
	if err := s.poItemRepo.CreateBulk(items); err != nil {
		return nil, err
	}

	// Calculate and update totals
	if err := s.poRepo.CalculateTotals(po.ID); err != nil {
		return nil, err
	}

	// Fetch complete PO with items and relationships
	po, err = s.poRepo.GetByID(po.ID)
	if err != nil {
		return nil, err
	}

	return po.ToSafe(), nil
}

// GetPurchaseOrderByID retrieves a purchase order by ID
func (s *purchaseOrderService) GetPurchaseOrderByID(id uint) (*models.SafePurchaseOrder, error) {
	po, err := s.poRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("purchase order not found")
		}
		return nil, err
	}
	return po.ToSafe(), nil
}

// ListPurchaseOrders retrieves purchase orders with filtering
func (s *purchaseOrderService) ListPurchaseOrders(filter *dto.PurchaseOrderFilterRequest) ([]*models.SafePurchaseOrder, int64, error) {
	pos, total, err := s.poRepo.List(filter)
	if err != nil {
		return nil, 0, err
	}

	safePOs := make([]*models.SafePurchaseOrder, len(pos))
	for i, po := range pos {
		safePOs[i] = po.ToSafe()
	}

	return safePOs, total, nil
}

// UpdatePurchaseOrder updates a purchase order (only if status is draft)
func (s *purchaseOrderService) UpdatePurchaseOrder(id uint, req *dto.UpdatePurchaseOrderRequest, userID uint) (*models.SafePurchaseOrder, error) {
	// Get existing PO
	po, err := s.poRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("purchase order not found")
		}
		return nil, err
	}

	// Check if PO is in draft status
	if po.Status != "draft" {
		return nil, errors.New("can only update purchase orders in draft status")
	}

	// Validate PO number uniqueness if changed
	if req.PONumber != "" && req.PONumber != po.PONumber {
		existing, err := s.poRepo.GetByPONumber(req.PONumber)
		if err == nil && existing.ID > 0 {
			return nil, errors.New("purchase order number already exists")
		}
		if err != nil && err != gorm.ErrRecordNotFound {
			return nil, err
		}
		po.PONumber = req.PONumber
	}

	// Update fields if provided
	if req.SupplierID > 0 {
		// Validate supplier exists
		_, err = s.supplierRepo.GetByID(req.SupplierID)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				return nil, errors.New("supplier not found")
			}
			return nil, err
		}
		po.SupplierID = req.SupplierID
	}

	if req.WarehouseID > 0 {
		// Validate warehouse exists
		_, err = s.warehouseRepo.GetByID(req.WarehouseID)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				return nil, errors.New("warehouse not found")
			}
			return nil, err
		}
		po.WarehouseID = req.WarehouseID
	}

	if req.OrderDate != "" {
		po.OrderDate = req.OrderDate
	}
	if req.ExpectedDeliveryDate != "" {
		po.ExpectedDeliveryDate = &req.ExpectedDeliveryDate
	}
	po.PaymentTerms = req.PaymentTerms
	po.ShippingMethod = req.ShippingMethod
	po.Notes = req.Notes
	po.UpdatedBy = &userID

	// Update PO
	if err := s.poRepo.Update(po); err != nil {
		return nil, err
	}

	// Update items if provided
	if len(req.Items) > 0 {
		// Delete old items
		if err := s.poItemRepo.DeleteByPOID(id); err != nil {
			return nil, err
		}

		// Create new items
		items := make([]*models.PurchaseOrderItem, len(req.Items))
		for i, itemReq := range req.Items {
			item := &models.PurchaseOrderItem{
				PurchaseOrderID: po.ID,
				MaterialID:      itemReq.MaterialID,
				Quantity:        itemReq.Quantity,
				UnitPrice:       itemReq.UnitPrice,
				TaxRate:         itemReq.TaxRate,
				DiscountRate:    itemReq.DiscountRate,
				Notes:           itemReq.Notes,
				CreatedBy:       &userID,
				UpdatedBy:       &userID,
			}
			// Calculate line total
			item.CalculateLineTotal()
			items[i] = item
		}

		// Bulk create items
		if err := s.poItemRepo.CreateBulk(items); err != nil {
			return nil, err
		}

		// Recalculate totals
		if err := s.poRepo.CalculateTotals(po.ID); err != nil {
			return nil, err
		}
	}

	// Fetch complete PO with items and relationships
	po, err = s.poRepo.GetByID(po.ID)
	if err != nil {
		return nil, err
	}

	return po.ToSafe(), nil
}

// DeletePurchaseOrder deletes a purchase order (only if status is draft)
func (s *purchaseOrderService) DeletePurchaseOrder(id uint) error {
	// Get existing PO
	po, err := s.poRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("purchase order not found")
		}
		return err
	}

	// Check if PO is in draft status
	if po.Status != "draft" {
		return errors.New("can only delete purchase orders in draft status")
	}

	// Delete PO (items will cascade delete)
	return s.poRepo.Delete(id)
}

// ApprovePurchaseOrder approves a purchase order (draft → approved)
func (s *purchaseOrderService) ApprovePurchaseOrder(id uint, userID uint) (*models.SafePurchaseOrder, error) {
	// Get existing PO
	po, err := s.poRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("purchase order not found")
		}
		return nil, err
	}

	// Check if PO is in draft status
	if po.Status != "draft" {
		return nil, errors.New("can only approve purchase orders in draft status")
	}

	// Update status to approved
	now := time.Now()
	if err := s.poRepo.UpdateStatus(id, "approved", &userID, &now); err != nil {
		return nil, err
	}

	// Fetch updated PO
	po, err = s.poRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return po.ToSafe(), nil
}

// CancelPurchaseOrder cancels a purchase order
func (s *purchaseOrderService) CancelPurchaseOrder(id uint) (*models.SafePurchaseOrder, error) {
	// Get existing PO
	po, err := s.poRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("purchase order not found")
		}
		return nil, err
	}

	// Check if PO is not already cancelled
	if po.Status == "cancelled" {
		return nil, errors.New("purchase order is already cancelled")
	}

	// Update status to cancelled
	if err := s.poRepo.UpdateStatus(id, "cancelled", nil, nil); err != nil {
		return nil, err
	}

	// Fetch updated PO
	po, err = s.poRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return po.ToSafe(), nil
}
