package dto

// CreateWarehouseRequest represents the request body for creating a warehouse
type CreateWarehouseRequest struct {
	Code          string  `json:"code" binding:"required,min=1,max=50"`
	Name          string  `json:"name" binding:"required,min=1,max=255"`
	WarehouseType string  `json:"warehouse_type" binding:"omitempty,max=50"`
	Address       *string `json:"address"`
	City          *string `json:"city" binding:"omitempty,max=100"`
	ManagerID     *uint   `json:"manager_id"`
	IsActive      bool    `json:"is_active"`
	Notes         *string `json:"notes"`
}

// UpdateWarehouseRequest represents the request body for updating a warehouse
type UpdateWarehouseRequest struct {
	Code          string  `json:"code" binding:"omitempty,min=1,max=50"`
	Name          string  `json:"name" binding:"omitempty,min=1,max=255"`
	WarehouseType string  `json:"warehouse_type" binding:"omitempty,max=50"`
	Address       *string `json:"address"`
	City          *string `json:"city" binding:"omitempty,max=100"`
	ManagerID     *uint   `json:"manager_id"`
	IsActive      *bool   `json:"is_active"`
	Notes         *string `json:"notes"`
}

// WarehouseFilterRequest represents query parameters for filtering warehouses
type WarehouseFilterRequest struct {
	Search        string `form:"search"`
	WarehouseType string `form:"warehouse_type"`
	City          string `form:"city"`
	IsActive      *bool  `form:"is_active"`
	Page          int    `form:"page" binding:"omitempty,min=1"`
	PageSize      int    `form:"page_size" binding:"omitempty,min=1,max=100"`
	SortBy        string `form:"sort_by" binding:"omitempty,oneof=id code name warehouse_type city created_at updated_at"`
	SortOrder     string `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}
