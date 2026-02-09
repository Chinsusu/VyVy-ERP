package repository

import (
	"erp-warehouse/internal/dto"
	"erp-warehouse/internal/models"
	"fmt"

	"gorm.io/gorm"
)

// SupplierRepository defines the interface for supplier data access
type SupplierRepository interface {
	Create(supplier *models.Supplier) error
	GetByID(id uint) (*models.Supplier, error)
	GetByCode(code string) (*models.Supplier, error)
	List(filter *dto.SupplierFilterRequest) ([]*models.Supplier, int64, error)
	Update(supplier *models.Supplier) error
	Delete(id uint) error
}

// supplierRepository implements SupplierRepository
type supplierRepository struct {
	db *gorm.DB
}

// NewSupplierRepository creates a new supplier repository
func NewSupplierRepository(db *gorm.DB) SupplierRepository {
	return &supplierRepository{db: db}
}

// Create creates a new supplier
func (r *supplierRepository) Create(supplier *models.Supplier) error {
	return r.db.Create(supplier).Error
}

// GetByID retrieves a supplier by ID
func (r *supplierRepository) GetByID(id uint) (*models.Supplier, error) {
	var supplier models.Supplier
	err := r.db.First(&supplier, id).Error
	if err != nil {
		return nil, err
	}
	return &supplier, nil
}

// GetByCode retrieves a supplier by code
func (r *supplierRepository) GetByCode(code string) (*models.Supplier, error) {
	var supplier models.Supplier
	err := r.db.Where("code = ?", code).First(&supplier).Error
	if err != nil {
		return nil, err
	}
	return &supplier, nil
}

// List retrieves suppliers with filters and pagination
func (r *supplierRepository) List(filter *dto.SupplierFilterRequest) ([]*models.Supplier, int64, error) {
	var suppliers []*models.Supplier
	var total int64

	// Build query
	query := r.db.Model(&models.Supplier{})

	// Apply search filter
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where(
			"code ILIKE ? OR name ILIKE ? OR name_en ILIKE ? OR tax_code ILIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern,
		)
	}

	// Apply country filter
	if filter.Country != "" {
		query = query.Where("country = ?", filter.Country)
	}

	// Apply city filter
	if filter.City != "" {
		query = query.Where("city = ?", filter.City)
	}

	// Apply is_active filter
	if filter.IsActive != nil {
		query = query.Where("is_active = ?", *filter.IsActive)
	}

	// Count total records
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
	query = query.Order(fmt.Sprintf("%s %s", sortBy, sortOrder))

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
	query = query.Offset(offset).Limit(pageSize)

	// Execute query
	if err := query.Find(&suppliers).Error; err != nil {
		return nil, 0, err
	}

	return suppliers, total, nil
}

// Update updates a supplier
func (r *supplierRepository) Update(supplier *models.Supplier) error {
	return r.db.Save(supplier).Error
}

// Delete soft deletes a supplier
func (r *supplierRepository) Delete(id uint) error {
	return r.db.Delete(&models.Supplier{}, id).Error
}
