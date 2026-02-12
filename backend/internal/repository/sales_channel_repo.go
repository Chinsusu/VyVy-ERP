package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

// SalesChannelRepository defines the interface for sales channel data access
type SalesChannelRepository interface {
	Create(channel *models.SalesChannel) error
	GetByID(id uint) (*models.SalesChannel, error)
	GetByCode(code string) (*models.SalesChannel, error)
	List(platformType string, isActive *bool, search string, offset, limit int) ([]*models.SalesChannel, int64, error)
	Update(channel *models.SalesChannel) error
	Delete(id uint) error
}

type salesChannelRepository struct {
	db *gorm.DB
}

// NewSalesChannelRepository creates a new SalesChannelRepository
func NewSalesChannelRepository(db *gorm.DB) SalesChannelRepository {
	return &salesChannelRepository{db: db}
}

func (r *salesChannelRepository) Create(channel *models.SalesChannel) error {
	return r.db.Create(channel).Error
}

func (r *salesChannelRepository) GetByID(id uint) (*models.SalesChannel, error) {
	var channel models.SalesChannel
	err := r.db.Preload("CreatedByUser").First(&channel, id).Error
	if err != nil {
		return nil, err
	}
	return &channel, nil
}

func (r *salesChannelRepository) GetByCode(code string) (*models.SalesChannel, error) {
	var channel models.SalesChannel
	err := r.db.Where("code = ?", code).First(&channel).Error
	if err != nil {
		return nil, err
	}
	return &channel, nil
}

func (r *salesChannelRepository) List(platformType string, isActive *bool, search string, offset, limit int) ([]*models.SalesChannel, int64, error) {
	var channels []*models.SalesChannel
	var total int64

	query := r.db.Model(&models.SalesChannel{})

	if platformType != "" {
		query = query.Where("platform_type = ?", platformType)
	}
	if isActive != nil {
		query = query.Where("is_active = ?", *isActive)
	}
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("name ILIKE ? OR code ILIKE ?", searchPattern, searchPattern)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if limit <= 0 {
		limit = 20
	}

	err := query.
		Preload("CreatedByUser").
		Order("id ASC").
		Offset(offset).
		Limit(limit).
		Find(&channels).Error

	return channels, total, err
}

func (r *salesChannelRepository) Update(channel *models.SalesChannel) error {
	return r.db.Save(channel).Error
}

func (r *salesChannelRepository) Delete(id uint) error {
	return r.db.Delete(&models.SalesChannel{}, id).Error
}
