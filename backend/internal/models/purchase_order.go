package models

import (
	"time"
)

// PurchaseOrder represents a purchase order in the system
type PurchaseOrder struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	PONumber   string `gorm:"column:po_number;uniqueIndex;size:50;not null" json:"po_number"`
	SupplierID uint   `gorm:"column:supplier_id;not null" json:"supplier_id"`
	WarehouseID uint  `gorm:"column:warehouse_id;not null" json:"warehouse_id"`
	POType     string `gorm:"column:po_type;size:50;default:material" json:"po_type,omitempty"`

	// Dates
	OrderDate            string  `gorm:"column:order_date;type:date;not null" json:"order_date"`
	ExpectedDeliveryDate *string `gorm:"column:expected_delivery_date;type:date" json:"expected_delivery_date,omitempty"`

	// Status
	Status string `gorm:"column:status;size:50;not null;default:draft" json:"status"`

	// Multi-step tracking (matching spreadsheet: DUYỆT CHI → ĐẶT HÀNG → NHẬN HÀNG → THANH TOÁN → HÓA ĐƠN)
	ApprovalStatus string `gorm:"column:approval_status;size:50;default:pending" json:"approval_status,omitempty"`
	OrderStatus    string `gorm:"column:order_status;size:50;default:pending" json:"order_status,omitempty"`
	ReceiptStatus  string `gorm:"column:receipt_status;size:50;default:pending" json:"receipt_status,omitempty"`
	PaymentStatus  string `gorm:"column:payment_status;size:50;default:pending" json:"payment_status,omitempty"`
	InvoiceStatus  string `gorm:"column:invoice_status;size:50;default:pending" json:"invoice_status,omitempty"`

	// Amounts
	Subtotal       float64 `gorm:"column:subtotal;type:decimal(15,2);default:0" json:"subtotal"`
	TaxAmount      float64 `gorm:"column:tax_amount;type:decimal(15,2);default:0" json:"tax_amount"`
	DiscountAmount float64 `gorm:"column:discount_amount;type:decimal(15,2);default:0" json:"discount_amount"`
	TotalAmount    float64 `gorm:"column:total_amount;type:decimal(15,2);default:0" json:"total_amount"`
	VATRate        float64 `gorm:"column:vat_rate;type:decimal(5,2);default:0" json:"vat_rate,omitempty"`

	// Additional info
	Description    string `gorm:"column:description;type:text" json:"description,omitempty"`
	PaymentTerms   string `gorm:"column:payment_terms;size:100" json:"payment_terms,omitempty"`
	ShippingMethod string `gorm:"column:shipping_method;size:100" json:"shipping_method,omitempty"`
	InvoiceNumber  string `gorm:"column:invoice_number;size:100" json:"invoice_number,omitempty"`
	InvoiceDate    *string `gorm:"column:invoice_date;type:date" json:"invoice_date,omitempty"`
	Notes          string `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Approval
	ApprovedBy *uint      `gorm:"column:approved_by" json:"approved_by,omitempty"`
	ApprovedAt *time.Time `gorm:"column:approved_at" json:"approved_at,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	Supplier       *Supplier           `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
	Warehouse      *Warehouse          `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	ApprovedByUser *User               `gorm:"foreignKey:ApprovedBy" json:"approved_by_user,omitempty"`
	CreatedByUser  *User               `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser  *User               `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
	Items          []*PurchaseOrderItem `gorm:"foreignKey:PurchaseOrderID" json:"items,omitempty"`
}

// TableName specifies the table name for PurchaseOrder model
func (PurchaseOrder) TableName() string {
	return "purchase_orders"
}

// SafePurchaseOrder is a DTO that includes safe information
type SafePurchaseOrder struct {
	ID                   uint                      `json:"id"`
	PONumber             string                    `json:"po_number"`
	SupplierID           uint                      `json:"supplier_id"`
	WarehouseID          uint                      `json:"warehouse_id"`
	POType               string                    `json:"po_type,omitempty"`
	Supplier             *SafeSupplier             `json:"supplier,omitempty"`
	Warehouse            *SafeWarehouse            `json:"warehouse,omitempty"`
	OrderDate            string                    `json:"order_date"`
	ExpectedDeliveryDate *string                   `json:"expected_delivery_date,omitempty"`
	Status               string                    `json:"status"`
	ApprovalStatus       string                    `json:"approval_status,omitempty"`
	OrderStatus          string                    `json:"order_status,omitempty"`
	ReceiptStatus        string                    `json:"receipt_status,omitempty"`
	PaymentStatus        string                    `json:"payment_status,omitempty"`
	InvoiceStatus        string                    `json:"invoice_status,omitempty"`
	Subtotal             float64                   `json:"subtotal"`
	TaxAmount            float64                   `json:"tax_amount"`
	DiscountAmount       float64                   `json:"discount_amount"`
	TotalAmount          float64                   `json:"total_amount"`
	VATRate              float64                   `json:"vat_rate,omitempty"`
	Description          string                    `json:"description,omitempty"`
	PaymentTerms         string                    `json:"payment_terms,omitempty"`
	ShippingMethod       string                    `json:"shipping_method,omitempty"`
	InvoiceNumber        string                    `json:"invoice_number,omitempty"`
	InvoiceDate          *string                   `json:"invoice_date,omitempty"`
	Notes                string                    `json:"notes,omitempty"`
	ApprovedBy           *uint                     `json:"approved_by,omitempty"`
	ApprovedAt           *time.Time                `json:"approved_at,omitempty"`
	Items                []*SafePurchaseOrderItem  `json:"items,omitempty"`
	CreatedAt            time.Time                 `json:"created_at"`
	UpdatedAt            time.Time                 `json:"updated_at"`
}

// ToSafe converts PurchaseOrder to SafePurchaseOrder
func (po *PurchaseOrder) ToSafe() *SafePurchaseOrder {
	safe := &SafePurchaseOrder{
		ID:                   po.ID,
		PONumber:             po.PONumber,
		SupplierID:           po.SupplierID,
		WarehouseID:          po.WarehouseID,
		POType:               po.POType,
		OrderDate:            po.OrderDate,
		ExpectedDeliveryDate: po.ExpectedDeliveryDate,
		Status:               po.Status,
		ApprovalStatus:       po.ApprovalStatus,
		OrderStatus:          po.OrderStatus,
		ReceiptStatus:        po.ReceiptStatus,
		PaymentStatus:        po.PaymentStatus,
		InvoiceStatus:        po.InvoiceStatus,
		Subtotal:             po.Subtotal,
		TaxAmount:            po.TaxAmount,
		DiscountAmount:       po.DiscountAmount,
		TotalAmount:          po.TotalAmount,
		VATRate:              po.VATRate,
		Description:          po.Description,
		PaymentTerms:         po.PaymentTerms,
		ShippingMethod:       po.ShippingMethod,
		InvoiceNumber:        po.InvoiceNumber,
		InvoiceDate:          po.InvoiceDate,
		Notes:                po.Notes,
		ApprovedBy:           po.ApprovedBy,
		ApprovedAt:           po.ApprovedAt,
		CreatedAt:            po.CreatedAt,
		UpdatedAt:            po.UpdatedAt,
	}

	// Convert relationships
	if po.Supplier != nil {
		safe.Supplier = po.Supplier.ToSafe()
	}
	if po.Warehouse != nil {
		safe.Warehouse = po.Warehouse.ToSafe()
	}
	if po.Items != nil {
		safe.Items = make([]*SafePurchaseOrderItem, len(po.Items))
		for i, item := range po.Items {
			safe.Items[i] = item.ToSafe()
		}
	}

	return safe
}
