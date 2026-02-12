package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

type ReconciliationRepository struct {
	db *gorm.DB
}

func NewReconciliationRepository(db *gorm.DB) *ReconciliationRepository {
	return &ReconciliationRepository{db: db}
}

func (r *ReconciliationRepository) Create(recon *models.ShippingReconciliation) error {
	return r.db.Create(recon).Error
}

func (r *ReconciliationRepository) GetByID(id uint) (*models.ShippingReconciliation, error) {
	var recon models.ShippingReconciliation
	err := r.db.
		Preload("Carrier").
		Preload("CreatedByUser").
		Preload("Items").
		Preload("Items.DeliveryOrder").
		First(&recon, id).Error
	if err != nil {
		return nil, err
	}
	return &recon, nil
}

func (r *ReconciliationRepository) List(filters map[string]interface{}) ([]models.ShippingReconciliation, int64, error) {
	var recons []models.ShippingReconciliation
	var total int64

	query := r.db.Model(&models.ShippingReconciliation{}).
		Preload("Carrier").
		Preload("CreatedByUser")

	if carrierID, ok := filters["carrier_id"]; ok {
		query = query.Where("carrier_id = ?", carrierID)
	}
	if status, ok := filters["status"]; ok {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	if offset, ok := filters["offset"]; ok {
		query = query.Offset(offset.(int))
	}
	if limit, ok := filters["limit"]; ok {
		query = query.Limit(limit.(int))
	} else {
		query = query.Limit(20)
	}

	err := query.Order("created_at DESC").Find(&recons).Error
	return recons, total, err
}

func (r *ReconciliationRepository) Update(recon *models.ShippingReconciliation) error {
	return r.db.Save(recon).Error
}

func (r *ReconciliationRepository) Delete(id uint) error {
	return r.db.Delete(&models.ShippingReconciliation{}, id).Error
}

// AddItems adds reconciliation items in bulk
func (r *ReconciliationRepository) AddItems(items []models.ShippingReconciliationItem) error {
	return r.db.Create(&items).Error
}

// GetItemsByReconciliationID returns all items for a reconciliation
func (r *ReconciliationRepository) GetItemsByReconciliationID(reconID uint) ([]models.ShippingReconciliationItem, error) {
	var items []models.ShippingReconciliationItem
	err := r.db.
		Preload("DeliveryOrder").
		Where("reconciliation_id = ?", reconID).
		Find(&items).Error
	return items, err
}

// FindDOByTrackingNumber finds a delivery order by tracking number
func (r *ReconciliationRepository) FindDOByTrackingNumber(trackingNumber string) (*models.DeliveryOrder, error) {
	var do models.DeliveryOrder
	err := r.db.Where("tracking_number = ?", trackingNumber).First(&do).Error
	if err != nil {
		return nil, err
	}
	return &do, nil
}

// GetNextReconciliationNumber generates the next reconciliation number
func (r *ReconciliationRepository) GetNextReconciliationNumber() (string, error) {
	var count int64
	r.db.Model(&models.ShippingReconciliation{}).Count(&count)
	return "RC-" + padNumber(int(count+1), 6), nil
}

func padNumber(n int, width int) string {
	s := ""
	for i := 0; i < width; i++ {
		s = string(rune('0'+n%10)) + s
		n /= 10
	}
	return s
}
