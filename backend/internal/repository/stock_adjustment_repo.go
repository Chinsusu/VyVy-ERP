package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

type StockAdjustmentRepository interface {
	Create(sa *models.StockAdjustment) error
	GetByID(id uint) (*models.StockAdjustment, error)
	List(filters map[string]interface{}, offset, limit int) ([]*models.StockAdjustment, int64, error)
	Update(sa *models.StockAdjustment) error
	Delete(id uint) error
}

type stockAdjustmentRepository struct {
	db *gorm.DB
}

func NewStockAdjustmentRepository(db *gorm.DB) StockAdjustmentRepository {
	return &stockAdjustmentRepository{db: db}
}

func (r *stockAdjustmentRepository) Create(sa *models.StockAdjustment) error {
	return r.db.Create(sa).Error
}

func (r *stockAdjustmentRepository) GetByID(id uint) (*models.StockAdjustment, error) {
	var sa models.StockAdjustment
	err := r.db.Preload("Items.Location").
		Preload("Warehouse").
		Preload("ApprovedByUser").
		Preload("PostedByUser").
		Preload("CreatedByUser").
		Preload("UpdatedByUser").
		First(&sa, id).Error
	if err != nil {
		return nil, err
	}
	return &sa, nil
}

func (r *stockAdjustmentRepository) List(filters map[string]interface{}, offset, limit int) ([]*models.StockAdjustment, int64, error) {
	var sas []*models.StockAdjustment
	var total int64

	query := r.db.Model(&models.StockAdjustment{})

	if warehouseID, ok := filters["warehouse_id"]; ok {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if status, ok := filters["status"]; ok {
		query = query.Where("status = ?", status)
	}
	if number, ok := filters["adjustment_number"]; ok {
		query = query.Where("adjustment_number LIKE ?", "%"+number.(string)+"%")
	}
	if adjType, ok := filters["adjustment_type"]; ok {
		query = query.Where("adjustment_type = ?", adjType)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Preload("Warehouse").
		Preload("ApprovedByUser").
		Preload("PostedByUser").
		Offset(offset).Limit(limit).
		Order("created_at DESC").
		Find(&sas).Error

	return sas, total, err
}

func (r *stockAdjustmentRepository) Update(sa *models.StockAdjustment) error {
	return r.db.Save(sa).Error
}

func (r *stockAdjustmentRepository) Delete(id uint) error {
	return r.db.Delete(&models.StockAdjustment{}, id).Error
}
