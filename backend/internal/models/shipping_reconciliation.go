package models

import (
	"time"
)

// ShippingReconciliation represents a reconciliation batch for a carrier
type ShippingReconciliation struct {
	ID                   uint      `gorm:"primaryKey" json:"id"`
	ReconciliationNumber string    `gorm:"column:reconciliation_number;uniqueIndex;size:50;not null" json:"reconciliation_number"`
	CarrierID            uint      `gorm:"column:carrier_id;not null" json:"carrier_id"`
	PeriodStart          *time.Time `gorm:"column:period_start;type:date" json:"period_start,omitempty"`
	PeriodEnd            *time.Time `gorm:"column:period_end;type:date" json:"period_end,omitempty"`
	Status               string    `gorm:"column:status;size:50;not null;default:draft" json:"status"` // draft, processing, completed, confirmed
	TotalOrders          int       `gorm:"column:total_orders;default:0" json:"total_orders"`
	TotalMatched         int       `gorm:"column:total_matched;default:0" json:"total_matched"`
	TotalDiscrepancy     int       `gorm:"column:total_discrepancy;default:0" json:"total_discrepancy"`
	TotalCODExpected     float64   `gorm:"column:total_cod_expected;type:decimal(15,2);default:0" json:"total_cod_expected"`
	TotalCODActual       float64   `gorm:"column:total_cod_actual;type:decimal(15,2);default:0" json:"total_cod_actual"`
	TotalShippingFee     float64   `gorm:"column:total_shipping_fee;type:decimal(15,2);default:0" json:"total_shipping_fee"`
	Notes                string    `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	Carrier       Carrier                      `gorm:"foreignKey:CarrierID" json:"carrier,omitempty"`
	Items         []ShippingReconciliationItem  `gorm:"foreignKey:ReconciliationID" json:"items,omitempty"`
	CreatedByUser *User                        `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
}

// TableName specifies the table name
func (ShippingReconciliation) TableName() string {
	return "shipping_reconciliations"
}

// ShippingReconciliationItem represents a single DO matched in a reconciliation
type ShippingReconciliationItem struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	ReconciliationID  uint      `gorm:"column:reconciliation_id;not null" json:"reconciliation_id"`
	DeliveryOrderID   *uint     `gorm:"column:delivery_order_id" json:"delivery_order_id,omitempty"`
	TrackingNumber    string    `gorm:"column:tracking_number;size:100" json:"tracking_number"`
	CarrierStatus     string    `gorm:"column:carrier_status;size:100" json:"carrier_status,omitempty"` // delivered, returned, lost, in_transit
	CODAmount         float64   `gorm:"column:cod_amount;type:decimal(15,2);default:0" json:"cod_amount"`
	ShippingFee       float64   `gorm:"column:shipping_fee;type:decimal(15,2);default:0" json:"shipping_fee"`
	ActualReceived    float64   `gorm:"column:actual_received;type:decimal(15,2);default:0" json:"actual_received"`
	MatchStatus       string    `gorm:"column:match_status;size:50;not null;default:pending" json:"match_status"` // pending, matched, discrepancy, unmatched
	DiscrepancyAmount float64   `gorm:"column:discrepancy_amount;type:decimal(15,2);default:0" json:"discrepancy_amount"`
	DiscrepancyNote   string    `gorm:"column:discrepancy_note;type:text" json:"discrepancy_note,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

	// Relationships
	DeliveryOrder *DeliveryOrder `gorm:"foreignKey:DeliveryOrderID" json:"delivery_order,omitempty"`
}

// TableName specifies the table name
func (ShippingReconciliationItem) TableName() string {
	return "shipping_reconciliation_items"
}

// SafeShippingReconciliation is a DTO for API responses
type SafeShippingReconciliation struct {
	ID                   uint                            `json:"id"`
	ReconciliationNumber string                          `json:"reconciliation_number"`
	CarrierID            uint                            `json:"carrier_id"`
	CarrierName          string                          `json:"carrier_name,omitempty"`
	CarrierCode          string                          `json:"carrier_code,omitempty"`
	PeriodStart          *time.Time                      `json:"period_start,omitempty"`
	PeriodEnd            *time.Time                      `json:"period_end,omitempty"`
	Status               string                          `json:"status"`
	TotalOrders          int                             `json:"total_orders"`
	TotalMatched         int                             `json:"total_matched"`
	TotalDiscrepancy     int                             `json:"total_discrepancy"`
	TotalCODExpected     float64                         `json:"total_cod_expected"`
	TotalCODActual       float64                         `json:"total_cod_actual"`
	TotalShippingFee     float64                         `json:"total_shipping_fee"`
	Notes                string                          `json:"notes,omitempty"`
	CreatedAt            time.Time                       `json:"created_at"`
	CreatedByName        string                          `json:"created_by_name,omitempty"`
	UpdatedAt            time.Time                       `json:"updated_at"`
	Items                []SafeShippingReconciliationItem `json:"items,omitempty"`
}

// SafeShippingReconciliationItem is a DTO for API responses
type SafeShippingReconciliationItem struct {
	ID                uint      `json:"id"`
	ReconciliationID  uint      `json:"reconciliation_id"`
	DeliveryOrderID   *uint     `json:"delivery_order_id,omitempty"`
	DONumber          string    `json:"do_number,omitempty"`
	CustomerName      string    `json:"customer_name,omitempty"`
	TrackingNumber    string    `json:"tracking_number"`
	CarrierStatus     string    `json:"carrier_status,omitempty"`
	CODAmount         float64   `json:"cod_amount"`
	ShippingFee       float64   `json:"shipping_fee"`
	ActualReceived    float64   `json:"actual_received"`
	MatchStatus       string    `json:"match_status"`
	DiscrepancyAmount float64   `json:"discrepancy_amount"`
	DiscrepancyNote   string    `json:"discrepancy_note,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
}

