package models

import "time"

// MaterialSupplier represents a supplier for a material with priority ranking
type MaterialSupplier struct {
	ID           int64    `gorm:"primaryKey;autoIncrement" json:"id"`
	MaterialID   int64    `gorm:"column:material_id;not null;index" json:"material_id"`
	SupplierID   int64    `gorm:"column:supplier_id;not null;index" json:"supplier_id"`
	Priority     int      `gorm:"column:priority;not null;default:1" json:"priority"` // 1 = highest
	UnitPrice    *float64 `gorm:"column:unit_price;type:decimal(15,2)" json:"unit_price,omitempty"`
	LeadTimeDays *int     `gorm:"column:lead_time_days" json:"lead_time_days,omitempty"`
	Notes        *string  `gorm:"column:notes;type:text" json:"notes,omitempty"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`

	// Relations
	Supplier *Supplier `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
}

func (MaterialSupplier) TableName() string {
	return "material_suppliers"
}

// SafeMaterialSupplier is the public-facing DTO
type SafeMaterialSupplier struct {
	ID           int64         `json:"id"`
	MaterialID   int64         `json:"material_id"`
	SupplierID   int64         `json:"supplier_id"`
	Supplier     *SafeSupplier `json:"supplier,omitempty"`
	Priority     int           `json:"priority"`
	UnitPrice    *float64      `json:"unit_price,omitempty"`
	LeadTimeDays *int          `json:"lead_time_days,omitempty"`
	Notes        *string       `json:"notes,omitempty"`
	CreatedAt    string        `json:"created_at"`
}

func (ms *MaterialSupplier) ToSafe() SafeMaterialSupplier {
	s := SafeMaterialSupplier{
		ID:           ms.ID,
		MaterialID:   ms.MaterialID,
		SupplierID:   ms.SupplierID,
		Priority:     ms.Priority,
		UnitPrice:    ms.UnitPrice,
		LeadTimeDays: ms.LeadTimeDays,
		Notes:        ms.Notes,
		CreatedAt:    ms.CreatedAt.Format(time.RFC3339),
	}
	if ms.Supplier != nil {
		s.Supplier = ms.Supplier.ToSafe()
	}
	return s
}
