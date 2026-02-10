package models

import (
	"time"
)

// StockReservation represents a hold on inventory for a specific requirement (e.g., MR)
type StockReservation struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	ItemType           string    `gorm:"column:item_type;size:20;not null" json:"item_type"` // material, finished_product
	ItemID             uint      `gorm:"column:item_id;not null" json:"item_id"`
	WarehouseID        uint      `gorm:"column:warehouse_id;not null" json:"warehouse_id"`
	WarehouseLocationID *uint     `gorm:"column:warehouse_location_id" json:"warehouse_location_id,omitempty"`
	
	// Batch/Lot
	BatchNumber        string    `gorm:"column:batch_number;size:100" json:"batch_number,omitempty"`
	LotNumber          string    `gorm:"column:lot_number;size:100" json:"lot_number,omitempty"`
	
	// Reservation details
	ReservedQuantity   float64   `gorm:"column:reserved_quantity;type:decimal(15,3);not null" json:"reserved_quantity"`
	FulfilledQuantity  float64   `gorm:"column:fulfilled_quantity;type:decimal(15,3);default:0" json:"fulfilled_quantity"`
	
	// Reference (what is reserving this stock)
	ReferenceType      string    `gorm:"column:reference_type;size:50;not null" json:"reference_type"` // material_request
	ReferenceID        uint      `gorm:"column:reference_id;not null" json:"reference_id"`
	
	// Status: active, fulfilled, cancelled, expired
	Status             string    `gorm:"column:status;size:50;not null;default:active" json:"status"`
	ExpiresAt          *time.Time `gorm:"column:expires_at" json:"expires_at,omitempty"`
	
	// Additional info
	Notes              string    `gorm:"column:notes;type:text" json:"notes,omitempty"`
	
	// Audit
	CreatedAt          time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy          *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt          time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy          *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`
}

// TableName specifies the table name for StockReservation model
func (StockReservation) TableName() string {
	return "stock_reservations"
}
