package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

// PurchaseOrderRepository defines the interface for purchase order data operations
type PurchaseOrderRepository interface {
	Create(po *models.PurchaseOrder) error
	GetByID(id uint) (*models.PurchaseOrder, error)
	GetByPONumber(poNumber string) (*models.PurchaseOrder, error)
	List(filter *dto.PurchaseOrderFilterRequest) ([]*models.PurchaseOrder, int64, error)
	Update(po *models.PurchaseOrder) error
	Delete(id uint) error
	GetItems(poID uint) ([]*models.PurchaseOrderItem, error)
	UpdateStatus(id uint, status string, approvedBy *uint, approvedAt *time.Time) error
	CalculateTotals(poID uint) error
	UpdateWorkflowStatus(id uint, field string, value string, notes string, updatedBy uint) error
	UpdateInvoiceInfo(id uint, invoiceStatus string, invoiceNumber string, invoiceDate string, updatedBy uint) error
	CompleteIfFullyReceived(id uint, updatedBy uint) error
}

type purchaseOrderRepository struct {
	db *gorm.DB
}

// NewPurchaseOrderRepository creates a new PurchaseOrderRepository
func NewPurchaseOrderRepository(db *gorm.DB) PurchaseOrderRepository {
	return &purchaseOrderRepository{db: db}
}

// Create creates a new purchase order
func (r *purchaseOrderRepository) Create(po *models.PurchaseOrder) error {
	return r.db.Create(po).Error
}

// GetByID retrieves a purchase order by ID with all relationships
func (r *purchaseOrderRepository) GetByID(id uint) (*models.PurchaseOrder, error) {
	var po models.PurchaseOrder
	err := r.db.
		Preload("Supplier").
		Preload("Warehouse").
		Preload("Items").
		Preload("Items.Material").
		First(&po, id).Error
	if err != nil {
		return &po, err
	}

	// Manually load user relationships to avoid GORM convention confusion with CreatedBy/UpdatedBy/ApprovedBy
	if po.CreatedBy != nil {
		var user models.User
		if e := r.db.First(&user, *po.CreatedBy).Error; e == nil {
			po.CreatedByUser = &user
		}
	}
	if po.UpdatedBy != nil {
		var user models.User
		if e := r.db.First(&user, *po.UpdatedBy).Error; e == nil {
			po.UpdatedByUser = &user
		}
	}
	if po.ApprovedBy != nil {
		var user models.User
		if e := r.db.First(&user, *po.ApprovedBy).Error; e == nil {
			po.ApprovedByUser = &user
		}
	}

	return &po, nil
}

// GetByPONumber retrieves a purchase order by PO number
func (r *purchaseOrderRepository) GetByPONumber(poNumber string) (*models.PurchaseOrder, error) {
	var po models.PurchaseOrder
	err := r.db.Where("po_number = ?", poNumber).First(&po).Error
	return &po, err
}

// List retrieves purchase orders with filtering and pagination
func (r *purchaseOrderRepository) List(filter *dto.PurchaseOrderFilterRequest) ([]*models.PurchaseOrder, int64, error) {
	var pos []*models.PurchaseOrder
	var total int64

	query := r.db.Model(&models.PurchaseOrder{})

	// Apply search filter
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("unaccent(po_number) ILIKE unaccent(?) OR unaccent(notes) ILIKE unaccent(?)", searchPattern, searchPattern)
	}

	// Apply supplier filter
	if filter.SupplierID != nil {
		query = query.Where("supplier_id = ?", *filter.SupplierID)
	}

	// Apply warehouse filter
	if filter.WarehouseID != nil {
		query = query.Where("warehouse_id = ?", *filter.WarehouseID)
	}

	// Apply status filter
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	// Apply order date range filter
	if filter.OrderDateFrom != "" {
		query = query.Where("order_date >= ?", filter.OrderDateFrom)
	}
	if filter.OrderDateTo != "" {
		query = query.Where("order_date <= ?", filter.OrderDateTo)
	}

	// Count total
	query.Count(&total)

	// Apply sorting
	sortBy := "order_date"
	if filter.SortBy != "" {
		sortBy = filter.SortBy
	}
	sortOrder := "DESC"
	if filter.SortOrder != "" {
		sortOrder = filter.SortOrder
	}
	query = query.Order(sortBy + " " + sortOrder)

	// Apply pagination
	page := 1
	if filter.Page > 0 {
		page = filter.Page
	}
	pageSize := 10
	if filter.PageSize > 0 {
		pageSize = filter.PageSize
	}
	offset := (page - 1) * pageSize
	query = query.Offset(offset).Limit(pageSize)

	// Preload relationships
	err := query.
		Preload("Supplier").
		Preload("Warehouse").
		Preload("ApprovedByUser").
		Preload("Items").
		Preload("Items.Material").
		Find(&pos).Error

	return pos, total, err
}

