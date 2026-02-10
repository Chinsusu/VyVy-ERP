package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"

	"gorm.io/gorm"
)

// StockLedgerRepository defines the interface for stock ledger data operations
type StockLedgerRepository interface {
	Create(entry *models.StockLedger) error
	ListByItem(itemType string, itemID uint, warehouseID uint) ([]*models.StockLedger, error)
	GetLatestBalance(itemType string, itemID uint, warehouseID uint, locationID *uint, batch string, lot string) (float64, error)
}

type stockLedgerRepository struct {
	db *gorm.DB
}

// NewStockLedgerRepository creates a new StockLedgerRepository
func NewStockLedgerRepository(db *gorm.DB) StockLedgerRepository {
	return &stockLedgerRepository{db: db}
}

func (r *stockLedgerRepository) Create(entry *models.StockLedger) error {
	return r.db.Create(entry).Error
}

func (r *stockLedgerRepository) ListByItem(itemType string, itemID uint, warehouseID uint) ([]*models.StockLedger, error) {
	var entries []*models.StockLedger
	err := r.db.Where("item_type = ? AND item_id = ? AND warehouse_id = ?", itemType, itemID, warehouseID).
		Order("transaction_date DESC").
		Find(&entries).Error
	return entries, err
}

func (r *stockLedgerRepository) GetLatestBalance(itemType string, itemID uint, warehouseID uint, locationID *uint, batch string, lot string) (float64, error) {
	var entry models.StockLedger
	query := r.db.Where("item_type = ? AND item_id = ? AND warehouse_id = ?", itemType, itemID, warehouseID)
	
	if locationID != nil {
		query = query.Where("warehouse_location_id = ?", *locationID)
	} else {
		query = query.Where("warehouse_location_id IS NULL")
	}
	
	if batch != "" {
		query = query.Where("batch_number = ?", batch)
	}
	if lot != "" {
		query = query.Where("lot_number = ?", lot)
	}

	err := query.Order("id DESC").First(&entry).Error
	if err == gorm.ErrRecordNotFound {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	return entry.BalanceQuantity, nil
}
