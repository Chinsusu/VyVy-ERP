package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

type ReturnOrderRepository struct {
	db *gorm.DB
}

func NewReturnOrderRepository(db *gorm.DB) *ReturnOrderRepository {
	return &ReturnOrderRepository{db: db}
}

func (r *ReturnOrderRepository) Create(ro *models.ReturnOrder) error {
	return r.db.Create(ro).Error
}

func (r *ReturnOrderRepository) GetByID(id uint) (*models.ReturnOrder, error) {
	var ro models.ReturnOrder
	err := r.db.
		Preload("DeliveryOrder").
		Preload("Carrier").
		Preload("Items.FinishedProduct").
		Preload("Items.Warehouse").
		Preload("CreatedByUser").
		First(&ro, id).Error
	if err != nil {
		return nil, err
	}
	return &ro, nil
}

func (r *ReturnOrderRepository) List(filters map[string]interface{}, offset, limit int) ([]models.ReturnOrder, int64, error) {
	var ros []models.ReturnOrder
	var total int64

	query := r.db.Model(&models.ReturnOrder{})
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	query.Count(&total)

	if limit <= 0 {
		limit = 20
	}

	err := query.
		Preload("DeliveryOrder").
		Preload("Carrier").
		Preload("Items").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&ros).Error

	return ros, total, err
}

func (r *ReturnOrderRepository) Update(ro *models.ReturnOrder) error {
	return r.db.Save(ro).Error
}

func (r *ReturnOrderRepository) Delete(id uint) error {
	return r.db.Delete(&models.ReturnOrder{}, id).Error
}

func (r *ReturnOrderRepository) GetLastReturnNumber() (string, error) {
	var ro models.ReturnOrder
	err := r.db.Unscoped().Order("id DESC").First(&ro).Error
	if err != nil {
		return "", err
	}
	return ro.ReturnNumber, nil
}

func (r *ReturnOrderRepository) GetItemByID(itemID uint) (*models.ReturnOrderItem, error) {
	var item models.ReturnOrderItem
	err := r.db.First(&item, itemID).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *ReturnOrderRepository) UpdateItem(item *models.ReturnOrderItem) error {
	return r.db.Save(item).Error
}
