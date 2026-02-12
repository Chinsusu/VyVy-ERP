package service

import (
	"time"

	"gorm.io/gorm"
)

// AlertItem represents a single alert (low stock or expiring soon)
type AlertItem struct {
	ItemCode      string    `json:"item_code"`
	ItemName      string    `json:"item_name"`
	ItemType      string    `json:"item_type"` // "material" or "finished_product"
	WarehouseName string    `json:"warehouse_name"`
	Quantity      float64   `json:"quantity"`
	Unit          string    `json:"unit"`
	// Low stock specific
	ReorderPoint float64 `json:"reorder_point,omitempty"`
	// Expiring specific
	BatchNumber  string     `json:"batch_number,omitempty"`
	ExpiryDate   *time.Time `json:"expiry_date,omitempty"`
	DaysToExpiry int        `json:"days_to_expiry,omitempty"`
}

// AlertSummary wraps alerts with counts
type AlertSummary struct {
	LowStockCount    int         `json:"low_stock_count"`
	ExpiringSoonCount int        `json:"expiring_soon_count"`
	TotalAlerts      int         `json:"total_alerts"`
	LowStockItems    []AlertItem `json:"low_stock_items"`
	ExpiringSoonItems []AlertItem `json:"expiring_soon_items"`
}

type AlertService interface {
	GetAlertSummary() (*AlertSummary, error)
	GetLowStockAlerts() ([]AlertItem, error)
	GetExpiringSoonAlerts(days int) ([]AlertItem, error)
}

type alertService struct {
	db *gorm.DB
}

func NewAlertService(db *gorm.DB) AlertService {
	return &alertService{db: db}
}

func (s *alertService) GetAlertSummary() (*AlertSummary, error) {
	lowStock, err := s.GetLowStockAlerts()
	if err != nil {
		return nil, err
	}

	expiring, err := s.GetExpiringSoonAlerts(30)
	if err != nil {
		return nil, err
	}

	return &AlertSummary{
		LowStockCount:     len(lowStock),
		ExpiringSoonCount:  len(expiring),
		TotalAlerts:        len(lowStock) + len(expiring),
		LowStockItems:     lowStock,
		ExpiringSoonItems:  expiring,
	}, nil
}

func (s *alertService) GetLowStockAlerts() ([]AlertItem, error) {
	var items []AlertItem

	err := s.db.Table("materials").
		Select(`
			materials.code as item_code,
			materials.trading_name as item_name,
			'material' as item_type,
			warehouses.name as warehouse_name,
			stock_balance.quantity as quantity,
			materials.unit as unit,
			materials.reorder_point as reorder_point
		`).
		Joins("JOIN stock_balance ON materials.id = stock_balance.item_id AND stock_balance.item_type = 'material'").
		Joins("JOIN warehouses ON stock_balance.warehouse_id = warehouses.id").
		Where("materials.reorder_point > 0 AND stock_balance.quantity < materials.reorder_point").
		Where("materials.is_active = ?", true).
		Order("(materials.reorder_point - stock_balance.quantity) DESC").
		Scan(&items).Error

	if err != nil {
		return nil, err
	}
	if items == nil {
		items = []AlertItem{}
	}
	return items, nil
}

func (s *alertService) GetExpiringSoonAlerts(days int) ([]AlertItem, error) {
	var items []AlertItem

	limitDate := time.Now().AddDate(0, 0, days)

	err := s.db.Table("stock_balance").
		Select(`
			materials.code as item_code,
			materials.trading_name as item_name,
			'material' as item_type,
			warehouses.name as warehouse_name,
			stock_balance.quantity as quantity,
			materials.unit as unit,
			stock_balance.batch_number as batch_number,
			stock_balance.expiry_date as expiry_date,
			EXTRACT(DAY FROM (stock_balance.expiry_date - NOW()))::int as days_to_expiry
		`).
		Joins("JOIN materials ON stock_balance.item_id = materials.id AND stock_balance.item_type = 'material'").
		Joins("JOIN warehouses ON stock_balance.warehouse_id = warehouses.id").
		Where("stock_balance.expiry_date IS NOT NULL AND stock_balance.expiry_date <= ?", limitDate).
		Where("stock_balance.quantity > 0").
		Order("stock_balance.expiry_date ASC").
		Scan(&items).Error

	if err != nil {
		return nil, err
	}
	if items == nil {
		items = []AlertItem{}
	}
	return items, nil
}
