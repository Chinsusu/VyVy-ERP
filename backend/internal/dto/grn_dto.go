package dto

import "time"

// CreateGRNItemRequest represents the request to create a GRN item
type CreateGRNItemRequest struct {
	POItemID            uint    `json:"po_item_id" binding:"required"`
	MaterialID          uint    `json:"material_id" binding:"required"`
	WarehouseLocationID *uint   `json:"warehouse_location_id"`
	Quantity            float64 `json:"quantity" binding:"required,gt=0"`
	UnitCost            float64 `json:"unit_cost" binding:"required,gte=0"`
	BatchNumber         string  `json:"batch_number"`
	LotNumber           string  `json:"lot_number"`
	ManufactureDate     string  `json:"manufacture_date"` // YYYY-MM-DD
	ExpiryDate          string  `json:"expiry_date"`      // YYYY-MM-DD
	Notes               string  `json:"notes"`
}

// CreateGRNRequest represents the request to create a GRN
type CreateGRNRequest struct {
	GRNNumber       string                 `json:"grn_number" binding:"required,min=2,max=50"`
	PurchaseOrderID uint                   `json:"purchase_order_id" binding:"required"`
	WarehouseID     uint                   `json:"warehouse_id" binding:"required"`
	ReceiptDate     string                 `json:"receipt_date" binding:"required"` // YYYY-MM-DD
	Notes           string                 `json:"notes"`
	Items           []CreateGRNItemRequest `json:"items" binding:"required,min=1,dive"`
}

// UpdateGRNQCItemRequest represents the QC update for a single item
type UpdateGRNQCItemRequest struct {
	AcceptedQuantity float64 `json:"accepted_quantity" binding:"required,gte=0"`
	RejectedQuantity float64 `json:"rejected_quantity" binding:"required,gte=0"`
	QCStatus         string  `json:"qc_status" binding:"required"` // pass, fail, partial
	QCNotes          string  `json:"qc_notes"`
}

// UpdateGRNQCRequest represents the bulk QC update for a GRN
type UpdateGRNQCRequest struct {
	Items map[uint]UpdateGRNQCItemRequest `json:"items" binding:"required"`
	Notes string                         `json:"notes"`
}

// GRNFilterRequest represents the filter for listing GRNs
type GRNFilterRequest struct {
	Search          string `form:"search"`
	PurchaseOrderID *uint  `form:"purchase_order_id"`
	WarehouseID     *uint  `form:"warehouse_id"`
	Status          string `form:"status"`
	ReceiptDateFrom string `form:"receipt_date_from"` // YYYY-MM-DD
	ReceiptDateTo   string `form:"receipt_date_to"`   // YYYY-MM-DD
	Page            int    `form:"page"`
	PageSize        int    `form:"page_size"`
	SortBy          string `form:"sort_by"`
	SortOrder       string `form:"sort_order"`
}

// GRNResponse represents a GRN response with metadata
type GRNResponse struct {
	ID              uint               `json:"id"`
	GRNNumber       string             `json:"grn_number"`
	PurchaseOrderID uint               `json:"purchase_order_id"`
	WarehouseID     uint               `json:"warehouse_id"`
	ReceiptDate     string             `json:"receipt_date"`
	Status          string             `json:"status"`
	QCStatus        string             `json:"qc_status,omitempty"`
	QCApprovedBy    *uint              `json:"qc_approved_by,omitempty"`
	QCApprovedAt    *time.Time         `json:"qc_approved_at,omitempty"`
	QCNotes         string             `json:"qc_notes,omitempty"`
	Posted          bool               `json:"posted"`
	PostedBy        *uint              `json:"posted_by,omitempty"`
	PostedAt        *time.Time         `json:"posted_at,omitempty"`
	Notes           string             `json:"notes,omitempty"`
	Items           []GRNItemResponse  `json:"items,omitempty"`
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
}

// GRNItemResponse represents a GRN item response
type GRNItemResponse struct {
	ID                  uint      `json:"id"`
	POItemID            uint      `json:"po_item_id"`
	MaterialID          uint      `json:"material_id"`
	WarehouseLocationID *uint     `json:"warehouse_location_id,omitempty"`
	Quantity            float64   `json:"quantity"`
	AcceptedQuantity    float64   `json:"accepted_quantity"`
	RejectedQuantity    float64   `json:"rejected_quantity"`
	BatchNumber         string    `json:"batch_number,omitempty"`
	LotNumber           string    `json:"lot_number,omitempty"`
	ManufactureDate     *string   `json:"manufacture_date,omitempty"`
	ExpiryDate          *string   `json:"expiry_date,omitempty"`
	UnitCost            float64   `json:"unit_cost"`
	QCStatus            string    `json:"qc_status,omitempty"`
	QCNotes             string    `json:"qc_notes,omitempty"`
	Notes               string    `json:"notes,omitempty"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}
