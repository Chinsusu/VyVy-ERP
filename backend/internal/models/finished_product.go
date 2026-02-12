package models

import (
	"time"
)

// FinishedProduct represents a finished product in the system
type FinishedProduct struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Code        string `gorm:"column:code;uniqueIndex;size:50;not null" json:"code"`
	Name        string `gorm:"column:name;size:255;not null" json:"name"`
	NameEn      string `gorm:"column:name_en;size:255" json:"name_en,omitempty"`
	Category    string `gorm:"column:category;size:100" json:"category,omitempty"`
	SubCategory string `gorm:"column:sub_category;size:100" json:"sub_category,omitempty"`
	ProductType string `gorm:"column:product_type;size:50;index" json:"product_type,omitempty"`
	SalesStatus string `gorm:"column:sales_status;size:50;default:'ĐANG_BÁN'" json:"sales_status,omitempty"`
	Unit        string `gorm:"column:unit;size:20;not null;default:PCS" json:"unit"`

	// Pricing
	StandardCost *float64 `gorm:"column:standard_cost;type:decimal(15,2)" json:"standard_cost,omitempty"`
	SellingPrice *float64 `gorm:"column:selling_price;type:decimal(15,2)" json:"selling_price,omitempty"`

	// Specifications
	NetWeight   *float64 `gorm:"column:net_weight;type:decimal(10,3)" json:"net_weight,omitempty"`
	GrossWeight *float64 `gorm:"column:gross_weight;type:decimal(10,3)" json:"gross_weight,omitempty"`
	Volume      *float64 `gorm:"column:volume;type:decimal(10,3)" json:"volume,omitempty"`

	// Stock control
	MinStockLevel *float64 `gorm:"column:min_stock_level;type:decimal(15,3);default:0" json:"min_stock_level,omitempty"`
	MaxStockLevel *float64 `gorm:"column:max_stock_level;type:decimal(15,3)" json:"max_stock_level,omitempty"`
	ReorderPoint  *float64 `gorm:"column:reorder_point;type:decimal(15,3)" json:"reorder_point,omitempty"`

	// Product info
	ShelfLifeDays      *int   `gorm:"column:shelf_life_days" json:"shelf_life_days,omitempty"`
	StorageConditions  string `gorm:"column:storage_conditions;type:text" json:"storage_conditions,omitempty"`
	Barcode            string `gorm:"column:barcode;size:100" json:"barcode,omitempty"`

	// Status
	IsActive bool   `gorm:"column:is_active;default:true" json:"is_active"`
	Notes    string `gorm:"column:notes;type:text" json:"notes,omitempty"`

	// Audit fields
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	CreatedBy *uint     `gorm:"column:created_by" json:"created_by,omitempty"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	UpdatedBy *uint     `gorm:"column:updated_by" json:"updated_by,omitempty"`

	// Relationships
	CreatedByUser *User `gorm:"foreignKey:CreatedBy" json:"created_by_user,omitempty"`
	UpdatedByUser *User `gorm:"foreignKey:UpdatedBy" json:"updated_by_user,omitempty"`
}

// TableName specifies the table name for FinishedProduct model
func (FinishedProduct) TableName() string {
	return "finished_products"
}

// SafeFinishedProduct is a DTO that excludes sensitive information
type SafeFinishedProduct struct {
	ID          uint     `json:"id"`
	Code        string   `json:"code"`
	Name        string   `json:"name"`
	NameEn      string   `json:"name_en,omitempty"`
	Category    string   `json:"category,omitempty"`
	SubCategory string   `json:"sub_category,omitempty"`
	ProductType string   `json:"product_type,omitempty"`
	SalesStatus string   `json:"sales_status,omitempty"`
	Unit        string   `json:"unit"`
	StandardCost *float64 `json:"standard_cost,omitempty"`
	SellingPrice *float64 `json:"selling_price,omitempty"`
	NetWeight   *float64 `json:"net_weight,omitempty"`
	GrossWeight *float64 `json:"gross_weight,omitempty"`
	Volume      *float64 `json:"volume,omitempty"`
	MinStockLevel *float64 `json:"min_stock_level,omitempty"`
	MaxStockLevel *float64 `json:"max_stock_level,omitempty"`
	ReorderPoint  *float64 `json:"reorder_point,omitempty"`
	ShelfLifeDays *int     `json:"shelf_life_days,omitempty"`
	StorageConditions string `json:"storage_conditions,omitempty"`
	Barcode      string   `json:"barcode,omitempty"`
	IsActive     bool     `json:"is_active"`
	Notes        string   `json:"notes,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ToSafe converts FinishedProduct to SafeFinishedProduct
func (fp *FinishedProduct) ToSafe() *SafeFinishedProduct {
	return &SafeFinishedProduct{
		ID:          fp.ID,
		Code:        fp.Code,
		Name:        fp.Name,
		NameEn:      fp.NameEn,
		Category:    fp.Category,
		SubCategory: fp.SubCategory,
		ProductType: fp.ProductType,
		SalesStatus: fp.SalesStatus,
		Unit:        fp.Unit,
		StandardCost: fp.StandardCost,
		SellingPrice: fp.SellingPrice,
		NetWeight:   fp.NetWeight,
		GrossWeight: fp.GrossWeight,
		Volume:      fp.Volume,
		MinStockLevel: fp.MinStockLevel,
		MaxStockLevel: fp.MaxStockLevel,
		ReorderPoint:  fp.ReorderPoint,
		ShelfLifeDays: fp.ShelfLifeDays,
		StorageConditions: fp.StorageConditions,
		Barcode:     fp.Barcode,
		IsActive:    fp.IsActive,
		Notes:       fp.Notes,
		CreatedAt:   fp.CreatedAt,
		UpdatedAt:   fp.UpdatedAt,
	}
}
