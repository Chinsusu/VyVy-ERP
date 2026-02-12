package dto

type CreateReturnOrderRequest struct {
	DeliveryOrderID uint                       `json:"delivery_order_id" binding:"required"`
	CarrierID       *uint                      `json:"carrier_id"`
	ReturnType      string                     `json:"return_type"`
	ReturnDate      string                     `json:"return_date"`
	TrackingNumber  string                     `json:"tracking_number"`
	Reason          string                     `json:"reason"`
	Resolution      string                     `json:"resolution"`
	Notes           string                     `json:"notes"`
	Items           []CreateReturnOrderItemReq `json:"items" binding:"required,min=1"`
}

type CreateReturnOrderItemReq struct {
	DeliveryOrderItemID *uint  `json:"delivery_order_item_id"`
	FinishedProductID   uint   `json:"finished_product_id" binding:"required"`
	QuantityReturned    int    `json:"quantity_returned" binding:"required,min=1"`
	Reason              string `json:"reason"`
	Notes               string `json:"notes"`
}

type UpdateReturnOrderRequest struct {
	CarrierID      *uint    `json:"carrier_id"`
	ReturnType     *string  `json:"return_type"`
	TrackingNumber *string  `json:"tracking_number"`
	Reason         *string  `json:"reason"`
	Resolution     *string  `json:"resolution"`
	RefundAmount   *float64 `json:"refund_amount"`
	Notes          *string  `json:"notes"`
}

type ReturnOrderFilter struct {
	Status          string `form:"status"`
	ReturnType      string `form:"return_type"`
	DeliveryOrderID uint   `form:"delivery_order_id"`
	Offset          int    `form:"offset"`
	Limit           int    `form:"limit"`
}

type InspectItemRequest struct {
	Condition         string `json:"condition" binding:"required"`
	QuantityRestocked int    `json:"quantity_restocked"`
	QuantityScrapped  int    `json:"quantity_scrapped"`
	WarehouseID       *uint  `json:"warehouse_id"`
	Notes             string `json:"notes"`
}
