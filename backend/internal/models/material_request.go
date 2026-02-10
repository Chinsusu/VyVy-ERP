package models

import (
	"time"
)

// MaterialRequest represents a request for materials from a warehouse
type MaterialRequest struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	MRNumber     string    `gorm:"column:mr_number;uniqueIndex;size:50;not null" json:"mr_number"`
	WarehouseID  uint      `gorm:"column:warehouse_id;not null" json:"warehouse_id"`
	Department   string    `gorm:"column:department;size:100" json:"department"`

	// Dates
	RequestDate  string     `gorm:"column:request_date;type:date;not null" json:"request_date"`
	RequiredDate *string    `gorm:"column:required_date;type:date" json:"required_date,omitempty"`

	// Status: draft, approved, issued, closed, cancelled
	Status string `gorm:"column:status;size:50;not null;default:draft" json:"status"`

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
	Warehouse      *Warehouse            `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	ApprovedByUser *User                 `gorm:"foreignKey:ApprovedBy" json:"approved_by_user,omitempty"`
	CreatedByUser  *User                 `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser  *User                 `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
	Items          []*MaterialRequestItem `gorm:"foreignKey:MaterialRequestID" json:"items,omitempty"`
}

// TableName specifies the table name for MaterialRequest model
func (MaterialRequest) TableName() string {
	return "material_requests"
}

// MaterialRequestItem represents an item requested in an MR
type MaterialRequestItem struct {
	ID                uint    `gorm:"primaryKey" json:"id"`
	MaterialRequestID uint    `gorm:"column:material_request_id;not null" json:"material_request_id"`
	MaterialID        uint    `gorm:"column:material_id;not null" json:"material_id"`
	RequestedQuantity float64 `gorm:"column:requested_quantity;type:decimal(15,3);not null" json:"requested_quantity"`
	IssuedQuantity    float64 `gorm:"column:issued_quantity;type:decimal(15,3);default:0" json:"issued_quantity"`
	Notes             string  `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	Material *Material `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
}

// TableName specifies the table name for MaterialRequestItem model
func (MaterialRequestItem) TableName() string {
	return "material_request_items"
}

// SafeMaterialRequest is a DTO that includes safe information
type SafeMaterialRequest struct {
	ID           uint                      `json:"id"`
	MRNumber     string                    `json:"mr_number"`
	WarehouseID  uint                      `json:"warehouse_id"`
	Warehouse    *SafeWarehouse            `json:"warehouse,omitempty"`
	Department   string                    `json:"department"`
	RequestDate  string                    `json:"request_date"`
	RequiredDate *string                   `json:"required_date,omitempty"`
	Status       string                    `json:"status"`
	ApprovedBy   *uint                     `json:"approved_by,omitempty"`
	ApprovedAt   *time.Time                `json:"approved_at,omitempty"`
	Purpose      string                    `json:"purpose,omitempty"`
	Notes        string                    `json:"notes,omitempty"`
	Items        []*SafeMaterialRequestItem `json:"items,omitempty"`
	CreatedAt    time.Time                 `json:"created_at"`
	UpdatedAt    time.Time                 `json:"updated_at"`
}

// SafeMaterialRequestItem represents a safe material request item
type SafeMaterialRequestItem struct {
	ID                uint          `json:"id"`
	MaterialRequestID uint          `json:"material_request_id"`
	MaterialID        uint          `json:"material_id"`
	Material          *SafeMaterial `json:"material,omitempty"`
	RequestedQuantity float64       `json:"requested_quantity"`
	IssuedQuantity    float64       `json:"issued_quantity"`
	Notes             string        `json:"notes,omitempty"`
}

// ToSafe converts MaterialRequest to SafeMaterialRequest
func (mr *MaterialRequest) ToSafe() *SafeMaterialRequest {
	safe := &SafeMaterialRequest{
		ID:           mr.ID,
		MRNumber:     mr.MRNumber,
		WarehouseID:  mr.WarehouseID,
		Department:   mr.Department,
		RequestDate:  mr.RequestDate,
		RequiredDate: mr.RequiredDate,
		Status:       mr.Status,
		ApprovedBy:   mr.ApprovedBy,
		ApprovedAt:   mr.ApprovedAt,
		Purpose:      mr.Purpose,
		Notes:        mr.Notes,
		CreatedAt:    mr.CreatedAt,
		UpdatedAt:    mr.UpdatedAt,
	}

	if mr.Warehouse != nil {
		safe.Warehouse = mr.Warehouse.ToSafe()
	}

	if mr.Items != nil {
		safe.Items = make([]*SafeMaterialRequestItem, len(mr.Items))
		for i, item := range mr.Items {
			safe.Items[i] = item.ToSafe()
		}
	}

	return safe
}

// ToSafe converts MaterialRequestItem to SafeMaterialRequestItem
func (mri *MaterialRequestItem) ToSafe() *SafeMaterialRequestItem {
	safe := &SafeMaterialRequestItem{
		ID:                mri.ID,
		MaterialRequestID: mri.MaterialRequestID,
		MaterialID:        mri.MaterialID,
		RequestedQuantity: mri.RequestedQuantity,
		IssuedQuantity:    mri.IssuedQuantity,
		Notes:             mri.Notes,
	}

	if mri.Material != nil {
		safe.Material = mri.Material.ToSafe()
	}

	return safe
}
