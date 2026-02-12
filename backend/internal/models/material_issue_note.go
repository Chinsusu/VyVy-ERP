package models

import (
	"time"
)

// MaterialIssueNote represents the physical issuance of materials
type MaterialIssueNote struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	MINNumber         string    `gorm:"column:min_number;uniqueIndex;size:50;not null" json:"min_number"`
	MaterialRequestID *uint     `gorm:"column:material_request_id" json:"material_request_id,omitempty"`
	WarehouseID       uint      `gorm:"column:warehouse_id;not null" json:"warehouse_id"`

	// Dates
	IssueDate string `gorm:"column:issue_date;type:date;not null" json:"issue_date"`

	// Status: draft, posted, cancelled
	Status string `gorm:"column:status;size:50;not null;default:draft" json:"status"`

	// Posting
	IsPosted bool       `gorm:"column:posted;default:false" json:"is_posted"`
	PostedBy *uint      `gorm:"column:posted_by" json:"posted_by,omitempty"`
	PostedAt *time.Time `gorm:"column:posted_at" json:"posted_at,omitempty"`

	// Additional info
	Notes string `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	MaterialRequest *MaterialRequest       `gorm:"foreignKey:MaterialRequestID" json:"material_request,omitempty"`
	Warehouse       *Warehouse             `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	PostedByUser    *User                  `gorm:"foreignKey:PostedBy" json:"posted_by_user,omitempty"`
	CreatedByUser   *User                  `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser   *User                  `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
	Items           []*MaterialIssueNoteItem `gorm:"foreignKey:MINID" json:"items,omitempty"`
}

// TableName specifies the table name for MaterialIssueNote model
func (MaterialIssueNote) TableName() string {
	return "material_issue_notes"
}

// MaterialIssueNoteItem represents an item issued in a MIN
type MaterialIssueNoteItem struct {
	ID                  uint    `gorm:"primaryKey" json:"id"`
	MINID               uint    `gorm:"column:min_id;not null" json:"min_id"`
	MRItemID            uint    `gorm:"column:mr_item_id;not null" json:"mr_item_id"`
	MaterialID          uint    `gorm:"column:material_id;not null" json:"material_id"`
	WarehouseLocationID *uint   `gorm:"column:warehouse_location_id" json:"warehouse_location_id,omitempty"`

	// Batch/Lot tracking
	BatchNumber string `gorm:"column:batch_number;size:100" json:"batch_number,omitempty"`
	LotNumber   string `gorm:"column:lot_number;size:100" json:"lot_number,omitempty"`
	ExpiryDate  *string `gorm:"column:expiry_date;type:date" json:"expiry_date,omitempty"`

	// Quantity
	Quantity float64 `gorm:"column:quantity;type:decimal(15,3);not null" json:"quantity"`

	// Costing
	UnitCost *float64 `gorm:"column:unit_cost;type:decimal(15,2)" json:"unit_cost,omitempty"`

	// Additional info
	Notes string `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	Material          *Material          `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
	WarehouseLocation *WarehouseLocation `gorm:"foreignKey:WarehouseLocationID" json:"warehouse_location,omitempty"`
}

// TableName specifies the table name for MaterialIssueNoteItem model
func (MaterialIssueNoteItem) TableName() string {
	return "material_issue_note_items"
}

// SafeMaterialIssueNote is a DTO for MIN
type SafeMaterialIssueNote struct {
	ID                uint                          `json:"id"`
	MINNumber         string                        `json:"min_number"`
	MaterialRequestID *uint                         `json:"material_request_id,omitempty"`
	MaterialRequest   *SafeMaterialRequest          `json:"material_request,omitempty"`
	WarehouseID       uint                          `json:"warehouse_id"`
	Warehouse         *SafeWarehouse                `json:"warehouse,omitempty"`
	IssueDate         string                        `json:"issue_date"`
	Status            string                        `json:"status"`
	IsPosted          bool                          `json:"is_posted"`
	PostedBy          *uint                         `json:"posted_by,omitempty"`
	PostedAt          *time.Time                    `json:"posted_at,omitempty"`
	Notes             string                        `json:"notes,omitempty"`
	Items             []*SafeMaterialIssueNoteItem `json:"items,omitempty"`
	CreatedAt         time.Time                     `json:"created_at"`
	UpdatedAt         time.Time                     `json:"updated_at"`
}

// SafeMaterialIssueNoteItem is a DTO for MIN item
type SafeMaterialIssueNoteItem struct {
	ID                  uint                 `json:"id"`
	MINID               uint                 `json:"min_id"`
	MRItemID            uint                 `json:"mr_item_id"`
	MaterialID          uint                 `json:"material_id"`
	Material            *SafeMaterial        `json:"material,omitempty"`
	WarehouseLocationID *uint                `json:"warehouse_location_id,omitempty"`
	WarehouseLocation   *SafeWarehouseLocation `json:"warehouse_location,omitempty"`
	BatchNumber         string               `json:"batch_number,omitempty"`
	LotNumber           string               `json:"lot_number,omitempty"`
	ExpiryDate          *string              `json:"expiry_date,omitempty"`
	Quantity            float64              `json:"quantity"`
	UnitCost            *float64             `json:"unit_cost,omitempty"`
	Notes               string               `json:"notes,omitempty"`
}

// ToSafe converts MaterialIssueNote to SafeMaterialIssueNote
func (min *MaterialIssueNote) ToSafe() *SafeMaterialIssueNote {
	safe := &SafeMaterialIssueNote{
		ID:                min.ID,
		MINNumber:         min.MINNumber,
		MaterialRequestID: min.MaterialRequestID,
		WarehouseID:       min.WarehouseID,
		IssueDate:         min.IssueDate,
		Status:            min.Status,
		IsPosted:          min.IsPosted,
		PostedBy:          min.PostedBy,
		PostedAt:          min.PostedAt,
		Notes:             min.Notes,
		CreatedAt:         min.CreatedAt,
		UpdatedAt:         min.UpdatedAt,
	}

	if min.MaterialRequest != nil {
		safe.MaterialRequest = min.MaterialRequest.ToSafe()
	}

	if min.Warehouse != nil {
		safe.Warehouse = min.Warehouse.ToSafe()
	}

	if min.Items != nil {
		safe.Items = make([]*SafeMaterialIssueNoteItem, len(min.Items))
		for i, item := range min.Items {
			safe.Items[i] = item.ToSafe()
		}
	}

	return safe
}

// ToSafe converts MaterialIssueNoteItem to SafeMaterialIssueNoteItem
func (mini *MaterialIssueNoteItem) ToSafe() *SafeMaterialIssueNoteItem {
	safe := &SafeMaterialIssueNoteItem{
		ID:                  mini.ID,
		MINID:               mini.MINID,
		MRItemID:            mini.MRItemID,
		MaterialID:          mini.MaterialID,
		WarehouseLocationID: mini.WarehouseLocationID,
		BatchNumber:         mini.BatchNumber,
		LotNumber:           mini.LotNumber,
		ExpiryDate:          mini.ExpiryDate,
		Quantity:            mini.Quantity,
		UnitCost:            mini.UnitCost,
		Notes:               mini.Notes,
	}

	if mini.Material != nil {
		safe.Material = mini.Material.ToSafe()
	}

	if mini.WarehouseLocation != nil {
		safe.WarehouseLocation = mini.WarehouseLocation.ToSafe()
	}

	return safe
}
