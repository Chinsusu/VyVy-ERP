package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

// MaterialRequestItemRepository defines the interface for material request item data operations
type MaterialRequestItemRepository interface {
	CreateBulk(items []*models.MaterialRequestItem) error
	DeleteByMRID(mrID uint) error
}

type materialRequestItemRepository struct {
	db *gorm.DB
}

// NewMaterialRequestItemRepository creates a new MaterialRequestItemRepository
func NewMaterialRequestItemRepository(db *gorm.DB) MaterialRequestItemRepository {
	return &materialRequestItemRepository{db: db}
}

// CreateBulk creates multiple material request items at once
func (r *materialRequestItemRepository) CreateBulk(items []*models.MaterialRequestItem) error {
	return r.db.Create(items).Error
}

// DeleteByMRID deletes all items for a material request
func (r *materialRequestItemRepository) DeleteByMRID(mrID uint) error {
	return r.db.Where("material_request_id = ?", mrID).Delete(&models.MaterialRequestItem{}).Error
}
