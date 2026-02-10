package dto

// CreateFinishedProductRequest represents the request to create a finished product
type CreateFinishedProductRequest struct {
	Code        string   `json:"code" binding:"required,min=2,max=50"`
	Name        string   `json:"name" binding:"required,max=255"`
	NameEn      string   `json:"name_en" binding:"omitempty,max=255"`
	Category    string   `json:"category" binding:"omitempty,max=100"`
	SubCategory string   `json:"sub_category" binding:"omitempty,max=100"`
	Unit        string   `json:"unit" binding:"required,max=20"`
	
	// Pricing
	StandardCost *float64 `json:"standard_cost" binding:"omitempty,min=0"`
	SellingPrice *float64 `json:"selling_price" binding:"omitempty,min=0"`
	
	// Specifications
	NetWeight   *float64 `json:"net_weight" binding:"omitempty,min=0"`
	GrossWeight *float64 `json:"gross_weight" binding:"omitempty,min=0"`
	Volume      *float64 `json:"volume" binding:"omitempty,min=0"`
	
	// Stock control
	MinStockLevel *float64 `json:"min_stock_level" binding:"omitempty,min=0"`
	MaxStockLevel *float64 `json:"max_stock_level" binding:"omitempty,min=0"`
	ReorderPoint  *float64 `json:"reorder_point" binding:"omitempty,min=0"`
	
	// Product info
	ShelfLifeDays     *int   `json:"shelf_life_days" binding:"omitempty,min=0"`
	StorageConditions string `json:"storage_conditions" binding:"omitempty"`
	Barcode           string `json:"barcode" binding:"omitempty,max=100"`
	
	// Status
	IsActive bool   `json:"is_active"`
	Notes    string `json:"notes" binding:"omitempty"`
}

// UpdateFinishedProductRequest represents the request to update a finished product
type UpdateFinishedProductRequest struct {
	Code        string   `json:"code" binding:"omitempty,min=2,max=50"`
	Name        string   `json:"name" binding:"omitempty,max=255"`
	NameEn      string   `json:"name_en" binding:"omitempty,max=255"`
	Category    string   `json:"category" binding:"omitempty,max=100"`
	SubCategory string   `json:"sub_category" binding:"omitempty,max=100"`
	Unit        string   `json:"unit" binding:"omitempty,max=20"`
	
	// Pricing
	StandardCost *float64 `json:"standard_cost" binding:"omitempty,min=0"`
	SellingPrice *float64 `json:"selling_price" binding:"omitempty,min=0"`
	
	// Specifications
	NetWeight   *float64 `json:"net_weight" binding:"omitempty,min=0"`
	GrossWeight *float64 `json:"gross_weight" binding:"omitempty,min=0"`
	Volume      *float64 `json:"volume" binding:"omitempty,min=0"`
	
	// Stock control
	MinStockLevel *float64 `json:"min_stock_level" binding:"omitempty,min=0"`
	MaxStockLevel *float64 `json:"max_stock_level" binding:"omitempty,min=0"`
	ReorderPoint  *float64 `json:"reorder_point" binding:"omitempty,min=0"`
	
	// Product info
	ShelfLifeDays     *int   `json:"shelf_life_days" binding:"omitempty,min=0"`
	StorageConditions string `json:"storage_conditions" binding:"omitempty"`
	Barcode           string `json:"barcode" binding:"omitempty,max=100"`
	
	// Status
	IsActive *bool  `json:"is_active" binding:"omitempty"`
	Notes    string `json:"notes" binding:"omitempty"`
}

// FinishedProductFilterRequest represents filter parameters for listing finished products
type FinishedProductFilterRequest struct {
	Search      string `form:"search"`
	Category    string `form:"category"`
	SubCategory string `form:"sub_category"`
	IsActive    *bool  `form:"is_active"`
	Page        int    `form:"page"`
	PageSize    int    `form:"page_size"`
	SortBy      string `form:"sort_by"`
	SortOrder   string `form:"sort_order"`
}
