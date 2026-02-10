package repository

import (
	"erp-warehouse/internal/dto"
	"erp-warehouse/internal/models"

	"gorm.io/gorm"
)

// FinishedProductRepository interface defines methods for finished product data access
type FinishedProductRepository interface {
	Create(product *models.FinishedProduct) error
	GetByID(id uint) (*models.FinishedProduct, error)
	GetByCode(code string) (*models.FinishedProduct, error)
	List(filter *dto.FinishedProductFilterRequest) ([]*models.FinishedProduct, int64, error)
	Update(product *models.FinishedProduct) error
	Delete(id uint) error
}

type finishedProductRepository struct {
	db *gorm.DB
}

// NewFinishedProductRepository creates a new instance of FinishedProductRepository
func NewFinishedProductRepository(db *gorm.DB) FinishedProductRepository {
	return &finishedProductRepository{db: db}
}

func (r *finishedProductRepository) Create(product *models.FinishedProduct) error {
	return r.db.Create(product).Error
}

func (r *finishedProductRepository) GetByID(id uint) (*models.FinishedProduct, error) {
	var product models.FinishedProduct
	err := r.db.First(&product, id).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *finishedProductRepository) GetByCode(code string) (*models.FinishedProduct, error) {
	var product models.FinishedProduct
	err := r.db.Where("code = ?", code).First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *finishedProductRepository) List(filter *dto.FinishedProductFilterRequest) ([]*models.FinishedProduct, int64, error) {
	var products []*models.FinishedProduct
	var total int64

	query := r.db.Model(&models.FinishedProduct{})

	// Apply search filter
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("code ILIKE ? OR name ILIKE ? OR name_en ILIKE ? OR barcode ILIKE ?", 
			searchPattern, searchPattern, searchPattern, searchPattern)
	}

	// Apply category filter
	if filter.Category != "" {
		query = query.Where("category = ?", filter.Category)
	}

	// Apply sub-category filter
	if filter.SubCategory != "" {
		query = query.Where("sub_category = ?", filter.SubCategory)
	}

	// Apply is_active filter
	if filter.IsActive != nil {
		query = query.Where("is_active = ?", *filter.IsActive)
	}

	// Apply sorting
	sortBy := "code"
	if filter.SortBy != "" {
		sortBy = filter.SortBy
	}
	sortOrder := "ASC"
	if filter.SortOrder == "desc" {
		sortOrder = "DESC"
	}
	query = query.Order(sortBy + " " + sortOrder)

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

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
	if err := query.Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (r *finishedProductRepository) Update(product *models.FinishedProduct) error {
	return r.db.Save(product).Error
}

func (r *finishedProductRepository) Delete(id uint) error {
	return r.db.Delete(&models.FinishedProduct{}, id).Error
}
