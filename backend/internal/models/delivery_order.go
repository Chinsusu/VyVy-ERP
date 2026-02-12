package models

import (
	"time"
)

// DeliveryOrder represents the shipment of finished products to a customer
type DeliveryOrder struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	DONumber        string    `gorm:"column:do_number;uniqueIndex;size:50;not null" json:"do_number"`
	WarehouseID     uint      `gorm:"column:warehouse_id;not null" json:"warehouse_id"`
	CustomerName    string    `gorm:"column:customer_name;size:255;not null" json:"customer_name"`
	CustomerAddress string    `gorm:"column:customer_address;type:text" json:"customer_address,omitempty"`
	
	// Dates
	DeliveryDate    time.Time `gorm:"column:delivery_date;type:date;not null;default:CURRENT_DATE" json:"delivery_date"`
	
	// Status: draft, picking, shipped, delivered, cancelled
	Status          string    `gorm:"column:status;size:50;not null;default:draft" json:"status"`
	
	// Posting
	IsPosted        bool       `gorm:"column:posted;default:false" json:"is_posted"`
	PostedBy        *uint      `gorm:"column:posted_by" json:"posted_by,omitempty"`
	PostedAt        *time.Time `gorm:"column:posted_at" json:"posted_at,omitempty"`
	
	// Shipping
	ShippingMethod  string    `gorm:"column:shipping_method;size:100" json:"shipping_method,omitempty"`
	TrackingNumber  string    `gorm:"column:tracking_number;size:100" json:"tracking_number,omitempty"`

	// Sales Channel
	SalesChannelID  *uint     `gorm:"column:sales_channel_id" json:"sales_channel_id,omitempty"`

	// Carrier
	CarrierID       *uint     `gorm:"column:carrier_id" json:"carrier_id,omitempty"`
	
	// Additional info
	Notes           string    `gorm:"column:notes;type:text" json:"notes,omitempty"`
	
	// Audit fields
	CreatedAt       time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy       *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt       time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy       *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	Warehouse       Warehouse           `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	SalesChannel    *SalesChannel       `gorm:"foreignKey:SalesChannelID" json:"sales_channel,omitempty"`
	Carrier         *Carrier            `gorm:"foreignKey:CarrierID" json:"carrier,omitempty"`
	PostedByUser    *User               `gorm:"foreignKey:PostedBy" json:"posted_by_user,omitempty"`
	CreatedByUser   *User               `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser   *User               `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
	Items           []DeliveryOrderItem `gorm:"foreignKey:DeliveryOrderID" json:"items,omitempty"`
}

// TableName specifies the table name for DeliveryOrder model
func (DeliveryOrder) TableName() string {
	return "delivery_orders"
}

// DeliveryOrderItem represents a specific row in a delivery order
type DeliveryOrderItem struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	DeliveryOrderID   uint      `gorm:"column:delivery_order_id;not null" json:"delivery_order_id"`
	FinishedProductID uint      `gorm:"column:finished_product_id;not null" json:"finished_product_id"`
	WarehouseLocationID *uint   `gorm:"column:warehouse_location_id" json:"warehouse_location_id,omitempty"`
	
	// Batch/Lot tracking
	BatchNumber      string    `gorm:"column:batch_number;size:100" json:"batch_number,omitempty"`
	LotNumber        string    `gorm:"column:lot_number;size:100" json:"lot_number,omitempty"`
	ExpiryDate       *time.Time `gorm:"column:expiry_date;type:date" json:"expiry_date,omitempty"`
	
	// Quantity
	Quantity         float64   `gorm:"column:quantity;type:decimal(15,3);not null" json:"quantity"`
	
	// Costing
	UnitCost         *float64  `gorm:"column:unit_cost;type:decimal(15,2)" json:"unit_cost,omitempty"`
	
	// Additional info
	Notes            string    `gorm:"column:notes;type:text" json:"notes,omitempty"`
	
	// Audit fields
	CreatedAt        time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy        *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt        time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy        *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	Product          FinishedProduct    `gorm:"foreignKey:FinishedProductID" json:"product,omitempty"`
	Location         *WarehouseLocation `gorm:"foreignKey:WarehouseLocationID" json:"location,omitempty"`
}

// TableName specifies the table name for DeliveryOrderItem model
func (DeliveryOrderItem) TableName() string {
	return "delivery_order_items"
}

// SafeDeliveryOrder is a DTO for API responses
type SafeDeliveryOrder struct {
	ID              uint                  `json:"id"`
	DONumber        string                `json:"do_number"`
	WarehouseID     uint                  `json:"warehouse_id"`
	WarehouseName   string                `json:"warehouse_name,omitempty"`
	CustomerName    string                `json:"customer_name"`
	CustomerAddress string                `json:"customer_address,omitempty"`
	DeliveryDate    time.Time             `json:"delivery_date"`
	Status          string                `json:"status"`
	IsPosted        bool                  `json:"is_posted"`
	PostedBy        *uint                 `json:"posted_by,omitempty"`
	PostedByName    string                `json:"posted_by_name,omitempty"`
	PostedAt        *time.Time            `json:"posted_at,omitempty"`
	ShippingMethod  string                `json:"shipping_method,omitempty"`
	TrackingNumber  string                `json:"tracking_number,omitempty"`
	SalesChannelID  *uint                 `json:"sales_channel_id,omitempty"`
	SalesChannelName string               `json:"sales_channel_name,omitempty"`
	CarrierID       *uint                 `json:"carrier_id,omitempty"`
	CarrierName     string                `json:"carrier_name,omitempty"`
	Notes           string                `json:"notes,omitempty"`
	CreatedAt       time.Time             `json:"created_at"`
	CreatedByName   string                `json:"created_by_name,omitempty"`
	UpdatedAt       time.Time             `json:"updated_at"`
	Items           []SafeDeliveryOrderItem `json:"items,omitempty"`
}

// SafeDeliveryOrderItem is a DTO for API responses
type SafeDeliveryOrderItem struct {
	ID                  uint      `json:"id"`
	FinishedProductID   uint      `json:"finished_product_id"`
	ProductName         string    `json:"product_name,omitempty"`
	ProductSKU          string    `json:"product_sku,omitempty"`
	WarehouseLocationID *uint     `json:"warehouse_location_id,omitempty"`
	LocationCode        string    `json:"location_code,omitempty"`
	BatchNumber         string    `json:"batch_number,omitempty"`
	LotNumber           string    `json:"lot_number,omitempty"`
	ExpiryDate          *time.Time `json:"expiry_date,omitempty"`
	Quantity            float64   `json:"quantity"`
	UnitCost            *float64  `json:"unit_cost,omitempty"`
	Notes               string    `json:"notes,omitempty"`
}

// ToSafe converts DeliveryOrder to SafeDeliveryOrder
func (do *DeliveryOrder) ToSafe() *SafeDeliveryOrder {
	safe := &SafeDeliveryOrder{
		ID:              do.ID,
		DONumber:        do.DONumber,
		WarehouseID:     do.WarehouseID,
		WarehouseName:   do.Warehouse.Name,
		CustomerName:    do.CustomerName,
		CustomerAddress: do.CustomerAddress,
		DeliveryDate:    do.DeliveryDate,
		Status:          do.Status,
		IsPosted:        do.IsPosted,
		PostedBy:        do.PostedBy,
		PostedAt:        do.PostedAt,
		ShippingMethod:  do.ShippingMethod,
		TrackingNumber:  do.TrackingNumber,
		SalesChannelID:  do.SalesChannelID,
		CarrierID:       do.CarrierID,
		Notes:           do.Notes,
		CreatedAt:       do.CreatedAt,
		UpdatedAt:       do.UpdatedAt,
	}

	if do.SalesChannel != nil {
		safe.SalesChannelName = do.SalesChannel.Name
	}
	if do.Carrier != nil {
		safe.CarrierName = do.Carrier.Name
	}
	if do.PostedByUser != nil {
		safe.PostedByName = do.PostedByUser.FullName
	}
	if do.CreatedByUser != nil {
		safe.CreatedByName = do.CreatedByUser.FullName
	}

	if len(do.Items) > 0 {
		safe.Items = make([]SafeDeliveryOrderItem, len(do.Items))
		for i, item := range do.Items {
			safeItem := SafeDeliveryOrderItem{
				ID:                item.ID,
				FinishedProductID: item.FinishedProductID,
				ProductName:       item.Product.Name,
				ProductSKU:        item.Product.Code,
				WarehouseLocationID: item.WarehouseLocationID,
				BatchNumber:       item.BatchNumber,
				LotNumber:         item.LotNumber,
				ExpiryDate:        item.ExpiryDate,
				Quantity:          item.Quantity,
				UnitCost:          item.UnitCost,
				Notes:             item.Notes,
			}
			if item.Location != nil {
				safeItem.LocationCode = item.Location.Code
			}
			safe.Items[i] = safeItem
		}
	}

	return safe
}
