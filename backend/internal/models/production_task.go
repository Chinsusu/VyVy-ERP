package models

import "time"

// ProductionTask represents a task within a material request (production plan)
type ProductionTask struct {
	ID                int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	MaterialRequestID uint       `gorm:"column:material_request_id;not null;index" json:"material_request_id"`
	Category          string     `gorm:"column:category;type:varchar(50);not null;default:'other'" json:"category"`
	TaskName          string     `gorm:"column:task_name;type:varchar(255);not null" json:"task_name"`
	Description       string     `gorm:"column:description;type:text" json:"description,omitempty"`
	AssignedTo        *int64     `gorm:"column:assigned_to" json:"assigned_to,omitempty"`
	PlannedStart      *string    `gorm:"column:planned_start;type:date" json:"planned_start,omitempty"`
	PlannedEnd        *string    `gorm:"column:planned_end;type:date" json:"planned_end,omitempty"`
	ActualStart       *string    `gorm:"column:actual_start;type:date" json:"actual_start,omitempty"`
	ActualEnd         *string    `gorm:"column:actual_end;type:date" json:"actual_end,omitempty"`
	Status            string     `gorm:"column:status;type:varchar(20);not null;default:'pending'" json:"status"`
	ProgressPercent   int        `gorm:"column:progress_percent;not null;default:0" json:"progress_percent"`
	SortOrder         int        `gorm:"column:sort_order;not null;default:0" json:"sort_order"`
	Notes             string     `gorm:"column:notes;type:text" json:"notes,omitempty"`
	CreatedAt         time.Time  `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy         *int64     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt         time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy         *int64     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	AssignedUser *User `gorm:"foreignKey:AssignedTo" json:"assigned_user,omitempty"`
}

// TableName specifies the table name
func (ProductionTask) TableName() string {
	return "production_tasks"
}

// SafeProductionTask is a DTO for API responses
type SafeProductionTask struct {
	ID                int64     `json:"id"`
	MaterialRequestID uint      `json:"material_request_id"`
	Category          string    `json:"category"`
	TaskName          string    `json:"task_name"`
	Description       string    `json:"description,omitempty"`
	AssignedTo        *int64    `json:"assigned_to,omitempty"`
	AssignedUserName  string    `json:"assigned_user_name,omitempty"`
	PlannedStart      *string   `json:"planned_start,omitempty"`
	PlannedEnd        *string   `json:"planned_end,omitempty"`
	ActualStart       *string   `json:"actual_start,omitempty"`
	ActualEnd         *string   `json:"actual_end,omitempty"`
	Status            string    `json:"status"`
	ProgressPercent   int       `json:"progress_percent"`
	SortOrder         int       `json:"sort_order"`
	Notes             string    `json:"notes,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// ToSafe converts ProductionTask to SafeProductionTask
func (t *ProductionTask) ToSafe() *SafeProductionTask {
	safe := &SafeProductionTask{
		ID:                t.ID,
		MaterialRequestID: t.MaterialRequestID,
		Category:          t.Category,
		TaskName:          t.TaskName,
		Description:       t.Description,
		AssignedTo:        t.AssignedTo,
		PlannedStart:      t.PlannedStart,
		PlannedEnd:        t.PlannedEnd,
		ActualStart:       t.ActualStart,
		ActualEnd:         t.ActualEnd,
		Status:            t.Status,
		ProgressPercent:   t.ProgressPercent,
		SortOrder:         t.SortOrder,
		Notes:             t.Notes,
		CreatedAt:         t.CreatedAt,
		UpdatedAt:         t.UpdatedAt,
	}

	if t.AssignedUser != nil {
		safe.AssignedUserName = t.AssignedUser.FullName
		if safe.AssignedUserName == "" {
			safe.AssignedUserName = t.AssignedUser.Username
		}
	}

	return safe
}
