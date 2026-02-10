package dto

import "time"

// CreateMaterialRequestItemRequest represents the request to create a material request item
type CreateMaterialRequestItemRequest struct {
	MaterialID        uint    `json:"material_id" binding:"required"`
	RequestedQuantity float64 `json:"requested_quantity" binding:"required,gt=0"`
	Notes             string  `json:"notes"`
}

// CreateMaterialRequestRequest represents the request to create a material request
type CreateMaterialRequestRequest struct {
	MRNumber     string                             `json:"mr_number" binding:"required,min=2,max=50"`
	WarehouseID  uint                               `json:"warehouse_id" binding:"required"`
	Department   string                             `json:"department" binding:"required,min=2,max=100"`
	RequestDate  string                             `json:"request_date" binding:"required"` // YYYY-MM-DD
	RequiredDate string                             `json:"required_date"`                   // YYYY-MM-DD
	Purpose      string                             `json:"purpose"`
	Notes        string                             `json:"notes"`
	Items        []CreateMaterialRequestItemRequest `json:"items" binding:"required,min=1,dive"`
}

// UpdateMaterialRequestItemRequest represents the request to update a material request item
type UpdateMaterialRequestItemRequest struct {
	MaterialID        uint    `json:"material_id"`
	RequestedQuantity float64 `json:"requested_quantity" binding:"omitempty,gt=0"`
	Notes             string  `json:"notes"`
}

// UpdateMaterialRequestRequest represents the request to update a material request
type UpdateMaterialRequestRequest struct {
	MRNumber     string                             `json:"mr_number" binding:"omitempty,min=2,max=50"`
	WarehouseID  uint                               `json:"warehouse_id"`
	Department   string                             `json:"department" binding:"omitempty,min=2,max=100"`
	RequestDate  string                             `json:"request_date"`  // YYYY-MM-DD
	RequiredDate string                             `json:"required_date"` // YYYY-MM-DD
	Purpose      string                             `json:"purpose"`
	Notes        string                             `json:"notes"`
	Items        []UpdateMaterialRequestItemRequest `json:"items" binding:"omitempty,dive"`
}

// MaterialRequestFilterRequest represents the filter for listing material requests
type MaterialRequestFilterRequest struct {
	Search          string `form:"search"`
	WarehouseID     *uint  `form:"warehouse_id"`
	Department      string `form:"department"`
	Status          string `form:"status"`
	RequestDateFrom string `form:"request_date_from"` // YYYY-MM-DD
	RequestDateTo   string `form:"request_date_to"`   // YYYY-MM-DD
	Page            int    `form:"page"`
	PageSize        int    `form:"page_size"`
	SortBy          string `form:"sort_by"`
	SortOrder       string `form:"sort_order"`
}

// MaterialRequestResponse represents a material request response
type MaterialRequestResponse struct {
	ID           uint                          `json:"id"`
	MRNumber     string                        `json:"mr_number"`
	WarehouseID  uint                          `json:"warehouse_id"`
	Department   string                        `json:"department"`
	RequestDate  string                        `json:"request_date"`
	RequiredDate *string                       `json:"required_date,omitempty"`
	Status       string                        `json:"status"`
	Purpose      string                        `json:"purpose,omitempty"`
	Notes        string                        `json:"notes,omitempty"`
	ApprovedBy   *uint                         `json:"approved_by,omitempty"`
	ApprovedAt   *time.Time                    `json:"approved_at,omitempty"`
	Items        []MaterialRequestItemResponse `json:"items,omitempty"`
	CreatedAt    time.Time                     `json:"created_at"`
	UpdatedAt    time.Time                     `json:"updated_at"`
}

// MaterialRequestItemResponse represents a material request item response
type MaterialRequestItemResponse struct {
	ID                uint    `json:"id"`
	MaterialID        uint    `json:"material_id"`
	RequestedQuantity float64 `json:"requested_quantity"`
	IssuedQuantity    float64 `json:"issued_quantity"`
	Notes             string  `json:"notes,omitempty"`
}
