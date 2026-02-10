package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

type StockReservationRepository interface {
	Create(reservation *models.StockReservation) error
	Update(reservation *models.StockReservation) error
	GetByID(id uint) (*models.StockReservation, error)
	ListByReference(refType string, refID uint) ([]*models.StockReservation, error)
	CloseByReference(tx *gorm.DB, refType string, refID uint, status string) error
}

type stockReservationRepository struct {
	db *gorm.DB
}

func NewStockReservationRepository(db *gorm.DB) StockReservationRepository {
	return &stockReservationRepository{db: db}
}

func (r *stockReservationRepository) Create(reservation *models.StockReservation) error {
	return r.db.Create(reservation).Error
}

func (r *stockReservationRepository) Update(reservation *models.StockReservation) error {
	return r.db.Save(reservation).Error
}

func (r *stockReservationRepository) GetByID(id uint) (*models.StockReservation, error) {
	var res models.StockReservation
	if err := r.db.First(&res, id).Error; err != nil {
		return nil, err
	}
	return &res, nil
}

func (r *stockReservationRepository) ListByReference(refType string, refID uint) ([]*models.StockReservation, error) {
	var res []*models.StockReservation
	err := r.db.Where("reference_type = ? AND reference_id = ? AND status = 'active'", refType, refID).Find(&res).Error
	return res, err
}

func (r *stockReservationRepository) CloseByReference(tx *gorm.DB, refType string, refID uint, status string) error {
	db := tx
	if db == nil {
		db = r.db
	}
	return db.Model(&models.StockReservation{}).
		Where("reference_type = ? AND reference_id = ? AND status = 'active'", refType, refID).
		Update("status", status).Error
}
