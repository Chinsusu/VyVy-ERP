package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"fmt"

	"gorm.io/gorm"
)

// WarehouseRepository defines the interface for warehouse data access
type WarehouseRepository interface {
	Create(warehouse *models.Warehouse) error
	GetByID(id uint) (*models.Warehouse, error)
	GetByCode(code string) (*models.Warehouse, error)
	List(filter *dto.WarehouseFilterRequest) ([]*models.Warehouse, int64, error)
	Update(warehouse *models.Warehouse) error
	Delete(id uint) error
	GetLocationsCount(id uint) (int64, error)
}

// warehouseRepository implements WarehouseRepository
type warehouseRepository struct {
	db *gorm.DB
}

// NewWarehouseRepository creates a new warehouse repository
func NewWarehouseRepository(db *gorm.DB) WarehouseRepository {
	return &warehouseRepository{db: db}
}

// Create creates a new warehouse
func (r *warehouseRepository) Create(warehouse *models.Warehouse) error {
	return r.db.Create(warehouse).Error
}

// GetByID retrieves a warehouse by ID
func (r *warehouseRepository) GetByID(id uint) (*models.Warehouse, error) {
	var warehouse models.Warehouse
	err := r.db.First(&warehouse, id).Error
	if err != nil {
		return nil, err
	}
	return &warehouse, nil
}

// GetByCode retrieves a warehouse by code
func (r *warehouseRepository) GetByCode(code string) (*models.Warehouse, error) {
	var warehouse models.Warehouse
	err := r.db.Where("code = ?", code).First(&warehouse).Error
	if err != nil {
		return nil, err
	}
	return &warehouse, nil
}

// List retrieves warehouses with filters and pagination
func (r *warehouseRepository) List(filter *dto.WarehouseFilterRequest) ([]*models.Warehouse, int64, error) {
	var warehouses []*models.Warehouse
	var total int64

	// Build query
	query := r.db.Model(&models.Warehouse{})

	// Apply search filter
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("code ILIKE ? OR name ILIKE ?", searchPattern, searchPattern)
	}

	// Apply warehouse_type filter
	if filter.WarehouseType != "" {
		query = query.Where("warehouse_type = ?", filter.WarehouseType)
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
	if err := query.Find(&warehouses).Error; err != nil {
		return nil, 0, err
	}

	return warehouses, total, nil
}

// Update updates a warehouse
func (r *warehouseRepository) Update(warehouse *models.Warehouse) error {
	return r.db.Save(warehouse).Error
}

// Delete soft deletes a warehouse
func (r *warehouseRepository) Delete(id uint) error {
	return r.db.Delete(&models.Warehouse{}, id).Error
}

// GetLocationsCount returns the count of warehouse locations for a warehouse
func (r *warehouseRepository) GetLocationsCount(id uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.WarehouseLocation{}).Where("warehouse_id = ?", id).Count(&count).Error
	return count, err
}