// ToSafe converts ShippingReconciliation to SafeShippingReconciliation
func (sr *ShippingReconciliation) ToSafe() *SafeShippingReconciliation {
	safe := &SafeShippingReconciliation{
		ID:                   sr.ID,
		ReconciliationNumber: sr.ReconciliationNumber,
		CarrierID:            sr.CarrierID,
		CarrierName:          sr.Carrier.Name,
		CarrierCode:          sr.Carrier.Code,
		PeriodStart:          sr.PeriodStart,
		PeriodEnd:            sr.PeriodEnd,
		Status:               sr.Status,
		TotalOrders:          sr.TotalOrders,
		TotalMatched:         sr.TotalMatched,
		TotalDiscrepancy:     sr.TotalDiscrepancy,
		TotalCODExpected:     sr.TotalCODExpected,
		TotalCODActual:       sr.TotalCODActual,
		TotalShippingFee:     sr.TotalShippingFee,
		Notes:                sr.Notes,
		CreatedAt:            sr.CreatedAt,
		UpdatedAt:            sr.UpdatedAt,
	}

	if sr.CreatedByUser != nil {
		safe.CreatedByName = sr.CreatedByUser.FullName
	}

	if len(sr.Items) > 0 {
		safe.Items = make([]SafeShippingReconciliationItem, len(sr.Items))
		for i, item := range sr.Items {
			safeItem := SafeShippingReconciliationItem{
				ID:                item.ID,
				ReconciliationID:  item.ReconciliationID,
				DeliveryOrderID:   item.DeliveryOrderID,
				TrackingNumber:    item.TrackingNumber,
				CarrierStatus:     item.CarrierStatus,
				CODAmount:         item.CODAmount,
				ShippingFee:       item.ShippingFee,
				ActualReceived:    item.ActualReceived,
				MatchStatus:       item.MatchStatus,
				DiscrepancyAmount: item.DiscrepancyAmount,
				DiscrepancyNote:   item.DiscrepancyNote,
				CreatedAt:         item.CreatedAt,
			}
			if item.DeliveryOrder != nil {
				safeItem.DONumber = item.DeliveryOrder.DONumber
				safeItem.CustomerName = item.DeliveryOrder.CustomerName
			}
			safe.Items[i] = safeItem
		}
	}

	return safe
}
