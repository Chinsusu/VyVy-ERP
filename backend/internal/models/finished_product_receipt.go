package models

import "time"

// FinishedProductReceipt represents a receipt of finished products into warehouse (FPRN)
type FinishedProductReceipt struct {
	ID               uint       `gorm:"primaryKey" json:"id"`
	FPRNNumber       string     `gorm:"column:fprn_number;uniqueIndex;size:50;not null" json:"fprn_number"`
	ProductionPlanID *uint      `gorm:"column:production_plan_id" json:"production_plan_id,omitempty"`
	WarehouseID      uint       `gorm:"column:warehouse_id;not null" json:"warehouse_id"`
	ReceiptDate      string     `gorm:"column:receipt_date;type:date;not null" json:"receipt_date"`
	Status           string     `gorm:"column:status;size:50;not null;default:draft" json:"status"`
	Posted           bool       `gorm:"column:posted;default:false" json:"posted"`
	PostedBy         *uint      `gorm:"column:posted_by" json:"posted_by,omitempty"`
	PostedAt         *time.Time `gorm:"column:posted_at" json:"posted_at,omitempty"`
	Notes            string     `gorm:"column:notes;type:text" json:"notes,omitempty"`

	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	ProductionPlan *ProductionPlan                `gorm:"foreignKey:ProductionPlanID" json:"production_plan,omitempty"`
	Warehouse      *Warehouse                     `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	PostedByUser   *User                          `gorm:"foreignKey:PostedBy" json:"posted_by_user,omitempty"`
	Items          []*FinishedProductReceiptItem   `gorm:"foreignKey:FPRNId" json:"items,omitempty"`
}

func (FinishedProductReceipt) TableName() string {
	return "finished_product_receipts"
}

// FinishedProductReceiptItem represents a single line item in a FPRN
type FinishedProductReceiptItem struct {
	ID                 uint    `gorm:"primaryKey" json:"id"`
	FPRNId             uint    `gorm:"column:fprn_id;not null" json:"fprn_id"`
	FinishedProductID  uint    `gorm:"column:finished_product_id;not null" json:"finished_product_id"`
	WarehouseLocationID *uint  `gorm:"column:warehouse_location_id" json:"warehouse_location_id,omitempty"`
	Quantity           float64 `gorm:"column:quantity;type:decimal(15,3);not null" json:"quantity"`
	BatchNumber        string  `gorm:"column:batch_number;size:100" json:"batch_number,omitempty"`
	ManufactureDate    *string `gorm:"column:manufacture_date;type:date" json:"manufacture_date,omitempty"`
	ExpiryDate         *string `gorm:"column:expiry_date;type:date" json:"expiry_date,omitempty"`
	UnitCost           float64 `gorm:"column:unit_cost;type:decimal(15,2);default:0" json:"unit_cost"`
	Notes              string  `gorm:"column:notes;type:text" json:"notes,omitempty"`

	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	FinishedProduct     *FinishedProduct     `gorm:"foreignKey:FinishedProductID" json:"finished_product,omitempty"`
	WarehouseLocation   *WarehouseLocation   `gorm:"foreignKey:WarehouseLocationID" json:"warehouse_location,omitempty"`
}

func (FinishedProductReceiptItem) TableName() string {
	return "finished_product_receipt_items"
}
