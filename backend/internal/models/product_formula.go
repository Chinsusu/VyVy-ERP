package models

import (
	"time"
)

// ProductFormula represents a bill of materials (BOM) for a finished product
type ProductFormula struct {
	ID                uint   `gorm:"primaryKey" json:"id"`
	FinishedProductID uint   `gorm:"column:finished_product_id;not null;index" json:"finished_product_id"`
	Name              string `gorm:"column:name;size:255;not null" json:"name"`
	Description       string `gorm:"column:description;type:text" json:"description,omitempty"`
	BatchSize         float64 `gorm:"column:batch_size;type:decimal(15,3);not null;default:1" json:"batch_size"`
	BatchUnit         string  `gorm:"column:batch_unit;size:20;not null;default:PCS" json:"batch_unit"`
	IsActive          bool   `gorm:"column:is_active;default:true" json:"is_active"`
	Notes             string `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

	// Relationships
	FinishedProduct *FinishedProduct     `gorm:"foreignKey:FinishedProductID" json:"finished_product,omitempty"`
	Items           []ProductFormulaItem `gorm:"foreignKey:FormulaID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
	CreatedByUser   *User                `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
}

// TableName specifies the table name
func (ProductFormula) TableName() string {
	return "product_formulas"
}

// ProductFormulaItem represents a single material line in a product formula
type ProductFormulaItem struct {
	ID         uint    `gorm:"primaryKey" json:"id"`
	FormulaID  uint    `gorm:"column:formula_id;not null;index" json:"formula_id"`
	MaterialID uint    `gorm:"column:material_id;not null;index" json:"material_id"`
	Quantity   float64 `gorm:"column:quantity;type:decimal(15,3);not null;default:0" json:"quantity"`
	Unit       string  `gorm:"column:unit;size:20;not null" json:"unit"`
	Notes      string  `gorm:"column:notes;type:text" json:"notes,omitempty"`

	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

	// Relationships
	Material *Material `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
}

// TableName specifies the table name
func (ProductFormulaItem) TableName() string {
	return "product_formula_items"
}
