package models

import (
	"time"
)

// StockTransfer represents a movement of inventory between warehouses
type StockTransfer struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	TransferNumber  string    `gorm:"column:transfer_number;uniqueIndex;size:50;not null" json:"transfer_number"`
	FromWarehouseID uint      `gorm:"column:from_warehouse_id;not null" json:"from_warehouse_id"`
	ToWarehouseID   uint      `gorm:"column:to_warehouse_id;not null" json:"to_warehouse_id"`
	TransferDate    time.Time `gorm:"column:transfer_date;type:date;not null;default:CURRENT_DATE" json:"transfer_date"`
	
	// Status: draft, approved, shipped, received, posted, cancelled
	Status          string    `gorm:"column:status;size:50;not null;default:draft" json:"status"`
	
	// Approval
	ApprovedBy      *uint      `gorm:"column:approved_by" json:"approved_by,omitempty"`
	ApprovedAt      *time.Time `gorm:"column:approved_at" json:"approved_at,omitempty"`
	
	// Shipping
	ShippedBy       *uint      `gorm:"column:shipped_by" json:"shipped_by,omitempty"`
	ShippedAt       *time.Time `gorm:"column:shipped_at" json:"shipped_at,omitempty"`
	
	// Receipt
	ReceivedBy      *uint      `gorm:"column:received_by" json:"received_by,omitempty"`
	ReceivedAt      *time.Time `gorm:"column:received_at" json:"received_at,omitempty"`
	
	// Posting
	IsPosted        bool       `gorm:"column:posted;default:false" json:"is_posted"`
	PostedBy        *uint      `gorm:"column:posted_by" json:"posted_by,omitempty"`
	PostedAt        *time.Time `gorm:"column:posted_at" json:"posted_at,omitempty"`
	
	// Additional info
	Notes           string    `gorm:"column:notes;type:text" json:"notes,omitempty"`
	
	// Audit fields
	CreatedAt       time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy       *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt       time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy       *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	FromWarehouse   Warehouse           `gorm:"foreignKey:FromWarehouseID" json:"from_warehouse,omitempty"`
	ToWarehouse     Warehouse           `gorm:"foreignKey:ToWarehouseID" json:"to_warehouse,omitempty"`
	ApprovedByUser  *User               `gorm:"foreignKey:ApprovedBy" json:"approved_by_user,omitempty"`
	ShippedByUser   *User               `gorm:"foreignKey:ShippedBy" json:"shipped_by_user,omitempty"`
	ReceivedByUser  *User               `gorm:"foreignKey:ReceivedBy" json:"received_by_user,omitempty"`
	PostedByUser    *User               `gorm:"foreignKey:PostedBy" json:"posted_by_user,omitempty"`
	CreatedByUser   *User               `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser   *User               `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
	Items           []StockTransferItem `gorm:"foreignKey:StockTransferID" json:"items,omitempty"`
}

// TableName specifies the table name for StockTransfer model
func (StockTransfer) TableName() string {
	return "stock_transfers"
}

// StockTransferItem represents a specific row in a stock transfer
type StockTransferItem struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	StockTransferID uint      `gorm:"column:stock_transfer_id;not null" json:"stock_transfer_id"`
	ItemType        string    `gorm:"column:item_type;size:20;not null" json:"item_type"` // material, finished_product
	ItemID          uint      `gorm:"column:item_id;not null" json:"item_id"`
	
	// From location
	FromLocationID  *uint     `gorm:"column:from_location_id" json:"from_location_id,omitempty"`
	// To location  
	ToLocationID    *uint     `gorm:"column:to_location_id" json:"to_location_id,omitempty"`
	
	// Batch/Lot tracking
	BatchNumber     string    `gorm:"column:batch_number;size:100" json:"batch_number,omitempty"`
	LotNumber       string    `gorm:"column:lot_number;size:100" json:"lot_number,omitempty"`
	ExpiryDate      *time.Time `gorm:"column:expiry_date;type:date" json:"expiry_date,omitempty"`
	
	// Quantity
	Quantity         float64   `gorm:"column:quantity;type:decimal(15,3);not null" json:"quantity"`
	ReceivedQuantity float64   `gorm:"column:received_quantity;type:decimal(15,3);default:0" json:"received_quantity"`
	
	// Costing (at time of transfer)
	UnitCost         float64   `gorm:"column:unit_cost;type:decimal(15,2)" json:"unit_cost"`
	
	// Additional info
	Notes           string    `gorm:"column:notes;type:text" json:"notes,omitempty"`
	
	// Audit fields
	CreatedAt       time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy       *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt       time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy       *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	FromLocation    *WarehouseLocation `gorm:"foreignKey:FromLocationID" json:"from_location,omitempty"`
	ToLocation      *WarehouseLocation `gorm:"foreignKey:ToLocationID" json:"to_location,omitempty"`
}

// TableName specifies the table name for StockTransferItem model
func (StockTransferItem) TableName() string {
	return "stock_transfer_items"
}

// SafeStockTransfer is a DTO for API responses
type SafeStockTransfer struct {
	ID                uint                   `json:"id"`
	TransferNumber    string                 `json:"transfer_number"`
	FromWarehouseID   uint                   `json:"from_warehouse_id"`
	FromWarehouseName string                 `json:"from_warehouse_name,omitempty"`
	ToWarehouseID     uint                   `json:"to_warehouse_id"`
	ToWarehouseName   string                 `json:"to_warehouse_name,omitempty"`
	TransferDate      time.Time              `json:"transfer_date"`
	Status            string                 `json:"status"`
	IsPosted          bool                   `json:"is_posted"`
	PostedByName      string                 `json:"posted_by_name,omitempty"`
	PostedAt          *time.Time              `json:"posted_at,omitempty"`
	ApprovedByName    string                 `json:"approved_by_name,omitempty"`
	ShippedByName     string                 `json:"shipped_by_name,omitempty"`
	ReceivedByName    string                 `json:"received_by_name,omitempty"`
	Notes             string                 `json:"notes,omitempty"`
	CreatedAt         time.Time              `json:"created_at"`
	CreatedByName     string                 `json:"created_by_name,omitempty"`
	Items             []SafeStockTransferItem `json:"items,omitempty"`
}

// SafeStockTransferItem is a DTO for API responses
type SafeStockTransferItem struct {
	ID               uint      `json:"id"`
	ItemType         string    `json:"item_type"`
	ItemID           uint      `json:"item_id"`
	ItemName         string    `json:"item_name,omitempty"`
	ItemCode         string    `json:"item_code,omitempty"`
	FromLocationID   *uint     `json:"from_location_id,omitempty"`
	FromLocationCode string    `json:"from_location_code,omitempty"`
	ToLocationID     *uint     `json:"to_location_id,omitempty"`
	ToLocationCode   string    `json:"to_location_code,omitempty"`
	BatchNumber      string    `json:"batch_number,omitempty"`
	LotNumber        string    `json:"lot_number,omitempty"`
	Quantity         float64   `json:"quantity"`
	ReceivedQuantity float64   `json:"received_quantity"`
	UnitCost         float64   `json:"unit_cost"`
}
