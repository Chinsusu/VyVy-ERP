package dto

// CreateWarehouseLocationRequest represents the request body for creating a warehouse location
type CreateWarehouseLocationRequest struct {
	WarehouseID  uint    `json:"warehouse_id" binding:"required"`
	Code         string  `json:"code" binding:"required,min=1,max=50"`
	Name         string  `json:"name" binding:"required,min=1,max=255"`
	Aisle        *string `json:"aisle" binding:"omitempty,max=10"`
	Rack         *string `json:"rack" binding:"omitempty,max=10"`
	Shelf        *string `json:"shelf" binding:"omitempty,max=10"`
	Bin          *string `json:"bin" binding:"omitempty,max=10"`
	LocationType string  `json:"location_type" binding:"omitempty,max=50"`
	IsActive     bool    `json:"is_active"`
	Notes        *string `json:"notes"`
}

// UpdateWarehouseLocationRequest represents the request body for updating a warehouse location
type UpdateWarehouseLocationRequest struct {
	WarehouseID  uint    `json:"warehouse_id" binding:"omitempty"`
	Code         string  `json:"code" binding:"omitempty,min=1,max=50"`
	Name         string  `json:"name" binding:"omitempty,min=1,max=255"`
	Aisle        *string `json:"aisle" binding:"omitempty,max=10"`
	Rack         *string `json:"rack" binding:"omitempty,max=10"`
	Shelf        *string `json:"shelf" binding:"omitempty,max=10"`
	Bin          *string `json:"bin" binding:"omitempty,max=10"`
	LocationType string  `json:"location_type" binding:"omitempty,max=50"`
	IsActive     *bool   `json:"is_active"`
	Notes        *string `json:"notes"`
}

// WarehouseLocationFilterRequest represents query parameters for filtering warehouse locations
type WarehouseLocationFilterRequest struct {
	Search       string `form:"search"`
	WarehouseID  *uint  `form:"warehouse_id"`
	LocationType string `form:"location_type"`
	IsActive     *bool  `form:"is_active"`
	Page         int    `form:"page" binding:"omitempty,min=1"`
	PageSize     int    `form:"page_size" binding:"omitempty,min=1,max=100"`
	SortBy       string `form:"sort_by" binding:"omitempty,oneof=id code name warehouse_id location_type created_at updated_at"`
	SortOrder    string `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}
