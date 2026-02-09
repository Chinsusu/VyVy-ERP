package dto

// CreateMaterialRequest represents the request body for creating a material
type CreateMaterialRequest struct {
	Code              string   `json:"code" binding:"required,max=50"`
	TradingName       string   `json:"trading_name" binding:"required,max=255"`
	InciName          *string  `json:"inci_name" binding:"omitempty,max=255"`
	MaterialType      string   `json:"material_type" binding:"required,max=50"`
	Category          *string  `json:"category" binding:"omitempty,max=100"`
	SubCategory       *string  `json:"sub_category" binding:"omitempty,max=100"`
	Unit              string   `json:"unit" binding:"required,max=20"`
	SupplierID        *int64   `json:"supplier_id"`
	StandardCost      *float64 `json:"standard_cost" binding:"omitempty,gte=0"`
	LastPurchasePrice *float64 `json:"last_purchase_price" binding:"omitempty,gte=0"`
	MinStockLevel     *float64 `json:"min_stock_level" binding:"omitempty,gte=0"`
	MaxStockLevel     *float64 `json:"max_stock_level" binding:"omitempty,gte=0"`
	ReorderPoint      *float64 `json:"reorder_point" binding:"omitempty,gte=0"`
	ReorderQuantity   *float64 `json:"reorder_quantity" binding:"omitempty,gte=0"`
	RequiresQC        bool     `json:"requires_qc"`
	ShelfLifeDays     *int     `json:"shelf_life_days" binding:"omitempty,gte=0"`
	StorageConditions *string  `json:"storage_conditions"`
	Hazardous         bool     `json:"hazardous"`
	IsActive          bool     `json:"is_active"`
	Notes             *string  `json:"notes"`
}

// UpdateMaterialRequest represents the request body for updating a material
type UpdateMaterialRequest struct {
	TradingName       *string  `json:"trading_name" binding:"omitempty,max=255"`
	InciName          *string  `json:"inci_name" binding:"omitempty,max=255"`
	MaterialType      *string  `json:"material_type" binding:"omitempty,max=50"`
	Category          *string  `json:"category" binding:"omitempty,max=100"`
	SubCategory       *string  `json:"sub_category" binding:"omitempty,max=100"`
	Unit              *string  `json:"unit" binding:"omitempty,max=20"`
	SupplierID        *int64   `json:"supplier_id"`
	StandardCost      *float64 `json:"standard_cost" binding:"omitempty,gte=0"`
	LastPurchasePrice *float64 `json:"last_purchase_price" binding:"omitempty,gte=0"`
	MinStockLevel     *float64 `json:"min_stock_level" binding:"omitempty,gte=0"`
	MaxStockLevel     *float64 `json:"max_stock_level" binding:"omitempty,gte=0"`
	ReorderPoint      *float64 `json:"reorder_point" binding:"omitempty,gte=0"`
	ReorderQuantity   *float64 `json:"reorder_quantity" binding:"omitempty,gte=0"`
	RequiresQC        *bool    `json:"requires_qc"`
	ShelfLifeDays     *int     `json:"shelf_life_days" binding:"omitempty,gte=0"`
	StorageConditions *string  `json:"storage_conditions"`
	Hazardous         *bool    `json:"hazardous"`
	IsActive          *bool    `json:"is_active"`
	Notes             *string  `json:"notes"`
}

// MaterialFilterRequest represents query parameters for filtering materials
type MaterialFilterRequest struct {
	Search       string  `form:"search"`
	MaterialType string  `form:"material_type"`
	Category     string  `form:"category"`
	SupplierID   *int64  `form:"supplier_id"`
	RequiresQC   *bool   `form:"requires_qc"`
	Hazardous    *bool   `form:"hazardous"`
	IsActive     *bool   `form:"is_active"`
	Page         int     `form:"page" binding:"omitempty,gte=1"`
	PageSize     int     `form:"page_size" binding:"omitempty,gte=1,lte=100"`
	SortBy       string  `form:"sort_by"`
	SortOrder    string  `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}
