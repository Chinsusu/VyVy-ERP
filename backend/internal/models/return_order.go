package models

import (
	"time"

	"gorm.io/gorm"
)

type ReturnOrder struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	ReturnNumber    string         `gorm:"column:return_number;uniqueIndex;size:50;not null" json:"return_number"`
	DeliveryOrderID uint           `gorm:"column:delivery_order_id;not null" json:"delivery_order_id"`
	CarrierID       *uint          `gorm:"column:carrier_id" json:"carrier_id,omitempty"`
	ReturnType      string         `gorm:"column:return_type;size:50;default:customer_return" json:"return_type"`
	Status          string         `gorm:"column:status;size:50;default:pending" json:"status"`
	ReturnDate      time.Time      `gorm:"column:return_date;type:date;default:CURRENT_DATE" json:"return_date"`
	TrackingNumber  string         `gorm:"column:tracking_number;size:100" json:"tracking_number,omitempty"`
	Reason          string         `gorm:"column:reason;type:text" json:"reason,omitempty"`
	Resolution      string         `gorm:"column:resolution;size:50" json:"resolution,omitempty"`
	TotalItems      int            `gorm:"column:total_items;default:0" json:"total_items"`
	TotalRestocked  int            `gorm:"column:total_restocked;default:0" json:"total_restocked"`
	TotalScrapped   int            `gorm:"column:total_scrapped;default:0" json:"total_scrapped"`
	RefundAmount    float64        `gorm:"column:refund_amount;type:decimal(15,2);default:0" json:"refund_amount"`
	Notes           string         `gorm:"column:notes;type:text" json:"notes,omitempty"`
	CreatedAt       time.Time      `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy       *uint          `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt       time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy       *uint          `gorm:"column:updated_by" json:"updated_by,omitempty"`
	DeletedAt       gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deleted_at,omitempty"`

	// Relationships
	DeliveryOrder DeliveryOrder     `gorm:"foreignKey:DeliveryOrderID" json:"delivery_order,omitempty"`
	Carrier       *Carrier          `gorm:"foreignKey:CarrierID" json:"carrier,omitempty"`
	CreatedByUser *User             `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser *User             `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
	Items         []ReturnOrderItem `gorm:"foreignKey:ReturnOrderID" json:"items,omitempty"`
}

