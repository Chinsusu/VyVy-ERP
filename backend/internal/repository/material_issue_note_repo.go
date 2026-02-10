package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

type MaterialIssueNoteRepository interface {
	Create(min *models.MaterialIssueNote) error
	GetByID(id uint) (*models.MaterialIssueNote, error)
	GetByNumber(minNumber string) (*models.MaterialIssueNote, error)
	List(filters map[string]interface{}, offset, limit int) ([]*models.MaterialIssueNote, int64, error)
	Update(min *models.MaterialIssueNote) error
	Delete(id uint) error
}

type materialIssueNoteRepository struct {
	db *gorm.DB
}

func NewMaterialIssueNoteRepository(db *gorm.DB) MaterialIssueNoteRepository {
	return &materialIssueNoteRepository{db: db}
}

func (r *materialIssueNoteRepository) Create(min *models.MaterialIssueNote) error {
	return r.db.Create(min).Error
}

func (r *materialIssueNoteRepository) GetByID(id uint) (*models.MaterialIssueNote, error) {
	var min models.MaterialIssueNote
	err := r.db.Preload("Items.Material").
		Preload("Items.WarehouseLocation").
		Preload("Warehouse").
		Preload("MaterialRequest").
		First(&min, id).Error
	if err != nil {
		return nil, err
	}
	return &min, nil
}

func (r *materialIssueNoteRepository) GetByNumber(minNumber string) (*models.MaterialIssueNote, error) {
	var min models.MaterialIssueNote
	err := r.db.Preload("Items.Material").
		Preload("Items.WarehouseLocation").
		Preload("Warehouse").
		Preload("MaterialRequest").
		Where("min_number = ?", minNumber).First(&min).Error
	if err != nil {
		return nil, err
	}
	return &min, nil
}

func (r *materialIssueNoteRepository) List(filters map[string]interface{}, offset, limit int) ([]*models.MaterialIssueNote, int64, error) {
	var mins []*models.MaterialIssueNote
	var total int64

	query := r.db.Model(&models.MaterialIssueNote{})

	if warehouseID, ok := filters["warehouse_id"]; ok {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if mrID, ok := filters["material_request_id"]; ok {
		query = query.Where("material_request_id = ?", mrID)
	}
	if status, ok := filters["status"]; ok {
		query = query.Where("status = ?", status)
	}
	if minNumber, ok := filters["min_number"]; ok {
		query = query.Where("min_number LIKE ?", "%"+minNumber.(string)+"%")
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Preload("Warehouse").
		Preload("MaterialRequest").
		Offset(offset).Limit(limit).
		Order("created_at DESC").
		Find(&mins).Error

	return mins, total, err
}

func (r *materialIssueNoteRepository) Update(min *models.MaterialIssueNote) error {
	return r.db.Save(min).Error
}

func (r *materialIssueNoteRepository) Delete(id uint) error {
	return r.db.Delete(&models.MaterialIssueNote{}, id).Error
}
