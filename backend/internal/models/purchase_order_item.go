package models

import (
	"time"
)

// PurchaseOrderItem represents a line item in a purchase order
type PurchaseOrderItem struct {
	ID              uint    `gorm:"primaryKey" json:"id"`
	PurchaseOrderID uint    `gorm:"column:purchase_order_id;not null" json:"purchase_order_id"`
	MaterialID      uint    `gorm:"column:material_id;not null" json:"material_id"`

	// Quantity & Pricing
	Quantity     float64 `gorm:"column:quantity;type:decimal(15,3);not null" json:"quantity"`
	UnitPrice    float64 `gorm:"column:unit_price;type:decimal(15,2);not null" json:"unit_price"`
	TaxRate      float64 `gorm:"column:tax_rate;type:decimal(5,2);default:0" json:"tax_rate"`
	DiscountRate float64 `gorm:"column:discount_rate;type:decimal(5,2);default:0" json:"discount_rate"`
	LineTotal    float64 `gorm:"column:line_total;type:decimal(15,2);not null" json:"line_total"`

	// Fulfillment tracking
	ReceivedQuantity float64 `gorm:"column:received_quantity;type:decimal(15,3);default:0" json:"received_quantity"`

	// Additional info
	Notes string `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	PurchaseOrder *PurchaseOrder `gorm:"foreignKey:PurchaseOrderID" json:"purchase_order,omitempty"`
	Material      *Material      `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
}

// TableName specifies the table name for PurchaseOrderItem model
func (PurchaseOrderItem) TableName() string {
	return "purchase_order_items"
}

// SafePurchaseOrderItem is a DTO that includes safe information
type SafePurchaseOrderItem struct {
	ID               uint           `json:"id"`
	PurchaseOrderID  uint           `json:"purchase_order_id"`
	MaterialID       uint           `json:"material_id"`
	Material         *SafeMaterial  `json:"material,omitempty"`
	Quantity         float64        `json:"quantity"`
	UnitPrice        float64        `json:"unit_price"`
	TaxRate          float64        `json:"tax_rate"`
	DiscountRate     float64        `json:"discount_rate"`
	LineTotal        float64        `json:"line_total"`
	ReceivedQuantity float64        `json:"received_quantity"`
	Notes            string         `json:"notes,omitempty"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
}

// ToSafe converts PurchaseOrderItem to SafePurchaseOrderItem
func (item *PurchaseOrderItem) ToSafe() *SafePurchaseOrderItem {
	safe := &SafePurchaseOrderItem{
		ID:               item.ID,
		PurchaseOrderID:  item.PurchaseOrderID,
		MaterialID:       item.MaterialID,
		Quantity:         item.Quantity,
		UnitPrice:        item.UnitPrice,
		TaxRate:          item.TaxRate,
		DiscountRate:     item.DiscountRate,
		LineTotal:        item.LineTotal,
		ReceivedQuantity: item.ReceivedQuantity,
		Notes:            item.Notes,
		CreatedAt:        item.CreatedAt,
		UpdatedAt:        item.UpdatedAt,
	}

	if item.Material != nil {
		safe.Material = item.Material.ToSafe()
	}

	return safe
}

// CalculateLineTotal calculates the line total for the item
func (item *PurchaseOrderItem) CalculateLineTotal() {
	// line_total = quantity * unit_price * (1 + tax_rate/100 - discount_rate/100)
	taxMultiplier := 1 + (item.TaxRate / 100)
	discountMultiplier := 1 - (item.DiscountRate / 100)
	item.LineTotal = item.Quantity * item.UnitPrice * taxMultiplier * discountMultiplier
}
