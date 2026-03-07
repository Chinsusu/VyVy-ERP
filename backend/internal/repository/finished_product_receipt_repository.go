package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

// FinishedProductReceiptRepository defines FPRN data operations
type FinishedProductReceiptRepository interface {
	Create(fprn *models.FinishedProductReceipt) error
	GetByID(id uint) (*models.FinishedProductReceipt, error)
	List(filters map[string]interface{}, offset, limit int) ([]*models.FinishedProductReceipt, int64, error)
	Update(fprn *models.FinishedProductReceipt) error
	UpdatePosting(id uint, postedBy uint) error
	UpdateStatus(id uint, status string) error
	CountByFPRNNumber(prefix string) (int64, error)
}

type fprnRepository struct {
	db *gorm.DB
}

func NewFinishedProductReceiptRepository(db *gorm.DB) FinishedProductReceiptRepository {
	return &fprnRepository{db: db}
}

func (r *fprnRepository) Create(fprn *models.FinishedProductReceipt) error {
	return r.db.Create(fprn).Error
}

func (r *fprnRepository) GetByID(id uint) (*models.FinishedProductReceipt, error) {
	var fprn models.FinishedProductReceipt
	err := r.db.
		Preload("ProductionPlan").
		Preload("Warehouse").
		Preload("PostedByUser").
		Preload("Items").
		Preload("Items.FinishedProduct").
		Preload("Items.WarehouseLocation").
		First(&fprn, id).Error
	return &fprn, err
}

func (r *fprnRepository) List(filters map[string]interface{}, offset, limit int) ([]*models.FinishedProductReceipt, int64, error) {
	var fprns []*models.FinishedProductReceipt
	var total int64

	query := r.db.Model(&models.FinishedProductReceipt{})

	if search, ok := filters["search"].(string); ok && search != "" {
		pattern := "%" + search + "%"
		query = query.Where("unaccent(fprn_number) ILIKE unaccent(?) OR unaccent(notes) ILIKE unaccent(?)", pattern, pattern)
	}
	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if warehouseID, ok := filters["warehouse_id"].(uint); ok && warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if planID, ok := filters["production_plan_id"].(uint); ok && planID > 0 {
		query = query.Where("production_plan_id = ?", planID)
	}

	query.Count(&total)
	query = query.Order("receipt_date DESC").Offset(offset).Limit(limit)
	err := query.Preload("Warehouse").Preload("ProductionPlan").Find(&fprns).Error
	return fprns, total, err
}

func (r *fprnRepository) Update(fprn *models.FinishedProductReceipt) error {
	return r.db.Save(fprn).Error
}

func (r *fprnRepository) UpdatePosting(id uint, postedBy uint) error {
	return r.db.Model(&models.FinishedProductReceipt{}).Where("id = ?", id).Updates(map[string]interface{}{
		"posted":    true,
		"posted_by": postedBy,
		"posted_at": gorm.Expr("NOW()"),
		"status":    "posted",
	}).Error
}

func (r *fprnRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&models.FinishedProductReceipt{}).Where("id = ?", id).Update("status", status).Error
}

func (r *fprnRepository) CountByFPRNNumber(prefix string) (int64, error) {
	var count int64
	err := r.db.Model(&models.FinishedProductReceipt{}).
		Where("fprn_number LIKE ?", prefix+"%").Count(&count).Error
	return count, err
}
