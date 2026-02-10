package models

import (
	"time"
)

// StockAdjustment represents an inventory correction record
type StockAdjustment struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	AdjustmentNumber string    `gorm:"column:adjustment_number;uniqueIndex;size:50;not null" json:"adjustment_number"`
	WarehouseID      uint      `gorm:"column:warehouse_id;not null" json:"warehouse_id"`
	AdjustmentDate   time.Time `gorm:"column:adjustment_date;type:date;not null;default:CURRENT_DATE" json:"adjustment_date"`
	
	// Type: physical_count, cycle_count, damage, write_off, initial_stock
	AdjustmentType   string    `gorm:"column:adjustment_type;size:50;not null" json:"adjustment_type"`
	Reason           string    `gorm:"column:reason;type:text;not null" json:"reason"`
	
	// Status: draft, approved, posted, cancelled
	Status           string    `gorm:"column:status;size:50;not null;default:draft" json:"status"`
	
	// Approval
	ApprovedBy       *uint      `gorm:"column:approved_by" json:"approved_by,omitempty"`
	ApprovedAt       *time.Time `gorm:"column:approved_at" json:"approved_at,omitempty"`
	
	// Posting
	IsPosted         bool       `gorm:"column:posted;default:false" json:"is_posted"`
	PostedBy         *uint      `gorm:"column:posted_by" json:"posted_by,omitempty"`
	PostedAt         *time.Time `gorm:"column:posted_at" json:"posted_at,omitempty"`
	
	// Additional info
	Notes            string    `gorm:"column:notes;type:text" json:"notes,omitempty"`
	
	// Audit fields
	CreatedAt        time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy        *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt        time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy        *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	Warehouse        Warehouse             `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	ApprovedByUser   *User                 `gorm:"foreignKey:ApprovedBy" json:"approved_by_user,omitempty"`
	PostedByUser     *User                 `gorm:"foreignKey:PostedBy" json:"posted_by_user,omitempty"`
	CreatedByUser    *User                 `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser    *User                 `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
	Items            []StockAdjustmentItem `gorm:"foreignKey:StockAdjustmentID" json:"items,omitempty"`
}

// TableName specifies the table name for StockAdjustment model
func (StockAdjustment) TableName() string {
	return "stock_adjustments"
}

// StockAdjustmentItem represents a specific adjustment row
type StockAdjustmentItem struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	StockAdjustmentID uint      `gorm:"column:stock_adjustment_id;not null" json:"stock_adjustment_id"`
	ItemType          string    `gorm:"column:item_type;size:20;not null" json:"item_type"` // material, finished_product
	ItemID            uint      `gorm:"column:item_id;not null" json:"item_id"`
	WarehouseLocationID *uint   `gorm:"column:warehouse_location_id" json:"warehouse_location_id,omitempty"`
	
	// Batch/Lot tracking
	BatchNumber       string    `gorm:"column:batch_number;size:100" json:"batch_number,omitempty"`
	LotNumber         string    `gorm:"column:lot_number;size:100" json:"lot_number,omitempty"`
	ExpiryDate        *time.Time `gorm:"column:expiry_date;type:date" json:"expiry_date,omitempty"`
	
	// Adjustment quantity (positive = add, negative = remove)
	AdjustmentQuantity float64   `gorm:"column:adjustment_quantity;type:decimal(15,3);not null" json:"adjustment_quantity"`
	
	// Stock levels snapshot
	PreviousQuantity   float64   `gorm:"column:previous_quantity;type:decimal(15,3)" json:"previous_quantity"`
	NewQuantity        float64   `gorm:"column:new_quantity;type:decimal(15,3)" json:"new_quantity"`
	
	// Costing
	UnitCost           float64   `gorm:"column:unit_cost;type:decimal(15,2)" json:"unit_cost"`
	
	// Additional info
	Notes              string    `gorm:"column:notes;type:text" json:"notes,omitempty"`
	
	// Audit fields
	CreatedAt          time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy          *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt          time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy          *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	Location           *WarehouseLocation `gorm:"foreignKey:WarehouseLocationID" json:"location,omitempty"`
}

// TableName specifies the table name for StockAdjustmentItem model
func (StockAdjustmentItem) TableName() string {
	return "stock_adjustment_items"
}

// SafeStockAdjustment is a DTO for API responses
type SafeStockAdjustment struct {
	ID               uint                      `json:"id"`
	AdjustmentNumber string                    `json:"adjustment_number"`
	WarehouseID      uint                      `json:"warehouse_id"`
	WarehouseName    string                    `json:"warehouse_name,omitempty"`
	AdjustmentDate   time.Time                 `json:"adjustment_date"`
	AdjustmentType   string                    `json:"adjustment_type"`
	Reason           string                    `json:"reason"`
	Status           string                    `json:"status"`
	IsPosted         bool                      `json:"is_posted"`
	PostedByName     string                    `json:"posted_by_name,omitempty"`
	PostedAt         *time.Time                 `json:"posted_at,omitempty"`
	ApprovedByName   string                    `json:"approved_by_name,omitempty"`
	ApprovedAt       *time.Time                 `json:"approved_at,omitempty"`
	Notes            string                    `json:"notes,omitempty"`
	CreatedAt        time.Time                 `json:"created_at"`
	CreatedByName    string                    `json:"created_by_name,omitempty"`
	Items            []SafeStockAdjustmentItem `json:"items,omitempty"`
}

// SafeStockAdjustmentItem is a DTO for API responses
type SafeStockAdjustmentItem struct {
	ID                 uint      `json:"id"`
	ItemType           string    `json:"item_type"`
	ItemID             uint      `json:"item_id"`
	ItemName           string    `json:"item_name,omitempty"`
	ItemCode           string    `json:"item_code,omitempty"`
	WarehouseLocationID *uint     `json:"warehouse_location_id,omitempty"`
	LocationCode       string    `json:"location_code,omitempty"`
	BatchNumber        string    `json:"batch_number,omitempty"`
	LotNumber          string    `json:"lot_number,omitempty"`
	AdjustmentQuantity float64   `json:"adjustment_quantity"`
	PreviousQuantity   float64   `json:"previous_quantity"`
	NewQuantity        float64   `json:"new_quantity"`
	UnitCost           float64   `json:"unit_cost"`
	Notes              string    `json:"notes,omitempty"`
}
