package dto

import "time"

type DashboardStats struct {
	TotalPurchaseOrders    int64   `json:"total_purchase_orders"`
	PendingGRNs            int64   `json:"pending_grns"`
	TotalMaterialRequests int64   `json:"total_material_requests"`
	TotalDeliveryOrders    int64   `json:"total_delivery_orders"`
	InventoryValue         float64 `json:"inventory_value"`
	LowStockCount          int64   `json:"low_stock_count"`
	ExpiringSoonCount     int64   `json:"expiring_soon_count"` // Items expiring within 30 days
	LastUpdatedAt         time.Time `json:"last_updated_at"`
}

type StockMovementReportRow struct {
	ItemCode         string  `json:"item_code"`
	ItemName         string  `json:"item_name"`
	WarehouseName    string  `json:"warehouse_name"`
	OpeningBalance   float64 `json:"opening_balance"`
	ReceivedQty      float64 `json:"received_qty"`
	IssuedQty        float64 `json:"issued_qty"`
	AdjustedQty      float64 `json:"adjusted_qty"`
	TransferredQty   float64 `json:"transferred_qty"`
	ClosingBalance   float64 `json:"closing_balance"`
	Unit             string  `json:"unit"`
}

type InventoryValueReportRow struct {
	ItemCode      string  `json:"item_code"`
	ItemName      string  `json:"item_name"`
	Category      string  `json:"category"`
	WarehouseName string  `json:"warehouse_name"`
	Quantity      float64 `json:"quantity"`
	UnitCost      float64 `json:"unit_cost"`
	TotalValue    float64 `json:"total_value"`
	Unit          string  `json:"unit"`
}
