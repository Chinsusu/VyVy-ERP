package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

// ProductionPlanRepository defines the interface for material request data operations
type ProductionPlanRepository interface {
	Create(mr *models.ProductionPlan) error
	GetByID(id uint) (*models.ProductionPlan, error)
	GetByPlanNumber(mrNumber string) (*models.ProductionPlan, error)
	List(filter *dto.ProductionPlanFilterRequest) ([]*models.ProductionPlan, int64, error)
	Update(mr *models.ProductionPlan) error
	Delete(id uint) error
	UpdateStatus(id uint, status string, approvedBy *uint, approvedAt *time.Time) error
	UpdateIssuedQuantity(itemID uint, issuedQty float64) error
}

type productionPlanRepository struct {
	db *gorm.DB
}

// NewProductionPlanRepository creates a new ProductionPlanRepository
func NewProductionPlanRepository(db *gorm.DB) ProductionPlanRepository {
	return &productionPlanRepository{db: db}
}

// Create creates a new material request
func (r *productionPlanRepository) Create(mr *models.ProductionPlan) error {
	return r.db.Create(mr).Error
}

// GetByID retrieves a material request by ID with all relationships
func (r *productionPlanRepository) GetByID(id uint) (*models.ProductionPlan, error) {
	var mr models.ProductionPlan
	err := r.db.
		Preload("Warehouse").
		Preload("Items").
		Preload("Items.Material").
		First(&mr, id).Error
	if err != nil {
		return &mr, err
	}

	// Manually load user relationships to avoid GORM convention confusion
	if mr.CreatedBy != nil {
		var user models.User
		if e := r.db.First(&user, *mr.CreatedBy).Error; e == nil {
			mr.CreatedByUser = &user
		}
	}
	if mr.UpdatedBy != nil {
		var user models.User
		if e := r.db.First(&user, *mr.UpdatedBy).Error; e == nil {
			mr.UpdatedByUser = &user
		}
	}
	if mr.ApprovedBy != nil {
		var user models.User
		if e := r.db.First(&user, *mr.ApprovedBy).Error; e == nil {
			mr.ApprovedByUser = &user
		}
	}

	return &mr, nil
}

// GetByPlanNumber retrieves a material request by MR number
func (r *productionPlanRepository) GetByPlanNumber(mrNumber string) (*models.ProductionPlan, error) {
	var mr models.ProductionPlan
	err := r.db.Where("plan_number = ?", mrNumber).First(&mr).Error
	return &mr, err
}

// List retrieves material requests with filtering and pagination
func (r *productionPlanRepository) List(filter *dto.ProductionPlanFilterRequest) ([]*models.ProductionPlan, int64, error) {
	var mrs []*models.ProductionPlan
	var total int64

	query := r.db.Model(&models.ProductionPlan{})

	// Apply search filter
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("plan_number ILIKE ? OR department ILIKE ? OR purpose ILIKE ?", searchPattern, searchPattern, searchPattern)
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
func (r *productionPlanRepository) Update(mr *models.ProductionPlan) error {
	return r.db.Save(mr).Error
}

// Delete deletes a material request
func (r *productionPlanRepository) Delete(id uint) error {
	return r.db.Delete(&models.ProductionPlan{}, id).Error
}

// UpdateStatus updates the status and approval fields of a material request
func (r *productionPlanRepository) UpdateStatus(id uint, status string, approvedBy *uint, approvedAt *time.Time) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if approvedBy != nil {
		updates["approved_by"] = approvedBy
	}
	if approvedAt != nil {
		updates["approved_at"] = approvedAt
	}
	return r.db.Model(&models.ProductionPlan{}).Where("id = ?", id).Updates(updates).Error
}

// UpdateIssuedQuantity updates the issued quantity of an MR item
func (r *productionPlanRepository) UpdateIssuedQuantity(itemID uint, issuedQty float64) error {
	return r.db.Model(&models.ProductionPlanItem{}).
		Where("id = ?", itemID).
		UpdateColumn("issued_quantity", gorm.Expr("issued_quantity + ?", issuedQty)).
		Error
}
