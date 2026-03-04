package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

// ProductionPlanItemRepository defines the interface for material request item data operations
type ProductionPlanItemRepository interface {
	CreateBulk(items []*models.ProductionPlanItem) error
	DeleteByMRID(mrID uint) error
}

type productionPlanItemRepository struct {
	db *gorm.DB
}

// NewProductionPlanItemRepository creates a new ProductionPlanItemRepository
func NewProductionPlanItemRepository(db *gorm.DB) ProductionPlanItemRepository {
	return &productionPlanItemRepository{db: db}
}

// CreateBulk creates multiple material request items at once
func (r *productionPlanItemRepository) CreateBulk(items []*models.ProductionPlanItem) error {
	return r.db.Create(items).Error
}

// DeleteByMRID deletes all items for a material request
func (r *productionPlanItemRepository) DeleteByMRID(mrID uint) error {
	return r.db.Where("production_plan_id = ?", mrID).Delete(&models.ProductionPlanItem{}).Error
}
