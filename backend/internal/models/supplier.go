package models

import (
	"time"
)

// Supplier represents a supplier entity
type Supplier struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	Code          string     `json:"code" gorm:"uniqueIndex;not null"`
	Name          string     `json:"name" gorm:"not null"`
	NameEn        *string    `json:"name_en"`
	TaxCode       *string    `json:"tax_code"`
	ContactPerson *string    `json:"contact_person"`
	Phone         *string    `json:"phone"`
	Email         *string    `json:"email"`
	Address       *string    `json:"address"`
	City          *string    `json:"city"`
	Country       string     `json:"country" gorm:"default:'Vietnam'"`
	PaymentTerms  *string    `json:"payment_terms"`
	CreditLimit   *float64   `json:"credit_limit" gorm:"type:decimal(15,2)"`
	IsActive      *bool      `json:"is_active" gorm:"default:true"`
	Notes         *string    `json:"notes"`
	CreatedAt     time.Time  `json:"created_at"`
	CreatedBy     *uint      `json:"created_by"`
	UpdatedAt     time.Time  `json:"updated_at"`
	UpdatedBy     *uint      `json:"updated_by"`
}

// TableName specifies the table name for Supplier
func (Supplier) TableName() string {
	return "suppliers"
}

// SafeSupplier represents supplier data safe for API responses
type SafeSupplier struct {
	ID            uint      `json:"id"`
	Code          string    `json:"code"`
	Name          string    `json:"name"`
	NameEn        *string   `json:"name_en"`
	TaxCode       *string   `json:"tax_code"`
	ContactPerson *string   `json:"contact_person"`
	Phone         *string   `json:"phone"`
	Email         *string   `json:"email"`
	Address       *string   `json:"address"`
	City          *string   `json:"city"`
	Country       string    `json:"country"`
	PaymentTerms  *string   `json:"payment_terms"`
	CreditLimit   *float64  `json:"credit_limit"`
	IsActive      *bool     `json:"is_active"`
	Notes         *string   `json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ToSafe converts Supplier to SafeSupplier
func (s *Supplier) ToSafe() *SafeSupplier {
	return &SafeSupplier{
		ID:            s.ID,
		Code:          s.Code,
		Name:          s.Name,
		NameEn:        s.NameEn,
		TaxCode:       s.TaxCode,
		ContactPerson: s.ContactPerson,
		Phone:         s.Phone,
		Email:         s.Email,
		Address:       s.Address,
		City:          s.City,
		Country:       s.Country,
		PaymentTerms:  s.PaymentTerms,
		CreditLimit:   s.CreditLimit,
		IsActive:      s.IsActive,
		Notes:         s.Notes,
		CreatedAt:     s.CreatedAt,
		UpdatedAt:     s.UpdatedAt,
	}
}
