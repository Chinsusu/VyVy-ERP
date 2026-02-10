package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"

	"gorm.io/gorm"
)

// PurchaseOrderItemRepository defines the interface for purchase order item data operations
type PurchaseOrderItemRepository interface {
	Create(item *models.PurchaseOrderItem) error
	CreateBulk(items []*models.PurchaseOrderItem) error
	GetByID(id uint) (*models.PurchaseOrderItem, error)
	ListByPOID(poID uint) ([]*models.PurchaseOrderItem, error)
	Update(item *models.PurchaseOrderItem) error
	Delete(id uint) error
	DeleteByPOID(poID uint) error
}

type purchaseOrderItemRepository struct {
	db *gorm.DB
}

// NewPurchaseOrderItemRepository creates a new PurchaseOrderItemRepository
func NewPurchaseOrderItemRepository(db *gorm.DB) PurchaseOrderItemRepository {
	return &purchaseOrderItemRepository{db: db}
}

// Create creates a new purchase order item
func (r *purchaseOrderItemRepository) Create(item *models.PurchaseOrderItem) error {
	return r.db.Create(item).Error
}

// CreateBulk creates multiple purchase order items in a single transaction
func (r *purchaseOrderItemRepository) CreateBulk(items []*models.PurchaseOrderItem) error {
	if len(items) == 0 {
		return nil
	}
	return r.db.Create(&items).Error
}

// GetByID retrieves a purchase order item by ID
func (r *purchaseOrderItemRepository) GetByID(id uint) (*models.PurchaseOrderItem, error) {
	var item models.PurchaseOrderItem
	err := r.db.Preload("Material").First(&item, id).Error
	return &item, err
}

// ListByPOID retrieves all items for a specific purchase order
func (r *purchaseOrderItemRepository) ListByPOID(poID uint) ([]*models.PurchaseOrderItem, error) {
	var items []*models.PurchaseOrderItem
	err := r.db.
		Preload("Material").
		Where("purchase_order_id = ?", poID).
		Find(&items).Error
	return items, err
}

// Update updates a purchase order item
func (r *purchaseOrderItemRepository) Update(item *models.PurchaseOrderItem) error {
	return r.db.Save(item).Error
}

// Delete deletes a purchase order item
func (r *purchaseOrderItemRepository) Delete(id uint) error {
	return r.db.Delete(&models.PurchaseOrderItem{}, id).Error
}

// DeleteByPOID deletes all items for a specific purchase order
func (r *purchaseOrderItemRepository) DeleteByPOID(poID uint) error {
	return r.db.Where("purchase_order_id = ?", poID).Delete(&models.PurchaseOrderItem{}).Error
}
