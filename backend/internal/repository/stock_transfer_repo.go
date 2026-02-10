package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

type StockTransferRepository interface {
	Create(st *models.StockTransfer) error
	GetByID(id uint) (*models.StockTransfer, error)
	List(filters map[string]interface{}, offset, limit int) ([]*models.StockTransfer, int64, error)
	Update(st *models.StockTransfer) error
	Delete(id uint) error
}

type stockTransferRepository struct {
	db *gorm.DB
}

func NewStockTransferRepository(db *gorm.DB) StockTransferRepository {
	return &stockTransferRepository{db: db}
}

func (r *stockTransferRepository) Create(st *models.StockTransfer) error {
	return r.db.Create(st).Error
}

func (r *stockTransferRepository) GetByID(id uint) (*models.StockTransfer, error) {
	var st models.StockTransfer
	err := r.db.Preload("Items.FromLocation").
		Preload("Items.ToLocation").
		Preload("FromWarehouse").
		Preload("ToWarehouse").
		Preload("ApprovedByUser").
		Preload("ShippedByUser").
		Preload("ReceivedByUser").
		Preload("PostedByUser").
		Preload("CreatedByUser").
		Preload("UpdatedByUser").
		First(&st, id).Error
	if err != nil {
		return nil, err
	}
	return &st, nil
}

func (r *stockTransferRepository) List(filters map[string]interface{}, offset, limit int) ([]*models.StockTransfer, int64, error) {
	var sts []*models.StockTransfer
	var total int64

	query := r.db.Model(&models.StockTransfer{})

	if fromWH, ok := filters["from_warehouse_id"]; ok {
		query = query.Where("from_warehouse_id = ?", fromWH)
	}
	if toWH, ok := filters["to_warehouse_id"]; ok {
		query = query.Where("to_warehouse_id = ?", toWH)
	}
	if status, ok := filters["status"]; ok {
		query = query.Where("status = ?", status)
	}
	if number, ok := filters["transfer_number"]; ok {
		query = query.Where("transfer_number LIKE ?", "%"+number.(string)+"%")
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Preload("FromWarehouse").
		Preload("ToWarehouse").
		Preload("ApprovedByUser").
		Preload("ShippedByUser").
		Preload("ReceivedByUser").
		Preload("PostedByUser").
		Offset(offset).Limit(limit).
		Order("created_at DESC").
		Find(&sts).Error

	return sts, total, err
}

func (r *stockTransferRepository) Update(st *models.StockTransfer) error {
	return r.db.Save(st).Error
}

func (r *stockTransferRepository) Delete(id uint) error {
	return r.db.Delete(&models.StockTransfer{}, id).Error
}