type ReturnOrderItem struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	ReturnOrderID       uint      `gorm:"column:return_order_id;not null" json:"return_order_id"`
	DeliveryOrderItemID *uint     `gorm:"column:delivery_order_item_id" json:"delivery_order_item_id,omitempty"`
	FinishedProductID   uint      `gorm:"column:finished_product_id;not null" json:"finished_product_id"`
	QuantityReturned    int       `gorm:"column:quantity_returned;not null;default:1" json:"quantity_returned"`
	QuantityRestocked   int       `gorm:"column:quantity_restocked;default:0" json:"quantity_restocked"`
	QuantityScrapped    int       `gorm:"column:quantity_scrapped;default:0" json:"quantity_scrapped"`
	Condition           string    `gorm:"column:condition;size:50;default:pending_inspection" json:"condition"`
	WarehouseID         *uint     `gorm:"column:warehouse_id" json:"warehouse_id,omitempty"`
	Reason              string    `gorm:"column:reason;type:text" json:"reason,omitempty"`
	Notes               string    `gorm:"column:notes;type:text" json:"notes,omitempty"`
	CreatedAt           time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt           time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

	// Relationships
	FinishedProduct FinishedProduct `gorm:"foreignKey:FinishedProductID" json:"finished_product,omitempty"`
	Warehouse       *Warehouse      `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
}

// Safe DTOs
type ReturnOrderSafeDTO struct {
	ID              uint                    `json:"id"`
	ReturnNumber    string                  `json:"return_number"`
	DeliveryOrderID uint                    `json:"delivery_order_id"`
	DONumber        string                  `json:"do_number,omitempty"`
	CustomerName    string                  `json:"customer_name,omitempty"`
	CarrierID       *uint                   `json:"carrier_id,omitempty"`
	CarrierName     string                  `json:"carrier_name,omitempty"`
	ReturnType      string                  `json:"return_type"`
	Status          string                  `json:"status"`
	ReturnDate      time.Time               `json:"return_date"`
	TrackingNumber  string                  `json:"tracking_number,omitempty"`
	Reason          string                  `json:"reason,omitempty"`
	Resolution      string                  `json:"resolution,omitempty"`
	TotalItems      int                     `json:"total_items"`
	TotalRestocked  int                     `json:"total_restocked"`
	TotalScrapped   int                     `json:"total_scrapped"`
	RefundAmount    float64                 `json:"refund_amount"`
	Notes           string                  `json:"notes,omitempty"`
	CreatedAt       time.Time               `json:"created_at"`
	UpdatedAt       time.Time               `json:"updated_at"`
	Items           []ReturnOrderItemSafeDTO `json:"items,omitempty"`
}

type ReturnOrderItemSafeDTO struct {
	ID                  uint    `json:"id"`
	ReturnOrderID       uint    `json:"return_order_id"`
	DeliveryOrderItemID *uint   `json:"delivery_order_item_id,omitempty"`
	FinishedProductID   uint    `json:"finished_product_id"`
	ProductName         string  `json:"product_name,omitempty"`
	ProductSKU          string  `json:"product_sku,omitempty"`
	QuantityReturned    int     `json:"quantity_returned"`
	QuantityRestocked   int     `json:"quantity_restocked"`
	QuantityScrapped    int     `json:"quantity_scrapped"`
	Condition           string  `json:"condition"`
	WarehouseID         *uint   `json:"warehouse_id,omitempty"`
	WarehouseName       string  `json:"warehouse_name,omitempty"`
	Reason              string  `json:"reason,omitempty"`
	Notes               string  `json:"notes,omitempty"`
}

func (r *ReturnOrder) ToSafe() ReturnOrderSafeDTO {
	dto := ReturnOrderSafeDTO{
		ID:              r.ID,
		ReturnNumber:    r.ReturnNumber,
		DeliveryOrderID: r.DeliveryOrderID,
		CarrierID:       r.CarrierID,
		ReturnType:      r.ReturnType,
		Status:          r.Status,
		ReturnDate:      r.ReturnDate,
		TrackingNumber:  r.TrackingNumber,
		Reason:          r.Reason,
		Resolution:      r.Resolution,
		TotalItems:      r.TotalItems,
		TotalRestocked:  r.TotalRestocked,
		TotalScrapped:   r.TotalScrapped,
		RefundAmount:    r.RefundAmount,
		Notes:           r.Notes,
		CreatedAt:       r.CreatedAt,
		UpdatedAt:       r.UpdatedAt,
	}

	if r.DeliveryOrder.ID > 0 {
		dto.DONumber = r.DeliveryOrder.DONumber
		dto.CustomerName = r.DeliveryOrder.CustomerName
	}
	if r.Carrier != nil {
		dto.CarrierName = r.Carrier.Name
	}

	for _, item := range r.Items {
		itemDTO := ReturnOrderItemSafeDTO{
			ID:                  item.ID,
			ReturnOrderID:       item.ReturnOrderID,
			DeliveryOrderItemID: item.DeliveryOrderItemID,
			FinishedProductID:   item.FinishedProductID,
			QuantityReturned:    item.QuantityReturned,
			QuantityRestocked:   item.QuantityRestocked,
			QuantityScrapped:    item.QuantityScrapped,
			Condition:           item.Condition,
			WarehouseID:         item.WarehouseID,
			Reason:              item.Reason,
			Notes:               item.Notes,
		}
		if item.FinishedProduct.ID > 0 {
			itemDTO.ProductName = item.FinishedProduct.Name
			itemDTO.ProductSKU = item.FinishedProduct.Code
		}
		if item.Warehouse != nil {
			itemDTO.WarehouseName = item.Warehouse.Name
		}
		dto.Items = append(dto.Items, itemDTO)
	}

	return dto
}
