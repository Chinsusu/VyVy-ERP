package models

import (
	"time"
)

// GoodsReceiptNote represents a record of goods received against a purchase order
type GoodsReceiptNote struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	GRNNumber       string    `gorm:"column:grn_number;uniqueIndex;size:50;not null" json:"grn_number"`
	PurchaseOrderID uint      `gorm:"column:purchase_order_id;not null" json:"purchase_order_id"`
	WarehouseID     uint      `gorm:"column:warehouse_id;not null" json:"warehouse_id"`

	// Dates
	ReceiptDate string `gorm:"column:receipt_date;type:date;not null" json:"receipt_date"`

	// Status: pending_qc, qc_completed, posted, cancelled
	Status string `gorm:"column:status;size:50;not null;default:pending_qc" json:"status"`

	// QC
	QCStatus     string     `gorm:"column:qc_status;size:50" json:"qc_status,omitempty"`
	QCApprovedBy *uint      `gorm:"column:qc_approved_by" json:"qc_approved_by,omitempty"`
	QCApprovedAt *time.Time `gorm:"column:qc_approved_at" json:"qc_approved_at,omitempty"`
	QCNotes      string     `gorm:"column:qc_notes;type:text" json:"qc_notes,omitempty"`

	// Posting
	Posted   bool       `gorm:"column:posted;default:false" json:"posted"`
	PostedBy *uint      `gorm:"column:posted_by" json:"posted_by,omitempty"`
	PostedAt *time.Time `gorm:"column:posted_at" json:"posted_at,omitempty"`

	// Additional info
	Notes string `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	PurchaseOrder  *PurchaseOrder  `gorm:"foreignKey:PurchaseOrderID" json:"purchase_order,omitempty"`
	Warehouse      *Warehouse      `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	QCApprovedUser *User           `gorm:"foreignKey:QCApprovedBy" json:"qc_approved_user,omitempty"`
	PostedByUser   *User           `gorm:"foreignKey:PostedBy" json:"posted_user,omitempty"`
	CreatedByUser  *User           `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser  *User           `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
	Items          []*GoodsReceiptNoteItem `gorm:"foreignKey:GRNID" json:"items,omitempty"`
}

// TableName specifies the table name for GoodsReceiptNote model
func (GoodsReceiptNote) TableName() string {
	return "goods_receipt_notes"
}

// SafeGoodsReceiptNote is a DTO that includes safe information
type SafeGoodsReceiptNote struct {
	ID              uint                        `json:"id"`
	GRNNumber       string                      `json:"grn_number"`
	PurchaseOrderID uint                        `json:"purchase_order_id"`
	WarehouseID     uint                        `json:"warehouse_id"`
	PurchaseOrder   *SafePurchaseOrder          `json:"purchase_order,omitempty"`
	Warehouse       *SafeWarehouse              `json:"warehouse,omitempty"`
	ReceiptDate     string                      `json:"receipt_date"`
	Status          string                      `json:"status"`
	QCStatus        string                      `json:"qc_status,omitempty"`
	QCApprovedBy    *uint                       `json:"qc_approved_by,omitempty"`
	QCApprovedAt    *time.Time                  `json:"qc_approved_at,omitempty"`
	QCNotes         string                      `json:"qc_notes,omitempty"`
	Posted          bool                        `json:"posted"`
	PostedBy        *uint                       `json:"posted_by,omitempty"`
	PostedAt        *time.Time                  `json:"posted_at,omitempty"`
	Notes           string                      `json:"notes,omitempty"`
	Items           []*SafeGoodsReceiptNoteItem `json:"items,omitempty"`
	CreatedAt       time.Time                   `json:"created_at"`
	UpdatedAt       time.Time                   `json:"updated_at"`
}

// ToSafe converts GoodsReceiptNote to SafeGoodsReceiptNote
func (grn *GoodsReceiptNote) ToSafe() *SafeGoodsReceiptNote {
	safe := &SafeGoodsReceiptNote{
		ID:              grn.ID,
		GRNNumber:       grn.GRNNumber,
		PurchaseOrderID: grn.PurchaseOrderID,
		WarehouseID:     grn.WarehouseID,
		ReceiptDate:     grn.ReceiptDate,
		Status:          grn.Status,
		QCStatus:        grn.QCStatus,
		QCApprovedBy:    grn.QCApprovedBy,
		QCApprovedAt:    grn.QCApprovedAt,
		QCNotes:         grn.QCNotes,
		Posted:          grn.Posted,
		PostedBy:        grn.PostedBy,
		PostedAt:        grn.PostedAt,
		Notes:           grn.Notes,
		CreatedAt:       grn.CreatedAt,
		UpdatedAt:       grn.UpdatedAt,
	}

	if grn.PurchaseOrder != nil {
		safe.PurchaseOrder = grn.PurchaseOrder.ToSafe()
	}
	if grn.Warehouse != nil {
		safe.Warehouse = grn.Warehouse.ToSafe()
	}
	if grn.Items != nil {
		safe.Items = make([]*SafeGoodsReceiptNoteItem, len(grn.Items))
		for i, item := range grn.Items {
			safe.Items[i] = item.ToSafe()
		}
	}

	return safe
}
