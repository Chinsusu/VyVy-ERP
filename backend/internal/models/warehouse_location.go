package models

import (
	"time"
)

// WarehouseLocation represents a warehouse location entity
type WarehouseLocation struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	WarehouseID  uint       `json:"warehouse_id" gorm:"not null"`
	Code         string     `json:"code" gorm:"uniqueIndex;not null"`
	Name         string     `json:"name" gorm:"not null"`
	Aisle        *string    `json:"aisle"`
	Rack         *string    `json:"rack"`
	Shelf        *string    `json:"shelf"`
	Bin          *string    `json:"bin"`
	LocationType string     `json:"location_type" gorm:"default:'storage'"`
	IsActive     bool       `json:"is_active" gorm:"default:true"`
	Notes        *string    `json:"notes"`
	CreatedAt    time.Time  `json:"created_at"`
	CreatedBy    *uint      `json:"created_by"`
	UpdatedAt    time.Time  `json:"updated_at"`
	UpdatedBy    *uint      `json:"updated_by"`

	// Relationship
	Warehouse *Warehouse `json:"warehouse,omitempty" gorm:"foreignKey:WarehouseID"`
}

// TableName specifies the table name for WarehouseLocation
func (WarehouseLocation) TableName() string {
	return "warehouse_locations"
}

// SafeWarehouseLocation represents warehouse location data safe for API responses
type SafeWarehouseLocation struct {
	ID           uint      `json:"id"`
	WarehouseID  uint      `json:"warehouse_id"`
	Code         string    `json:"code"`
	Name         string    `json:"name"`
	Aisle        *string   `json:"aisle"`
	Rack         *string   `json:"rack"`
	Shelf        *string   `json:"shelf"`
	Bin          *string   `json:"bin"`
	LocationType string    `json:"location_type"`
	IsActive     bool      `json:"is_active"`
	Notes        *string   `json:"notes"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ToSafe converts WarehouseLocation to SafeWarehouseLocation
func (wl *WarehouseLocation) ToSafe() *SafeWarehouseLocation {
	return &SafeWarehouseLocation{
		ID:           wl.ID,
		WarehouseID:  wl.WarehouseID,
		Code:         wl.Code,
		Name:         wl.Name,
		Aisle:        wl.Aisle,
		Rack:         wl.Rack,
		Shelf:        wl.Shelf,
		Bin:          wl.Bin,
		LocationType: wl.LocationType,
		IsActive:     wl.IsActive,
		Notes:        wl.Notes,
		CreatedAt:    wl.CreatedAt,
		UpdatedAt:    wl.UpdatedAt,
	}
}

// GetFullLocation returns formatted location string (Aisle-Rack-Shelf-Bin)
func (wl *WarehouseLocation) GetFullLocation() string {
	parts := []string{}
	if wl.Aisle != nil && *wl.Aisle != "" {
		parts = append(parts, *wl.Aisle)
	}
	if wl.Rack != nil && *wl.Rack != "" {
		parts = append(parts, *wl.Rack)
	}
	if wl.Shelf != nil && *wl.Shelf != "" {
		parts = append(parts, *wl.Shelf)
	}
	if wl.Bin != nil && *wl.Bin != "" {
		parts = append(parts, *wl.Bin)
	}
	
	if len(parts) == 0 {
		return wl.Code
	}
	
	result := ""
	for i, part := range parts {
		if i > 0 {
			result += "-"
		}
		result += part
	}
	return result
}
