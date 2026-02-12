package models

import (
	"time"
)

// SalesChannel represents a sales channel (Shopee, Tiktok, Facebook, Lazada, Chi nhánh)
type SalesChannel struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Code         string    `gorm:"column:code;uniqueIndex;size:50;not null" json:"code"`
	Name         string    `gorm:"column:name;size:255;not null" json:"name"`
	PlatformType string    `gorm:"column:platform_type;size:50;not null;default:other" json:"platform_type"` // marketplace, social, branch, other
	IsActive     bool      `gorm:"column:is_active;not null;default:true" json:"is_active"`
	Description  string    `gorm:"column:description;type:text" json:"description,omitempty"`
	Config       string    `gorm:"column:config;type:jsonb;default:'{}'" json:"config,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	CreatedByUser *User `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser *User `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
}

// TableName specifies the table name
func (SalesChannel) TableName() string {
	return "sales_channels"
}

// SafeSalesChannel is a DTO for API responses
type SafeSalesChannel struct {
	ID           uint      `json:"id"`
	Code         string    `json:"code"`
	Name         string    `json:"name"`
	PlatformType string    `json:"platform_type"`
	IsActive     bool      `json:"is_active"`
	Description  string    `json:"description,omitempty"`
	Config       string    `json:"config,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	CreatedByName string   `json:"created_by_name,omitempty"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ToSafe converts SalesChannel to SafeSalesChannel
func (sc *SalesChannel) ToSafe() *SafeSalesChannel {
	safe := &SafeSalesChannel{
		ID:           sc.ID,
		Code:         sc.Code,
		Name:         sc.Name,
		PlatformType: sc.PlatformType,
		IsActive:     sc.IsActive,
		Description:  sc.Description,
		Config:       sc.Config,
		CreatedAt:    sc.CreatedAt,
		UpdatedAt:    sc.UpdatedAt,
	}

	if sc.CreatedByUser != nil {
		safe.CreatedByName = sc.CreatedByUser.FullName
	}

	return safe
}
