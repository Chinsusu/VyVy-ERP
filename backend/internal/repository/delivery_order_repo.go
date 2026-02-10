package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

type DeliveryOrderRepository interface {
	Create(do *models.DeliveryOrder) error
	GetByID(id uint) (*models.DeliveryOrder, error)
	GetByNumber(doNumber string) (*models.DeliveryOrder, error)
	List(filters map[string]interface{}, offset, limit int) ([]*models.DeliveryOrder, int64, error)
	Update(do *models.DeliveryOrder) error
	Delete(id uint) error
}

type deliveryOrderRepository struct {
	db *gorm.DB
}

func NewDeliveryOrderRepository(db *gorm.DB) DeliveryOrderRepository {
	return &deliveryOrderRepository{db: db}
}

func (r *deliveryOrderRepository) Create(do *models.DeliveryOrder) error {
	return r.db.Create(do).Error
}

func (r *deliveryOrderRepository) GetByID(id uint) (*models.DeliveryOrder, error) {
	var do models.DeliveryOrder
	err := r.db.Preload("Items.Product").
		Preload("Items.Location").
		Preload("Warehouse").
		Preload("PostedByUser").
		Preload("CreatedByUser").
		Preload("UpdatedByUser").
		First(&do, id).Error
	if err != nil {
		return nil, err
	}
	return &do, nil
}

func (r *deliveryOrderRepository) GetByNumber(doNumber string) (*models.DeliveryOrder, error) {
	var do models.DeliveryOrder
	err := r.db.Preload("Items.Product").
		Preload("Items.Location").
		Preload("Warehouse").
		Where("do_number = ?", doNumber).First(&do).Error
	if err != nil {
		return nil, err
	}
	return &do, nil
}

func (r *deliveryOrderRepository) List(filters map[string]interface{}, offset, limit int) ([]*models.DeliveryOrder, int64, error) {
	var dos []*models.DeliveryOrder
	var total int64

	query := r.db.Model(&models.DeliveryOrder{})

	if warehouseID, ok := filters["warehouse_id"]; ok {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if status, ok := filters["status"]; ok {
		query = query.Where("status = ?", status)
	}
	if doNumber, ok := filters["do_number"]; ok {
		query = query.Where("do_number LIKE ?", "%"+doNumber.(string)+"%")
	}
	if customerName, ok := filters["customer_name"]; ok {
		query = query.Where("customer_name LIKE ?", "%"+customerName.(string)+"%")
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Preload("Warehouse").
		Offset(offset).Limit(limit).
		Order("created_at DESC").
		Find(&dos).Error

	return dos, total, err
}

func (r *deliveryOrderRepository) Update(do *models.DeliveryOrder) error {
	return r.db.Save(do).Error
}

func (r *deliveryOrderRepository) Delete(id uint) error {
	return r.db.Delete(&models.DeliveryOrder{}, id).Error
}
