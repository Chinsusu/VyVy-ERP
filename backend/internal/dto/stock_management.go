package dto

// StockAdjustmentItemRequest represents a single item in an adjustment request
type StockAdjustmentItemRequest struct {
	ItemType           string  `json:"item_type" binding:"required,oneof=material finished_product"`
	ItemID             uint    `json:"item_id" binding:"required"`
	WarehouseLocationID *uint   `json:"warehouse_location_id"`
	BatchNumber       string  `json:"batch_number"`
	LotNumber         string  `json:"lot_number"`
	AdjustmentQuantity float64 `json:"adjustment_quantity" binding:"required"`
	Notes             string  `json:"notes"`
}

// CreateStockAdjustmentRequest represents the request to create a new adjustment
type CreateStockAdjustmentRequest struct {
	WarehouseID    uint                         `json:"warehouse_id" binding:"required"`
	AdjustmentDate string                       `json:"adjustment_date" binding:"required"` // YYYY-MM-DD
	AdjustmentType string                       `json:"adjustment_type" binding:"required"`
	Reason         string                       `json:"reason" binding:"required"`
	Notes          string                       `json:"notes"`
	Items          []StockAdjustmentItemRequest `json:"items" binding:"required,min=1"`
}

// StockAdjustmentFilterRequest represents filters for listing adjustments
type StockAdjustmentFilterRequest struct {
	WarehouseID    uint   `json:"warehouse_id"`
	Status         string `json:"status"`
	AdjustmentNumber string `json:"adjustment_number"`
	AdjustmentType string `json:"adjustment_type"`
	Offset         int    `json:"offset"`
	Limit          int    `json:"limit"`
}

// StockTransferItemRequest represents a single item in a transfer request
type StockTransferItemRequest struct {
	ItemType       string  `json:"item_type" binding:"required,oneof=material finished_product"`
	ItemID         uint    `json:"item_id" binding:"required"`
	FromLocationID *uint   `json:"from_location_id"`
	ToLocationID   *uint   `json:"to_location_id"`
	BatchNumber    string  `json:"batch_number"`
	LotNumber      string  `json:"lot_number"`
	Quantity       float64 `json:"quantity" binding:"required,gt=0"`
	Notes          string  `json:"notes"`
}

// CreateStockTransferRequest represents the request to create a new transfer
type CreateStockTransferRequest struct {
	FromWarehouseID uint                       `json:"from_warehouse_id" binding:"required"`
	ToWarehouseID   uint                       `json:"to_warehouse_id" binding:"required"`
	TransferDate    string                     `json:"transfer_date" binding:"required"` // YYYY-MM-DD
	Notes           string                     `json:"notes"`
	Items           []StockTransferItemRequest `json:"items" binding:"required,min=1"`
}

// StockTransferFilterRequest represents filters for listing transfers
type StockTransferFilterRequest struct {
	FromWarehouseID uint   `json:"from_warehouse_id"`
	ToWarehouseID   uint   `json:"to_warehouse_id"`
	Status          string `json:"status"`
	TransferNumber  string `json:"transfer_number"`
	Offset          int    `json:"offset"`
	Limit           int    `json:"limit"`
}
