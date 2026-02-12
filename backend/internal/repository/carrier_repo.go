package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

type CarrierRepository struct {
	db *gorm.DB
}

func NewCarrierRepository(db *gorm.DB) *CarrierRepository {
	return &CarrierRepository{db: db}
}

func (r *CarrierRepository) Create(carrier *models.Carrier) error {
	return r.db.Create(carrier).Error
}

func (r *CarrierRepository) GetByID(id uint) (*models.Carrier, error) {
	var carrier models.Carrier
	err := r.db.
		Preload("CreatedByUser").
		First(&carrier, id).Error
	if err != nil {
		return nil, err
	}
	return &carrier, nil
}

func (r *CarrierRepository) GetByCode(code string) (*models.Carrier, error) {
	var carrier models.Carrier
	err := r.db.Where("code = ?", code).First(&carrier).Error
	if err != nil {
		return nil, err
	}
	return &carrier, nil
}

func (r *CarrierRepository) List(filters map[string]interface{}) ([]models.Carrier, int64, error) {
	var carriers []models.Carrier
	var total int64

	query := r.db.Model(&models.Carrier{}).
		Preload("CreatedByUser")

	if carrierType, ok := filters["carrier_type"]; ok {
		query = query.Where("carrier_type = ?", carrierType)
	}
	if isActive, ok := filters["is_active"]; ok {
		query = query.Where("is_active = ?", isActive)
	}
	if search, ok := filters["search"]; ok {
		query = query.Where("name ILIKE ? OR code ILIKE ?", "%"+search.(string)+"%", "%"+search.(string)+"%")
	}

	query.Count(&total)

	if offset, ok := filters["offset"]; ok {
		query = query.Offset(offset.(int))
	}
	if limit, ok := filters["limit"]; ok {
		query = query.Limit(limit.(int))
	} else {
		query = query.Limit(50)
	}

	err := query.Order("name ASC").Find(&carriers).Error
	return carriers, total, err
}

func (r *CarrierRepository) Update(carrier *models.Carrier) error {
	return r.db.Save(carrier).Error
}

func (r *CarrierRepository) Delete(id uint) error {
	return r.db.Delete(&models.Carrier{}, id).Error
}
