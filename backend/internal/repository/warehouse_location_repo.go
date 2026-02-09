package repository

import (
	"erp-warehouse/internal/dto"
	"erp-warehouse/internal/models"
	"fmt"

	"gorm.io/gorm"
)

// WarehouseLocationRepository defines the interface for warehouse location data access
type WarehouseLocationRepository interface {
	Create(location *models.WarehouseLocation) error
	GetByID(id uint) (*models.WarehouseLocation, error)
	GetByCode(code string) (*models.WarehouseLocation, error)
	List(filter *dto.WarehouseLocationFilterRequest) ([]*models.WarehouseLocation, int64, error)
	ListByWarehouseID(warehouseID uint) ([]*models.WarehouseLocation, error)
	Update(location *models.WarehouseLocation) error
	Delete(id uint) error
}

// warehouseLocationRepository implements WarehouseLocationRepository
type warehouseLocationRepository struct {
	db *gorm.DB
}

// NewWarehouseLocationRepository creates a new warehouse location repository
func NewWarehouseLocationRepository(db *gorm.DB) WarehouseLocationRepository {
	return &warehouseLocationRepository{db: db}
}

// Create creates a new warehouse location
func (r *warehouseLocationRepository) Create(location *models.WarehouseLocation) error {
	return r.db.Create(location).Error
}

// GetByID retrieves a warehouse location by ID
func (r *warehouseLocationRepository) GetByID(id uint) (*models.WarehouseLocation, error) {
	var location models.WarehouseLocation
	err := r.db.Preload("Warehouse").First(&location, id).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// GetByCode retrieves a warehouse location by code
func (r *warehouseLocationRepository) GetByCode(code string) (*models.WarehouseLocation, error) {
	var location models.WarehouseLocation
	err := r.db.Where("code = ?", code).First(&location).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// List retrieves warehouse locations with filters and pagination
func (r *warehouseLocationRepository) List(filter *dto.WarehouseLocationFilterRequest) ([]*models.WarehouseLocation, int64, error) {
	var locations []*models.WarehouseLocation
	var total int64

	// Build query
	query := r.db.Model(&models.WarehouseLocation{})

	// Apply search filter
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("code ILIKE ? OR name ILIKE ?", searchPattern, searchPattern)
	}

	// Apply warehouse_id filter
	if filter.WarehouseID != nil {
		query = query.Where("warehouse_id = ?", *filter.WarehouseID)
	}

	// Apply location_type filter
	if filter.LocationType != "" {
		query = query.Where("location_type = ?", filter.LocationType)
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

	// Execute query with Warehouse preload
	if err := query.Preload("Warehouse").Find(&locations).Error; err != nil {
		return nil, 0, err
	}

	return locations, total, nil
}

// ListByWarehouseID retrieves all locations for a specific warehouse
func (r *warehouseLocationRepository) ListByWarehouseID(warehouseID uint) ([]*models.WarehouseLocation, error) {
	var locations []*models.WarehouseLocation
	err := r.db.Where("warehouse_id = ?", warehouseID).Order("code ASC").Find(&locations).Error
	if err != nil {
		return nil, err
	}
	return locations, nil
}

// Update updates a warehouse location
func (r *warehouseLocationRepository) Update(location *models.WarehouseLocation) error {
	return r.db.Save(location).Error
}

// Delete soft deletes a warehouse location
func (r *warehouseLocationRepository) Delete(id uint) error {
	return r.db.Delete(&models.WarehouseLocation{}, id).Error
}
