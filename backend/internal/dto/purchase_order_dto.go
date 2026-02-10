package dto

import "time"

// CreatePurchaseOrderItemRequest represents the request to create a purchase order item
type CreatePurchaseOrderItemRequest struct {
	MaterialID   uint    `json:"material_id" binding:"required"`
	Quantity     float64 `json:"quantity" binding:"required,gt=0"`
	UnitPrice    float64 `json:"unit_price" binding:"required,gte=0"`
	TaxRate      float64 `json:"tax_rate" binding:"gte=0,lte=100"`
	DiscountRate float64 `json:"discount_rate" binding:"gte=0,lte=100"`
	Notes        string  `json:"notes"`
}

// CreatePurchaseOrderRequest represents the request to create a purchase order
type CreatePurchaseOrderRequest struct {
	PONumber             string                            `json:"po_number" binding:"required,min=2,max=50"`
	SupplierID           uint                              `json:"supplier_id" binding:"required"`
	WarehouseID          uint                              `json:"warehouse_id" binding:"required"`
	OrderDate            string                            `json:"order_date" binding:"required"` // YYYY-MM-DD
	ExpectedDeliveryDate string                            `json:"expected_delivery_date"`        // YYYY-MM-DD
	PaymentTerms         string                            `json:"payment_terms"`
	ShippingMethod       string                            `json:"shipping_method"`
	Notes                string                            `json:"notes"`
	Items                []CreatePurchaseOrderItemRequest  `json:"items" binding:"required,min=1,dive"`
}

// UpdatePurchaseOrderItemRequest represents the request to update a purchase order item
type UpdatePurchaseOrderItemRequest struct {
	MaterialID   uint    `json:"material_id"`
	Quantity     float64 `json:"quantity" binding:"omitempty,gt=0"`
	UnitPrice    float64 `json:"unit_price" binding:"omitempty,gte=0"`
	TaxRate      float64 `json:"tax_rate" binding:"gte=0,lte=100"`
	DiscountRate float64 `json:"discount_rate" binding:"gte=0,lte=100"`
	Notes        string  `json:"notes"`
}

// UpdatePurchaseOrderRequest represents the request to update a purchase order
type UpdatePurchaseOrderRequest struct {
	PONumber             string                            `json:"po_number" binding:"omitempty,min=2,max=50"`
	SupplierID           uint                              `json:"supplier_id"`
	WarehouseID          uint                              `json:"warehouse_id"`
	OrderDate            string                            `json:"order_date"`            // YYYY-MM-DD
	ExpectedDeliveryDate string                            `json:"expected_delivery_date"` // YYYY-MM-DD
	PaymentTerms         string                            `json:"payment_terms"`
	ShippingMethod       string                            `json:"shipping_method"`
	Notes                string                            `json:"notes"`
	Items                []UpdatePurchaseOrderItemRequest  `json:"items" binding:"omitempty,dive"`
}

// PurchaseOrderFilterRequest represents the filter for listing purchase orders
type PurchaseOrderFilterRequest struct {
	Search        string `form:"search"`
	SupplierID    *uint  `form:"supplier_id"`
	WarehouseID   *uint  `form:"warehouse_id"`
	Status        string `form:"status"`
	OrderDateFrom string `form:"order_date_from"` // YYYY-MM-DD
	OrderDateTo   string `form:"order_date_to"`   // YYYY-MM-DD
	Page          int    `form:"page"`
	PageSize      int    `form:"page_size"`
	SortBy        string `form:"sort_by"`
	SortOrder     string `form:"sort_order"`
}

// PurchaseOrderResponse represents a purchase order response with metadata
type PurchaseOrderResponse struct {
	ID                   uint                        `json:"id"`
	PONumber             string                      `json:"po_number"`
	SupplierID           uint                        `json:"supplier_id"`
	WarehouseID          uint                        `json:"warehouse_id"`
	OrderDate            string                      `json:"order_date"`
	ExpectedDeliveryDate *string                     `json:"expected_delivery_date,omitempty"`
	Status               string                      `json:"status"`
	Subtotal             float64                     `json:"subtotal"`
	TaxAmount            float64                     `json:"tax_amount"`
	DiscountAmount       float64                     `json:"discount_amount"`
	TotalAmount          float64                     `json:"total_amount"`
	PaymentTerms         string                      `json:"payment_terms,omitempty"`
	ShippingMethod       string                      `json:"shipping_method,omitempty"`
	Notes                string                      `json:"notes,omitempty"`
	ApprovedBy           *uint                       `json:"approved_by,omitempty"`
	ApprovedAt           *time.Time                  `json:"approved_at,omitempty"`
	Items                []PurchaseOrderItemResponse `json:"items,omitempty"`
	CreatedAt            time.Time                   `json:"created_at"`
	UpdatedAt            time.Time                   `json:"updated_at"`
}

// PurchaseOrderItemResponse represents a purchase order item response
type PurchaseOrderItemResponse struct {
	ID               uint      `json:"id"`
	MaterialID       uint      `json:"material_id"`
	Quantity         float64   `json:"quantity"`
	UnitPrice        float64   `json:"unit_price"`
	TaxRate          float64   `json:"tax_rate"`
	DiscountRate     float64   `json:"discount_rate"`
	LineTotal        float64   `json:"line_total"`
	ReceivedQuantity float64   `json:"received_quantity"`
	Notes            string    `json:"notes,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
