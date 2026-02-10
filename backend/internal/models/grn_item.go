package models

import (
	"time"
)

// GoodsReceiptNoteItem represents a line item in a goods receipt note
type GoodsReceiptNoteItem struct {
	ID                  uint    `gorm:"primaryKey" json:"id"`
	GRNID               uint    `gorm:"column:grn_id;not null" json:"grn_id"`
	POItemID            uint    `gorm:"column:po_item_id;not null" json:"po_item_id"`
	MaterialID          uint    `gorm:"column:material_id;not null" json:"material_id"`
	WarehouseLocationID *uint   `gorm:"column:warehouse_location_id" json:"warehouse_location_id,omitempty"`

	// Quantity
	Quantity         float64 `gorm:"column:quantity;type:decimal(15,3);not null" json:"quantity"`
	AcceptedQuantity float64 `gorm:"column:accepted_quantity;type:decimal(15,3);default:0" json:"accepted_quantity"`
	RejectedQuantity float64 `gorm:"column:rejected_quantity;type:decimal(15,3);default:0" json:"rejected_quantity"`

	// Batch/Lot tracking
	BatchNumber     string     `gorm:"column:batch_number;size:100" json:"batch_number,omitempty"`
	LotNumber       string     `gorm:"column:lot_number;size:100" json:"lot_number,omitempty"`
	ManufactureDate *string    `gorm:"column:manufacture_date;type:date" json:"manufacture_date,omitempty"`
	ExpiryDate      *string    `gorm:"column:expiry_date;type:date" json:"expiry_date,omitempty"`

	// Pricing
	UnitCost float64 `gorm:"column:unit_cost;type:decimal(15,2);not null" json:"unit_cost"`

	// QC
	QCStatus string `gorm:"column:qc_status;size:50" json:"qc_status,omitempty"`
	QCNotes  string `gorm:"column:qc_notes;type:text" json:"qc_notes,omitempty"`

	// Additional info
	Notes string `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	GRN               *GoodsReceiptNote  `gorm:"foreignKey:GRNID" json:"grn,omitempty"`
	PurchaseOrderItem *PurchaseOrderItem `gorm:"foreignKey:POItemID" json:"po_item,omitempty"`
	Material          *Material          `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
	WarehouseLocation *WarehouseLocation `gorm:"foreignKey:WarehouseLocationID" json:"warehouse_location,omitempty"`
}

// TableName specifies the table name for GoodsReceiptNoteItem model
func (GoodsReceiptNoteItem) TableName() string {
	return "goods_receipt_note_items"
}

// SafeGoodsReceiptNoteItem is a DTO that includes safe information
type SafeGoodsReceiptNoteItem struct {
	ID                  uint                 `json:"id"`
	GRNID               uint                 `json:"grn_id"`
	POItemID            uint                 `json:"po_item_id"`
	MaterialID          uint                 `json:"material_id"`
	Material            *SafeMaterial        `json:"material,omitempty"`
	WarehouseLocationID *uint                `json:"warehouse_location_id,omitempty"`
	WarehouseLocation   *SafeWarehouseLocation `json:"warehouse_location,omitempty"`
	Quantity            float64              `json:"quantity"`
	AcceptedQuantity    float64              `json:"accepted_quantity"`
	RejectedQuantity    float64              `json:"rejected_quantity"`
	BatchNumber         string               `json:"batch_number,omitempty"`
	LotNumber           string               `json:"lot_number,omitempty"`
	ManufactureDate     *string              `json:"manufacture_date,omitempty"`
	ExpiryDate          *string              `json:"expiry_date,omitempty"`
	UnitCost            float64              `json:"unit_cost"`
	QCStatus            string               `json:"qc_status,omitempty"`
	QCNotes             string               `json:"qc_notes,omitempty"`
	Notes               string               `json:"notes,omitempty"`
	CreatedAt           time.Time            `json:"created_at"`
	UpdatedAt           time.Time            `json:"updated_at"`
}

// ToSafe converts GoodsReceiptNoteItem to SafeGoodsReceiptNoteItem
func (item *GoodsReceiptNoteItem) ToSafe() *SafeGoodsReceiptNoteItem {
	safe := &SafeGoodsReceiptNoteItem{
		ID:                  item.ID,
		GRNID:               item.GRNID,
		POItemID:            item.POItemID,
		MaterialID:          item.MaterialID,
		WarehouseLocationID: item.WarehouseLocationID,
		Quantity:            item.Quantity,
		AcceptedQuantity:    item.AcceptedQuantity,
		RejectedQuantity:    item.RejectedQuantity,
		BatchNumber:         item.BatchNumber,
		LotNumber:           item.LotNumber,
		ManufactureDate:     item.ManufactureDate,
		ExpiryDate:          item.ExpiryDate,
		UnitCost:            item.UnitCost,
		QCStatus:            item.QCStatus,
		QCNotes:             item.QCNotes,
		Notes:               item.Notes,
		CreatedAt:           item.CreatedAt,
		UpdatedAt:           item.UpdatedAt,
	}

	if item.Material != nil {
		safe.Material = item.Material.ToSafe()
	}
	if item.WarehouseLocation != nil {
		safe.WarehouseLocation = item.WarehouseLocation.ToSafe()
	}

	return safe
}
