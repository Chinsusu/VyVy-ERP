package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

// GoodsReceiptNoteRepository defines the interface for GRN data operations
type GoodsReceiptNoteRepository interface {
	Create(grn *models.GoodsReceiptNote) error
	GetByID(id uint) (*models.GoodsReceiptNote, error)
	GetByGRNNumber(grnNumber string) (*models.GoodsReceiptNote, error)
	List(filter *dto.GRNFilterRequest) ([]*models.GoodsReceiptNote, int64, error)
	Update(grn *models.GoodsReceiptNote) error
	Delete(id uint) error
	UpdateStatus(id uint, status string, notes string) error
	UpdateQC(id uint, status string, approvedBy uint, approvedAt time.Time, notes string) error
	UpdatePosting(id uint, postedBy uint, postedAt time.Time) error
}

type goodsReceiptNoteRepository struct {
	db *gorm.DB
}

// NewGoodsReceiptNoteRepository creates a new GoodsReceiptNoteRepository
func NewGoodsReceiptNoteRepository(db *gorm.DB) GoodsReceiptNoteRepository {
	return &goodsReceiptNoteRepository{db: db}
}

func (r *goodsReceiptNoteRepository) Create(grn *models.GoodsReceiptNote) error {
	return r.db.Create(grn).Error
}

func (r *goodsReceiptNoteRepository) GetByID(id uint) (*models.GoodsReceiptNote, error) {
	var grn models.GoodsReceiptNote
	err := r.db.
		Preload("PurchaseOrder").
		Preload("PurchaseOrder.Supplier").
		Preload("Warehouse").
		Preload("QCApprovedUser").
		Preload("PostedByUser").
		Preload("Items").
		Preload("Items.Material").
		Preload("Items.WarehouseLocation").
		First(&grn, id).Error
	return &grn, err
}

func (r *goodsReceiptNoteRepository) GetByGRNNumber(grnNumber string) (*models.GoodsReceiptNote, error) {
	var grn models.GoodsReceiptNote
	err := r.db.Where("grn_number = ?", grnNumber).First(&grn).Error
	return &grn, err
}

func (r *goodsReceiptNoteRepository) List(filter *dto.GRNFilterRequest) ([]*models.GoodsReceiptNote, int64, error) {
	var grns []*models.GoodsReceiptNote
	var total int64

	query := r.db.Model(&models.GoodsReceiptNote{})

	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("grn_number ILIKE ? OR notes ILIKE ?", searchPattern, searchPattern)
	}

	if filter.PurchaseOrderID != nil {
		query = query.Where("purchase_order_id = ?", *filter.PurchaseOrderID)
	}

	if filter.WarehouseID != nil {
		query = query.Where("warehouse_id = ?", *filter.WarehouseID)
	}

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	if filter.ReceiptDateFrom != "" {
		query = query.Where("receipt_date >= ?", filter.ReceiptDateFrom)
	}
	if filter.ReceiptDateTo != "" {
		query = query.Where("receipt_date <= ?", filter.ReceiptDateTo)
	}

	query.Count(&total)

	sortBy := "receipt_date"
	if filter.SortBy != "" {
		sortBy = filter.SortBy
	}
	sortOrder := "DESC"
	if filter.SortOrder != "" {
		sortOrder = filter.SortOrder
	}
	query = query.Order(sortBy + " " + sortOrder)

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

	err := query.
		Preload("PurchaseOrder").
		Preload("Warehouse").
		Preload("Items").
		Find(&grns).Error

	return grns, total, err
}

func (r *goodsReceiptNoteRepository) Update(grn *models.GoodsReceiptNote) error {
	return r.db.Save(grn).Error
}

func (r *goodsReceiptNoteRepository) Delete(id uint) error {
	return r.db.Delete(&models.GoodsReceiptNote{}, id).Error
}

func (r *goodsReceiptNoteRepository) UpdateStatus(id uint, status string, notes string) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if notes != "" {
		updates["notes"] = notes
	}
	return r.db.Model(&models.GoodsReceiptNote{}).Where("id = ?", id).Updates(updates).Error
}

func (r *goodsReceiptNoteRepository) UpdateQC(id uint, status string, approvedBy uint, approvedAt time.Time, notes string) error {
	updates := map[string]interface{}{
		"qc_status":      status,
		"qc_approved_by": approvedBy,
		"qc_approved_at": approvedAt,
		"qc_notes":       notes,
		"status":         "qc_completed",
	}
	return r.db.Model(&models.GoodsReceiptNote{}).Where("id = ?", id).Updates(updates).Error
}

func (r *goodsReceiptNoteRepository) UpdatePosting(id uint, postedBy uint, postedAt time.Time) error {
	updates := map[string]interface{}{
		"posted":    true,
		"posted_by": postedBy,
		"posted_at": postedAt,
		"status":    "posted",
	}
	return r.db.Model(&models.GoodsReceiptNote{}).Where("id = ?", id).Updates(updates).Error
}
