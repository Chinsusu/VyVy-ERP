package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

// MaterialRequestRepository defines the interface for material request data operations
type MaterialRequestRepository interface {
	Create(mr *models.MaterialRequest) error
	GetByID(id uint) (*models.MaterialRequest, error)
	GetByMRNumber(mrNumber string) (*models.MaterialRequest, error)
	List(filter *dto.MaterialRequestFilterRequest) ([]*models.MaterialRequest, int64, error)
	Update(mr *models.MaterialRequest) error
	Delete(id uint) error
	UpdateStatus(id uint, status string, approvedBy *uint, approvedAt *time.Time) error
	UpdateIssuedQuantity(itemID uint, issuedQty float64) error
}

type materialRequestRepository struct {
	db *gorm.DB
}

// NewMaterialRequestRepository creates a new MaterialRequestRepository
func NewMaterialRequestRepository(db *gorm.DB) MaterialRequestRepository {
	return &materialRequestRepository{db: db}
}

// Create creates a new material request
func (r *materialRequestRepository) Create(mr *models.MaterialRequest) error {
	return r.db.Create(mr).Error
}

// GetByID retrieves a material request by ID with all relationships
func (r *materialRequestRepository) GetByID(id uint) (*models.MaterialRequest, error) {
	var mr models.MaterialRequest
	err := r.db.
		Preload("Warehouse").
		Preload("ApprovedByUser").
		Preload("Items").
		Preload("Items.Material").
		First(&mr, id).Error
	return &mr, err
}

// GetByMRNumber retrieves a material request by MR number
func (r *materialRequestRepository) GetByMRNumber(mrNumber string) (*models.MaterialRequest, error) {
	var mr models.MaterialRequest
	err := r.db.Where("mr_number = ?", mrNumber).First(&mr).Error
	return &mr, err
}

// List retrieves material requests with filtering and pagination
func (r *materialRequestRepository) List(filter *dto.MaterialRequestFilterRequest) ([]*models.MaterialRequest, int64, error) {
	var mrs []*models.MaterialRequest
	var total int64

	query := r.db.Model(&models.MaterialRequest{})

	// Apply search filter
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("mr_number ILIKE ? OR department ILIKE ? OR purpose ILIKE ?", searchPattern, searchPattern, searchPattern)
	}

	// Apply warehouse filter
	if filter.WarehouseID != nil {
		query = query.Where("warehouse_id = ?", *filter.WarehouseID)
	}

	// Apply department filter
	if filter.Department != "" {
		query = query.Where("department = ?", filter.Department)
	}

	// Apply status filter
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	// Apply date range filter
	if filter.RequestDateFrom != "" {
		query = query.Where("request_date >= ?", filter.RequestDateFrom)
	}
	if filter.RequestDateTo != "" {
		query = query.Where("request_date <= ?", filter.RequestDateTo)
	}

	// Count total
	query.Count(&total)

	// Apply sorting
	sortBy := "request_date"
	if filter.SortBy != "" {
		sortBy = filter.SortBy
	}
	sortOrder := "DESC"
	if filter.SortOrder != "" {
		sortOrder = filter.SortOrder
	}
	query = query.Order(sortBy + " " + sortOrder)

	// Apply pagination
	page := 1
	if filter.Page > 0 {
		page = filter.Page
	}
	pageSize := 10
	if filter.PageSize > 0 {
		pageSize = filter.PageSize
	}
	offset := (page - 1) * pageSize
	query = query.Offset(offset).Limit(pageSize)

	// Preload relationships
	err := query.
		Preload("Warehouse").
		Preload("ApprovedByUser").
		Preload("Items").
		Preload("Items.Material").
		Find(&mrs).Error

	return mrs, total, err
}

// Update updates a material request
func (r *materialRequestRepository) Update(mr *models.MaterialRequest) error {
	return r.db.Save(mr).Error
}

// Delete deletes a material request
func (r *materialRequestRepository) Delete(id uint) error {
	return r.db.Delete(&models.MaterialRequest{}, id).Error
}

// UpdateStatus updates the status and approval fields of a material request
func (r *materialRequestRepository) UpdateStatus(id uint, status string, approvedBy *uint, approvedAt *time.Time) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if approvedBy != nil {
		updates["approved_by"] = approvedBy
	}
	if approvedAt != nil {
		updates["approved_at"] = approvedAt
	}
	return r.db.Model(&models.MaterialRequest{}).Where("id = ?", id).Updates(updates).Error
}

// UpdateIssuedQuantity updates the issued quantity of an MR item
func (r *materialRequestRepository) UpdateIssuedQuantity(itemID uint, issuedQty float64) error {
	return r.db.Model(&models.MaterialRequestItem{}).
		Where("id = ?", itemID).
		UpdateColumn("issued_quantity", gorm.Expr("issued_quantity + ?", issuedQty)).
		Error
}
