package models

import (
	"time"
)

// StockLedger represents a single inventory transaction record
type StockLedger struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	TransactionType   string    `gorm:"column:transaction_type;size:50;not null" json:"transaction_type"`
	TransactionNumber string    `gorm:"column:transaction_number;size:50;not null" json:"transaction_number"`
	TransactionDate   time.Time `gorm:"column:transaction_date;default:CURRENT_TIMESTAMP" json:"transaction_date"`

	// Item details
	ItemType            string `gorm:"column:item_type;size:20;not null" json:"item_type"` // material, finished_product
	ItemID              uint   `gorm:"column:item_id;not null" json:"item_id"`
	WarehouseID         uint   `gorm:"column:warehouse_id;not null" json:"warehouse_id"`
	WarehouseLocationID *uint  `gorm:"column:warehouse_location_id" json:"warehouse_location_id,omitempty"`

	// Batch/Lot tracking
	BatchNumber string     `gorm:"column:batch_number;size:100" json:"batch_number,omitempty"`
	LotNumber   string     `gorm:"column:lot_number;size:100" json:"lot_number,omitempty"`
	ExpiryDate  *string    `gorm:"column:expiry_date;type:date" json:"expiry_date,omitempty"`

	// Quantity (positive = in, negative = out)
	Quantity float64 `gorm:"column:quantity;type:decimal(15,3);not null" json:"quantity"`

	// Costing
	UnitCost  float64 `gorm:"column:unit_cost;type:decimal(15,2)" json:"unit_cost,omitempty"`
	TotalCost float64 `gorm:"column:total_cost;type:decimal(15,2)" json:"total_cost,omitempty"`

	// Balance after transaction
	BalanceQuantity float64 `gorm:"column:balance_quantity;type:decimal(15,3)" json:"balance_quantity"`

	// Reference
	ReferenceType string `gorm:"column:reference_type;size:50" json:"reference_type,omitempty"`
	ReferenceID   uint   `gorm:"column:reference_id" json:"reference_id,omitempty"`

	// Additional info
	Notes string `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`

	// Relationships
	Warehouse         *Warehouse         `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	WarehouseLocation *WarehouseLocation `gorm:"foreignKey:WarehouseLocationID" json:"warehouse_location,omitempty"`
}

// TableName specifies the table name for StockLedger model
func (StockLedger) TableName() string {
	return "stock_ledger"
}
