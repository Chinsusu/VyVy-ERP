package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

// MaterialRepository interface defines methods for material data access
type MaterialRepository interface {
	Create(material *models.Material) error
	GetByID(id int64) (*models.Material, error)
	GetByCode(code string) (*models.Material, error)
	List(filter dto.MaterialFilterRequest) ([]models.Material, int64, error)
	Update(material *models.Material) error
	Delete(id int64) error
	Restore(id int64) error
	HardDelete(id int64) error
}

// materialRepository implements MaterialRepository
type materialRepository struct {
	db *gorm.DB
}

// NewMaterialRepository creates a new material repository
func NewMaterialRepository(db *gorm.DB) MaterialRepository {
	return &materialRepository{db: db}
}

// Create inserts a new material
func (r *materialRepository) Create(material *models.Material) error {
	return r.db.Create(material).Error
}

// GetByID retrieves a material by ID
func (r *materialRepository) GetByID(id int64) (*models.Material, error) {
	var material models.Material
	err := r.db.First(&material, id).Error
	if err != nil {
		return nil, err
	}
	return &material, nil
}

// GetByCode retrieves a material by code
func (r *materialRepository) GetByCode(code string) (*models.Material, error) {
	var material models.Material
	err := r.db.Where("code = ?", code).First(&material).Error
	if err != nil {
		return nil, err
	}
	return &material, nil
}

// List retrieves materials with filters and pagination
func (r *materialRepository) List(filter dto.MaterialFilterRequest) ([]models.Material, int64, error) {
	var materials []models.Material
	var total int64

	query := r.db.Model(&models.Material{})

	// Apply filters
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("code ILIKE ? OR trading_name ILIKE ? OR inci_name ILIKE ?",
			searchPattern, searchPattern, searchPattern)
	}

	if filter.MaterialType != "" {
		query = query.Where("material_type = ?", filter.MaterialType)
	}

	if filter.Category != "" {
		query = query.Where("category = ?", filter.Category)
	}

	if filter.SupplierID != nil {
		query = query.Where("supplier_id = ?", *filter.SupplierID)
	}

	if filter.RequiresQC != nil {
		query = query.Where("requires_qc = ?", *filter.RequiresQC)
	}

	if filter.Hazardous != nil {
		query = query.Where("hazardous = ?", *filter.Hazardous)
	}

	if filter.IsActive != nil {
		query = query.Where("is_active = ?", *filter.IsActive)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting
	sortBy := "created_at"
	if filter.SortBy != "" {
		sortBy = filter.SortBy
	}
	sortOrder := "desc"
	if filter.SortOrder != "" {
		sortOrder = filter.SortOrder
	}
	query = query.Order(sortBy + " " + sortOrder)

	// Apply pagination
	page := 1
	if filter.Page > 0 {
		page = filter.Page
	}
	pageSize := 20
	if filter.PageSize > 0 {
		pageSize = filter.PageSize
	}
	offset := (page - 1) * pageSize

	query = query.Limit(pageSize).Offset(offset)

	// Execute query
	if err := query.Find(&materials).Error; err != nil {
		return nil, 0, err
	}

	return materials, total, nil
}

// Update updates a material
func (r *materialRepository) Update(material *models.Material) error {
	return r.db.Save(material).Error
}

// Delete soft deletes a material
func (r *materialRepository) Delete(id int64) error {
	return r.db.Delete(&models.Material{}, id).Error
}

// Restore restores a soft-deleted material
func (r *materialRepository) Restore(id int64) error {
	return r.db.Model(&models.Material{}).Unscoped().Where("id = ?", id).Update("deleted_at", nil).Error
}

// HardDelete permanently deletes a material
func (r *materialRepository) HardDelete(id int64) error {
	return r.db.Unscoped().Delete(&models.Material{}, id).Error
}
