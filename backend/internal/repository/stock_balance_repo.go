package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// StockBalanceRepository defines the interface for stock balance data operations
type StockBalanceRepository interface {
	Get(itemType string, itemID uint, warehouseID uint, locationID *uint, batch string, lot string) (*models.StockBalance, error)
	Update(balance *models.StockBalance) error
	Upsert(balance *models.StockBalance) error
	List(itemType string, itemID uint, warehouseID uint) ([]*models.StockBalance, error)
}

type stockBalanceRepository struct {
	db *gorm.DB
}

// NewStockBalanceRepository creates a new StockBalanceRepository
func NewStockBalanceRepository(db *gorm.DB) StockBalanceRepository {
	return &stockBalanceRepository{db: db}
}

func (r *stockBalanceRepository) Get(itemType string, itemID uint, warehouseID uint, locationID *uint, batch string, lot string) (*models.StockBalance, error) {
	var balance models.StockBalance
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

	err := query.First(&balance).Error
	return &balance, err
}

func (r *stockBalanceRepository) Update(balance *models.StockBalance) error {
	return r.db.Save(balance).Error
}

func (r *stockBalanceRepository) Upsert(balance *models.StockBalance) error {
	return r.db.Clauses(clause.OnConflict{
		Columns: []clause.Column{
			{Name: "item_type"},
			{Name: "item_id"},
			{Name: "warehouse_id"},
			{Name: "warehouse_location_id"},
			{Name: "batch_number"},
			{Name: "lot_number"},
		},
		DoUpdates: clause.AssignmentColumns([]string{"quantity", "unit_cost", "total_cost", "updated_at", "last_transaction_date"}),
	}).Create(balance).Error
}

func (r *stockBalanceRepository) List(itemType string, itemID uint, warehouseID uint) ([]*models.StockBalance, error) {
	var balances []*models.StockBalance
	query := r.db.Model(&models.StockBalance{})
	
	if itemType != "" {
		query = query.Where("item_type = ?", itemType)
	}
	if itemID > 0 {
		query = query.Where("item_id = ?", itemID)
	}
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}

	err := query.Order("expiry_date ASC NULLS LAST, created_at ASC").Find(&balances).Error
	return balances, err
}
