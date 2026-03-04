package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

// ProductionTaskRepository defines CRUD operations for production tasks
type ProductionTaskRepository interface {
	Create(task *models.ProductionTask) error
	Update(task *models.ProductionTask) error
	Delete(id int64) error
	GetByID(id int64) (*models.ProductionTask, error)
	ListByMaterialRequest(mrID uint) ([]*models.ProductionTask, error)
}

type productionTaskRepository struct {
	db *gorm.DB
}

// NewProductionTaskRepository creates a new production task repository
func NewProductionTaskRepository(db *gorm.DB) ProductionTaskRepository {
	return &productionTaskRepository{db: db}
}

func (r *productionTaskRepository) Create(task *models.ProductionTask) error {
	return r.db.Create(task).Error
}

func (r *productionTaskRepository) Update(task *models.ProductionTask) error {
	return r.db.Save(task).Error
}

func (r *productionTaskRepository) Delete(id int64) error {
	return r.db.Delete(&models.ProductionTask{}, id).Error
}

func (r *productionTaskRepository) GetByID(id int64) (*models.ProductionTask, error) {
	var task models.ProductionTask
	err := r.db.Preload("AssignedUser").First(&task, id).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

func (r *productionTaskRepository) ListByMaterialRequest(mrID uint) ([]*models.ProductionTask, error) {
	var tasks []*models.ProductionTask
	err := r.db.
		Preload("AssignedUser").
		Where("material_request_id = ?", mrID).
		Order("sort_order ASC, id ASC").
		Find(&tasks).Error
	if err != nil {
		return nil, err
	}
	return tasks, nil
}
