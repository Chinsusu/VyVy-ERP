package dto

type CreateDeliveryOrderRequest struct {
	WarehouseID     uint                     `json:"warehouse_id" binding:"required"`
	CustomerName    string                   `json:"customer_name" binding:"required"`
	CustomerAddress string                   `json:"customer_address"`
	DeliveryDate    string                   `json:"delivery_date" binding:"required"` // YYYY-MM-DD
	ShippingMethod  string                   `json:"shipping_method"`
	SalesChannelID  *uint                    `json:"sales_channel_id"`
	Notes           string                   `json:"notes"`
	Items           []CreateDeliveryOrderItem `json:"items" binding:"required,gt=0"`
}

type CreateDeliveryOrderItem struct {
	FinishedProductID uint    `json:"finished_product_id" binding:"required"`
	Quantity          float64 `json:"quantity" binding:"required,gt=0"`
	WarehouseLocationID *uint  `json:"warehouse_location_id"`
	BatchNumber       string  `json:"batch_number"`
	LotNumber         string  `json:"lot_number"`
	Notes             string  `json:"notes"`
}

type DeliveryOrderFilterRequest struct {
	WarehouseID  uint   `form:"warehouse_id"`
	Status       string `form:"status"`
	DONumber       string `form:"do_number"`
	CustomerName   string `form:"customer_name"`
	SalesChannelID uint   `form:"sales_channel_id"`
	Offset         int    `form:"offset,default=0"`
	Limit        int    `form:"limit,default=20"`
}

type UpdateDeliveryOrderRequest struct {
	CustomerName    string                   `json:"customer_name"`
	CustomerAddress string                   `json:"customer_address"`
	DeliveryDate    string                   `json:"delivery_date"`
	ShippingMethod  string                   `json:"shipping_method"`
	TrackingNumber  string                   `json:"tracking_number"`
	SalesChannelID  *uint                    `json:"sales_channel_id"`
	Notes           string                   `json:"notes"`
	Items           []CreateDeliveryOrderItem `json:"items"`
}

type ShipDeliveryOrderRequest struct {
	TrackingNumber string `json:"tracking_number"`
	Notes          string `json:"notes"`
}
