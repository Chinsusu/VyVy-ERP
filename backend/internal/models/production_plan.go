package models

import (
	"time"
)

// ProductionPlan represents a production plan in the system
type ProductionPlan struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	PlanNumber  string `gorm:"column:plan_number;uniqueIndex;size:50;not null" json:"plan_number"`
	WarehouseID uint   `gorm:"column:warehouse_id;not null" json:"warehouse_id"`
	Department  string `gorm:"column:department;size:100" json:"department"`

	// Dates
	RequestDate  string  `gorm:"column:request_date;type:date;not null" json:"request_date"`
	RequiredDate *string `gorm:"column:required_date;type:date" json:"required_date,omitempty"`

	// Status: draft, approved, cancelled
	Status string `gorm:"column:status;size:50;not null;default:draft" json:"status"`

	// ProcurementStatus tracks the procurement lifecycle for this plan:
	// draft -> ordering -> receiving -> received -> in_production -> completed | cancelled
	ProcurementStatus string `gorm:"column:procurement_status;size:50;not null;default:draft" json:"procurement_status"`

	// Approval
	ApprovedBy *uint      `gorm:"column:approved_by" json:"approved_by,omitempty"`
	ApprovedAt *time.Time `gorm:"column:approved_at" json:"approved_at,omitempty"`

	// Purpose & Notes
	Purpose string `gorm:"column:purpose;type:text" json:"purpose,omitempty"`
	Notes   string `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	Warehouse      *Warehouse           `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	ApprovedByUser *User                `gorm:"foreignKey:ApprovedBy" json:"approved_by_user,omitempty"`
	CreatedByUser  *User                `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser  *User                `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
	Items          []*ProductionPlanItem `gorm:"foreignKey:ProductionPlanID" json:"items,omitempty"`
}

// TableName specifies the table name for ProductionPlan model
func (ProductionPlan) TableName() string {
	return "production_plans"
}

// ProductionPlanItem represents an item in a production plan
type ProductionPlanItem struct {
	ID               uint    `gorm:"primaryKey" json:"id"`
	ProductionPlanID uint    `gorm:"column:production_plan_id;not null" json:"production_plan_id"`
	MaterialID       uint    `gorm:"column:material_id;not null" json:"material_id"`
	RequestedQuantity float64 `gorm:"column:requested_quantity;type:decimal(15,3);not null" json:"requested_quantity"`
	IssuedQuantity   float64 `gorm:"column:issued_quantity;type:decimal(15,3);default:0" json:"issued_quantity"`
	Notes            string  `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	Material *Material `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
}

// TableName specifies the table name for ProductionPlanItem model
func (ProductionPlanItem) TableName() string {
	return "production_plan_items"
}

// SafeProductionPlan is a DTO that includes safe information
type SafeProductionPlan struct {
	ID           uint                       `json:"id"`
	PlanNumber   string                     `json:"plan_number"`
	WarehouseID  uint                       `json:"warehouse_id"`
	Warehouse    *SafeWarehouse             `json:"warehouse,omitempty"`
	Department   string                     `json:"department"`
	RequestDate  string                     `json:"request_date"`
	RequiredDate *string                    `json:"required_date,omitempty"`
	Status             string                     `json:"status"`
	ProcurementStatus  string                     `json:"procurement_status"`
	ApprovedBy   *uint                      `json:"approved_by,omitempty"`
	ApprovedAt   *time.Time                 `json:"approved_at,omitempty"`
	ApprovedByUser *SafeUser                `json:"approved_by_user,omitempty"`
	CreatedByUser  *SafeUser                `json:"created_by_user,omitempty"`
	UpdatedByUser  *SafeUser                `json:"updated_by_user,omitempty"`
	Purpose      string                     `json:"purpose,omitempty"`
	Notes        string                     `json:"notes,omitempty"`
	Items        []*SafeProductionPlanItem  `json:"items,omitempty"`
	CreatedAt    time.Time                  `json:"created_at"`
	UpdatedAt    time.Time                  `json:"updated_at"`
}

// SafeProductionPlanItem represents a safe production plan item
type SafeProductionPlanItem struct {
	ID               uint          `json:"id"`
	ProductionPlanID uint          `json:"production_plan_id"`
	MaterialID       uint          `json:"material_id"`
	Material         *SafeMaterial `json:"material,omitempty"`
	RequestedQuantity float64      `json:"requested_quantity"`
	IssuedQuantity   float64       `json:"issued_quantity"`
	Notes            string        `json:"notes,omitempty"`
}

// ToSafe converts ProductionPlan to SafeProductionPlan
func (pp *ProductionPlan) ToSafe() *SafeProductionPlan {
	safe := &SafeProductionPlan{
		ID:           pp.ID,
		PlanNumber:   pp.PlanNumber,
		WarehouseID:  pp.WarehouseID,
		Department:   pp.Department,
		RequestDate:  pp.RequestDate,
		RequiredDate: pp.RequiredDate,
		Status:             pp.Status,
		ProcurementStatus:  pp.ProcurementStatus,
		ApprovedBy:   pp.ApprovedBy,
		ApprovedAt:   pp.ApprovedAt,
		Purpose:      pp.Purpose,
		Notes:        pp.Notes,
		CreatedAt:    pp.CreatedAt,
		UpdatedAt:    pp.UpdatedAt,
	}

	if pp.Warehouse != nil {
		safe.Warehouse = pp.Warehouse.ToSafe()
	}
	if pp.CreatedByUser != nil {
		u := pp.CreatedByUser.ToSafeUser()
		safe.CreatedByUser = &u
	}
	if pp.UpdatedByUser != nil {
		u := pp.UpdatedByUser.ToSafeUser()
		safe.UpdatedByUser = &u
	}
	if pp.ApprovedByUser != nil {
		u := pp.ApprovedByUser.ToSafeUser()
		safe.ApprovedByUser = &u
	}
	if pp.Items != nil {
		safe.Items = make([]*SafeProductionPlanItem, len(pp.Items))
		for i, item := range pp.Items {
			safe.Items[i] = item.ToSafe()
		}
	}

	return safe
}

// ToSafe converts ProductionPlanItem to SafeProductionPlanItem
func (ppi *ProductionPlanItem) ToSafe() *SafeProductionPlanItem {
	safe := &SafeProductionPlanItem{
		ID:               ppi.ID,
		ProductionPlanID: ppi.ProductionPlanID,
		MaterialID:       ppi.MaterialID,
		RequestedQuantity: ppi.RequestedQuantity,
		IssuedQuantity:   ppi.IssuedQuantity,
		Notes:            ppi.Notes,
	}
	if ppi.Material != nil {
		safe.Material = ppi.Material.ToSafe()
	}
	return safe
}
