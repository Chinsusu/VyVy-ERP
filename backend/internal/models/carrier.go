package models

import (
	"time"
)

// Carrier represents a shipping carrier (JNT, SAE, Viettel Post, etc.)
type Carrier struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	Code               string    `gorm:"column:code;uniqueIndex;size:50;not null" json:"code"`
	Name               string    `gorm:"column:name;size:255;not null" json:"name"`
	CarrierType        string    `gorm:"column:carrier_type;size:50;not null;default:express" json:"carrier_type"` // express, freight, internal
	ContactPhone       string    `gorm:"column:contact_phone;size:50" json:"contact_phone,omitempty"`
	ContactEmail       string    `gorm:"column:contact_email;size:100" json:"contact_email,omitempty"`
	Website            string    `gorm:"column:website;size:255" json:"website,omitempty"`
	TrackingURLTemplate string   `gorm:"column:tracking_url_template;size:500" json:"tracking_url_template,omitempty"`
	ShippingFeeConfig  string    `gorm:"column:shipping_fee_config;type:jsonb;default:'{}'" json:"shipping_fee_config,omitempty"`
	IsActive           bool      `gorm:"column:is_active;not null;default:true" json:"is_active"`
	Description        string    `gorm:"column:description;type:text" json:"description,omitempty"`

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
func (Carrier) TableName() string {
	return "carriers"
}

// SafeCarrier is a DTO for API responses
type SafeCarrier struct {
	ID                 uint      `json:"id"`
	Code               string    `json:"code"`
	Name               string    `json:"name"`
	CarrierType        string    `json:"carrier_type"`
	ContactPhone       string    `json:"contact_phone,omitempty"`
	ContactEmail       string    `json:"contact_email,omitempty"`
	Website            string    `json:"website,omitempty"`
	TrackingURLTemplate string   `json:"tracking_url_template,omitempty"`
	ShippingFeeConfig  string    `json:"shipping_fee_config,omitempty"`
	IsActive           bool      `json:"is_active"`
	Description        string    `json:"description,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	CreatedByName      string    `json:"created_by_name,omitempty"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// ToSafe converts Carrier to SafeCarrier
func (c *Carrier) ToSafe() *SafeCarrier {
	safe := &SafeCarrier{
		ID:                 c.ID,
		Code:               c.Code,
		Name:               c.Name,
		CarrierType:        c.CarrierType,
		ContactPhone:       c.ContactPhone,
		ContactEmail:       c.ContactEmail,
		Website:            c.Website,
		TrackingURLTemplate: c.TrackingURLTemplate,
		ShippingFeeConfig:  c.ShippingFeeConfig,
		IsActive:           c.IsActive,
		Description:        c.Description,
		CreatedAt:          c.CreatedAt,
		UpdatedAt:          c.UpdatedAt,
	}

	if c.CreatedByUser != nil {
		safe.CreatedByName = c.CreatedByUser.FullName
	}

	return safe
}
