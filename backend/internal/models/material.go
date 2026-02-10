package models

import (
	"time"

	"gorm.io/gorm"
)

// Material represents a raw material in the warehouse
type Material struct {
	ID           int64   `gorm:"primaryKey;autoIncrement" json:"id"`
	Code         string  `gorm:"type:varchar(50);uniqueIndex;not null" json:"code"`
	TradingName  string  `gorm:"type:varchar(255);not null" json:"trading_name"`
	InciName     *string `gorm:"type:varchar(255)" json:"inci_name,omitempty"`
	MaterialType string  `gorm:"type:varchar(50);not null;index" json:"material_type"`
	Category     *string `gorm:"type:varchar(100);index" json:"category,omitempty"`
	SubCategory  *string `gorm:"type:varchar(100)" json:"sub_category,omitempty"`
	Unit         string  `gorm:"type:varchar(20);not null;default:'KG'" json:"unit"`
	SupplierID   *int64  `gorm:"index" json:"supplier_id,omitempty"`

	// Pricing
	StandardCost      *float64 `gorm:"type:decimal(15,2)" json:"standard_cost,omitempty"`
	LastPurchasePrice *float64 `gorm:"type:decimal(15,2)" json:"last_purchase_price,omitempty"`

	// Stock control
	MinStockLevel   *float64 `gorm:"type:decimal(15,3);default:0" json:"min_stock_level,omitempty"`
	MaxStockLevel   *float64 `gorm:"type:decimal(15,3)" json:"max_stock_level,omitempty"`
	ReorderPoint    *float64 `gorm:"type:decimal(15,3)" json:"reorder_point,omitempty"`
	ReorderQuantity *float64 `gorm:"type:decimal(15,3)" json:"reorder_quantity,omitempty"`

	// Quality & Safety
	RequiresQC         bool    `gorm:"default:false" json:"requires_qc"`
	ShelfLifeDays      *int    `json:"shelf_life_days,omitempty"`
	StorageConditions  *string `gorm:"type:text" json:"storage_conditions,omitempty"`
	Hazardous          bool    `gorm:"default:false" json:"hazardous"`

	// Status
	IsActive bool    `gorm:"default:true;index" json:"is_active"`
	Notes    *string `gorm:"type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time      `json:"created_at"`
	CreatedBy *int64         `json:"created_by,omitempty"`
	UpdatedAt time.Time      `json:"updated_at"`
	UpdatedBy *int64         `json:"updated_by,omitempty"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relations (optional, for eager loading)
	// Supplier *Supplier `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
}

// TableName specifies the table name
func (Material) TableName() string {
	return "materials"
}

// BeforeCreate hook
func (m *Material) BeforeCreate(tx *gorm.DB) error {
	now := time.Now()
	m.CreatedAt = now
	m.UpdatedAt = now
	return nil
}

// BeforeUpdate hook
func (m *Material) BeforeUpdate(tx *gorm.DB) error {
	m.UpdatedAt = time.Now()
	return nil
}

// SafeMaterial returns a safe version without internal fields
type SafeMaterial struct {
	ID                 int64    `json:"id"`
	Code               string   `json:"code"`
	TradingName        string   `json:"trading_name"`
	InciName           *string  `json:"inci_name,omitempty"`
	MaterialType       string   `json:"material_type"`
	Category           *string  `json:"category,omitempty"`
	SubCategory        *string  `json:"sub_category,omitempty"`
	Unit               string   `json:"unit"`
	SupplierID         *int64   `json:"supplier_id,omitempty"`
	StandardCost       *float64 `json:"standard_cost,omitempty"`
	LastPurchasePrice  *float64 `json:"last_purchase_price,omitempty"`
	MinStockLevel      *float64 `json:"min_stock_level,omitempty"`
	MaxStockLevel      *float64 `json:"max_stock_level,omitempty"`
	ReorderPoint       *float64 `json:"reorder_point,omitempty"`
	ReorderQuantity    *float64 `json:"reorder_quantity,omitempty"`
	RequiresQC         bool     `json:"requires_qc"`
	ShelfLifeDays      *int     `json:"shelf_life_days,omitempty"`
	StorageConditions  *string  `json:"storage_conditions,omitempty"`
	Hazardous          bool     `json:"hazardous"`
	IsActive           bool     `json:"is_active"`
	Notes              *string  `json:"notes,omitempty"`
	CreatedAt          string   `json:"created_at"`
	UpdatedAt          string   `json:"updated_at"`
}

// ToSafe converts Material to SafeMaterial
func (m *Material) ToSafe() *SafeMaterial {
	return &SafeMaterial{
		ID:                m.ID,
		Code:              m.Code,
		TradingName:       m.TradingName,
		InciName:          m.InciName,
		MaterialType:      m.MaterialType,
		Category:          m.Category,
		SubCategory:       m.SubCategory,
		Unit:              m.Unit,
		SupplierID:        m.SupplierID,
		StandardCost:      m.StandardCost,
		LastPurchasePrice: m.LastPurchasePrice,
		MinStockLevel:     m.MinStockLevel,
		MaxStockLevel:     m.MaxStockLevel,
		ReorderPoint:      m.ReorderPoint,
		ReorderQuantity:   m.ReorderQuantity,
		RequiresQC:        m.RequiresQC,
		ShelfLifeDays:     m.ShelfLifeDays,
		StorageConditions: m.StorageConditions,
		Hazardous:         m.Hazardous,
		IsActive:          m.IsActive,
		Notes:             m.Notes,
		CreatedAt:         m.CreatedAt.Format(time.RFC3339),
		UpdatedAt:         m.UpdatedAt.Format(time.RFC3339),
	}
}
