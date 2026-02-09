package models

import (
	"time"
)

// Warehouse represents a warehouse entity
type Warehouse struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	Code          string     `json:"code" gorm:"uniqueIndex;not null"`
	Name          string     `json:"name" gorm:"not null"`
	WarehouseType string     `json:"warehouse_type" gorm:"default:'main'"`
	Address       *string    `json:"address"`
	City          *string    `json:"city"`
	ManagerID     *uint      `json:"manager_id"`
	IsActive      bool       `json:"is_active" gorm:"default:true"`
	Notes         *string    `json:"notes"`
	CreatedAt     time.Time  `json:"created_at"`
	CreatedBy     *uint      `json:"created_by"`
	UpdatedAt     time.Time  `json:"updated_at"`
	UpdatedBy     *uint      `json:"updated_by"`

	// Relationships (not included in JSON by default due to omitempty)
	Manager   *User               `json:"manager,omitempty" gorm:"foreignKey:ManagerID"`
	Locations []WarehouseLocation `json:"locations,omitempty" gorm:"foreignKey:WarehouseID"`
}

// TableName specifies the table name for Warehouse
func (Warehouse) TableName() string {
	return "warehouses"
}

// SafeWarehouse represents warehouse data safe for API responses
type SafeWarehouse struct {
	ID             uint      `json:"id"`
	Code           string    `json:"code"`
	Name           string    `json:"name"`
	WarehouseType  string    `json:"warehouse_type"`
	Address        *string   `json:"address"`
	City           *string   `json:"city"`
	ManagerID      *uint     `json:"manager_id"`
	IsActive       bool      `json:"is_active"`
	Notes          *string   `json:"notes"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	LocationsCount int       `json:"locations_count,omitempty"` // For list view
}

// ToSafe converts Warehouse to SafeWarehouse
func (w *Warehouse) ToSafe() *SafeWarehouse {
	safe := &SafeWarehouse{
		ID:            w.ID,
		Code:          w.Code,
		Name:          w.Name,
		WarehouseType: w.WarehouseType,
		Address:       w.Address,
		City:          w.City,
		ManagerID:     w.ManagerID,
		IsActive:      w.IsActive,
		Notes:         w.Notes,
		CreatedAt:     w.CreatedAt,
		UpdatedAt:     w.UpdatedAt,
	}

	// Count locations if loaded
	if w.Locations != nil {
		safe.LocationsCount = len(w.Locations)
	}

	return safe
}
