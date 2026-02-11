package models

import (
	"time"
)

// StockBalance represents current stock levels for an item in a specific location
type StockBalance struct {
	ID                uint    `gorm:"primaryKey" json:"id"`
	ItemType          string  `gorm:"column:item_type;size:20;not null;uniqueIndex:idx_stock_balance_unique" json:"item_type"` // material, finished_product
	ItemID            uint    `gorm:"column:item_id;not null;uniqueIndex:idx_stock_balance_unique" json:"item_id"`
	WarehouseID       uint    `gorm:"column:warehouse_id;not null;uniqueIndex:idx_stock_balance_unique" json:"warehouse_id"`
	WarehouseLocationID *uint   `gorm:"column:warehouse_location_id;uniqueIndex:idx_stock_balance_unique" json:"warehouse_location_id,omitempty"`
	
	// Batch/Lot tracking
	BatchNumber     string  `gorm:"column:batch_number;size:100;uniqueIndex:idx_stock_balance_unique" json:"batch_number,omitempty"`
	LotNumber       string  `gorm:"column:lot_number;size:100;uniqueIndex:idx_stock_balance_unique" json:"lot_number,omitempty"`
	ManufactureDate *string `gorm:"column:manufacture_date;type:date" json:"manufacture_date,omitempty"`
	ExpiryDate      *string `gorm:"column:expiry_date;type:date" json:"expiry_date,omitempty"`

	// Quantity
	Quantity         float64 `gorm:"column:quantity;type:decimal(15,3);not null;default:0" json:"quantity"`
	ReservedQuantity float64 `gorm:"column:reserved_quantity;type:decimal(15,3);default:0" json:"reserved_quantity"`
	// AvailableQuantity is a virtual/generated column in DB: (quantity - reserved_quantity)
	AvailableQuantity float64 `gorm:"column:available_quantity;->;type:decimal(15,3) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED" json:"available_quantity"`

	// Costing (weighted average)
	UnitCost  float64 `gorm:"column:unit_cost;type:decimal(15,2)" json:"unit_cost,omitempty"`
	TotalCost float64 `gorm:"column:total_cost;type:decimal(15,2)" json:"total_cost,omitempty"`

	// Timestamps
	LastTransactionDate *time.Time `gorm:"column:last_transaction_date" json:"last_transaction_date,omitempty"`
	CreatedAt           time.Time  `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt           time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

	// Relationships
	Warehouse         *Warehouse         `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	WarehouseLocation *WarehouseLocation `gorm:"foreignKey:WarehouseLocationID" json:"warehouse_location,omitempty"`
}

// TableName specifies the table name for StockBalance model
func (StockBalance) TableName() string {
	return "stock_balance"
}
