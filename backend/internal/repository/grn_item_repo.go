package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"

	"gorm.io/gorm"
)

// GoodsReceiptNoteItemRepository defines the interface for GRN item data operations
type GoodsReceiptNoteItemRepository interface {
	Create(item *models.GoodsReceiptNoteItem) error
	CreateBulk(items []*models.GoodsReceiptNoteItem) error
	GetByID(id uint) (*models.GoodsReceiptNoteItem, error)
	ListByGRNID(grnID uint) ([]*models.GoodsReceiptNoteItem, error)
	Update(item *models.GoodsReceiptNoteItem) error
	Delete(id uint) error
	DeleteByGRNID(grnID uint) error
	UpdateQC(id uint, acceptedQty float64, rejectedQty float64, status string, notes string) error
}

type goodsReceiptNoteItemRepository struct {
	db *gorm.DB
}

// NewGoodsReceiptNoteItemRepository creates a new GoodsReceiptNoteItemRepository
func NewGoodsReceiptNoteItemRepository(db *gorm.DB) GoodsReceiptNoteItemRepository {
	return &goodsReceiptNoteItemRepository{db: db}
}

func (r *goodsReceiptNoteItemRepository) Create(item *models.GoodsReceiptNoteItem) error {
	return r.db.Create(item).Error
}

func (r *goodsReceiptNoteItemRepository) CreateBulk(items []*models.GoodsReceiptNoteItem) error {
	return r.db.Create(&items).Error
}

func (r *goodsReceiptNoteItemRepository) GetByID(id uint) (*models.GoodsReceiptNoteItem, error) {
	var item models.GoodsReceiptNoteItem
	err := r.db.Preload("Material").First(&item, id).Error
	return &item, err
}

func (r *goodsReceiptNoteItemRepository) ListByGRNID(grnID uint) ([]*models.GoodsReceiptNoteItem, error) {
	var items []*models.GoodsReceiptNoteItem
	err := r.db.Preload("Material").Where("grn_id = ?", grnID).Find(&items).Error
	return items, err
}

func (r *goodsReceiptNoteItemRepository) Update(item *models.GoodsReceiptNoteItem) error {
	return r.db.Save(item).Error
}

func (r *goodsReceiptNoteItemRepository) Delete(id uint) error {
	return r.db.Delete(&models.GoodsReceiptNoteItem{}, id).Error
}

func (r *goodsReceiptNoteItemRepository) DeleteByGRNID(grnID uint) error {
	return r.db.Where("grn_id = ?", grnID).Delete(&models.GoodsReceiptNoteItem{}).Error
}

func (r *goodsReceiptNoteItemRepository) UpdateQC(id uint, acceptedQty float64, rejectedQty float64, status string, notes string) error {
	updates := map[string]interface{}{
		"accepted_quantity": acceptedQty,
		"rejected_quantity": rejectedQty,
		"qc_status":         status,
		"qc_notes":          notes,
	}
	return r.db.Model(&models.GoodsReceiptNoteItem{}).Where("id = ?", id).Updates(updates).Error
}