// Update updates a purchase order
func (r *purchaseOrderRepository) Update(po *models.PurchaseOrder) error {
	// Nil-out preloaded associations so GORM uses the FK fields (SupplierID, WarehouseID)
	// instead of the associated object's ID, which could overwrite our changes.
	po.Supplier = nil
	po.Warehouse = nil
	po.Items = nil
	return r.db.Save(po).Error
}

// Delete deletes a purchase order (items cascade via FK)
func (r *purchaseOrderRepository) Delete(id uint) error {
	return r.db.Delete(&models.PurchaseOrder{}, id).Error
}

// GetItems retrieves all items for a purchase order
func (r *purchaseOrderRepository) GetItems(poID uint) ([]*models.PurchaseOrderItem, error) {
	var items []*models.PurchaseOrderItem
	err := r.db.
		Preload("Material").
		Where("purchase_order_id = ?", poID).
		Find(&items).Error
	return items, err
}

// UpdateStatus updates the status and approval fields of a purchase order
func (r *purchaseOrderRepository) UpdateStatus(id uint, status string, approvedBy *uint, approvedAt *time.Time) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if approvedBy != nil {
		updates["approved_by"] = approvedBy
	}
	if approvedAt != nil {
		updates["approved_at"] = approvedAt
	}
	return r.db.Model(&models.PurchaseOrder{}).Where("id = ?", id).Updates(updates).Error
}

// CalculateTotals recalculates the totals for a purchase order based on its items
func (r *purchaseOrderRepository) CalculateTotals(poID uint) error {
	var items []*models.PurchaseOrderItem
	if err := r.db.Where("purchase_order_id = ?", poID).Find(&items).Error; err != nil {
		return err
	}

	var subtotal, taxAmount, discountAmount, totalAmount float64

	for _, item := range items {
		// Calculate base amount (without tax/discount)
		baseAmount := item.Quantity * item.UnitPrice
		
		// Calculate tax and discount amounts
		itemTaxAmount := baseAmount * (item.TaxRate / 100)
		itemDiscountAmount := baseAmount * (item.DiscountRate / 100)
		
		// Accumulate totals
		subtotal += baseAmount
		taxAmount += itemTaxAmount
		discountAmount += itemDiscountAmount
		totalAmount += item.LineTotal
	}

	// Update PO totals
	return r.db.Model(&models.PurchaseOrder{}).
		Where("id = ?", poID).
		Updates(map[string]interface{}{
			"subtotal":        subtotal,
			"tax_amount":      taxAmount,
			"discount_amount": discountAmount,
			"total_amount":    totalAmount,
		}).Error
}

// UpdateWorkflowStatus updates a single workflow status field (order_status or payment_status)
func (r *purchaseOrderRepository) UpdateWorkflowStatus(id uint, field string, value string, notes string, updatedBy uint) error {
	updates := map[string]interface{}{
		field:        value,
		"updated_by": updatedBy,
	}
	// NOTE: 'notes' here is for audit log only, NOT stored in PO.notes field
	// to avoid overwriting the general PO notes on repeated workflow updates
	return r.db.Model(&models.PurchaseOrder{}).Where("id = ?", id).Updates(updates).Error
}

// UpdateInvoiceInfo updates invoice-related fields
func (r *purchaseOrderRepository) UpdateInvoiceInfo(id uint, invoiceStatus string, invoiceNumber string, invoiceDate string, updatedBy uint) error {
	updates := map[string]interface{}{
		"invoice_status": invoiceStatus,
		"updated_by":     updatedBy,
	}
	if invoiceNumber != "" {
		updates["invoice_number"] = invoiceNumber
	}
	if invoiceDate != "" {
		updates["invoice_date"] = invoiceDate
	}
	return r.db.Model(&models.PurchaseOrder{}).Where("id = ?", id).Updates(updates).Error
}

// CompleteIfFullyReceived checks if all PO items are fully received and marks PO as completed
func (r *purchaseOrderRepository) CompleteIfFullyReceived(id uint, updatedBy uint) error {
	var po models.PurchaseOrder
	if err := r.db.Preload("Items").First(&po, id).Error; err != nil {
		return err
	}
	if po.Status != "approved" {
		return nil // Only auto-complete approved POs
	}
	allReceived := true
	for _, item := range po.Items {
		if item.ReceivedQuantity < item.Quantity {
			allReceived = false
			break
		}
	}
	if allReceived && len(po.Items) > 0 {
		return r.db.Model(&models.PurchaseOrder{}).Where("id = ?", id).Updates(map[string]interface{}{
			"status":         "completed",
			"receipt_status": "completed",
			"updated_by":     updatedBy,
		}).Error
	}
	return nil
}

