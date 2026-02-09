package dto

// CreateSupplierRequest represents the request body for creating a supplier
type CreateSupplierRequest struct {
	Code          string   `json:"code" binding:"required,min=1,max=50"`
	Name          string   `json:"name" binding:"required,min=1,max=255"`
	NameEn        *string  `json:"name_en" binding:"omitempty,max=255"`
	TaxCode       *string  `json:"tax_code" binding:"omitempty,max=50"`
	ContactPerson *string  `json:"contact_person" binding:"omitempty,max=255"`
	Phone         *string  `json:"phone" binding:"omitempty,max=50"`
	Email         *string  `json:"email" binding:"omitempty,email,max=255"`
	Address       *string  `json:"address"`
	City          *string  `json:"city" binding:"omitempty,max=100"`
	Country       string   `json:"country" binding:"max=100"`
	PaymentTerms  *string  `json:"payment_terms" binding:"omitempty,max=100"`
	CreditLimit   *float64 `json:"credit_limit" binding:"omitempty,min=0"`
	IsActive      bool     `json:"is_active"`
	Notes         *string  `json:"notes"`
}

// UpdateSupplierRequest represents the request body for updating a supplier
type UpdateSupplierRequest struct {
	Code          string   `json:"code" binding:"omitempty,min=1,max=50"`
	Name          string   `json:"name" binding:"omitempty,min=1,max=255"`
	NameEn        *string  `json:"name_en" binding:"omitempty,max=255"`
	TaxCode       *string  `json:"tax_code" binding:"omitempty,max=50"`
	ContactPerson *string  `json:"contact_person" binding:"omitempty,max=255"`
	Phone         *string  `json:"phone" binding:"omitempty,max=50"`
	Email         *string  `json:"email" binding:"omitempty,email,max=255"`
	Address       *string  `json:"address"`
	City          *string  `json:"city" binding:"omitempty,max=100"`
	Country       string   `json:"country" binding:"omitempty,max=100"`
	PaymentTerms  *string  `json:"payment_terms" binding:"omitempty,max=100"`
	CreditLimit   *float64 `json:"credit_limit" binding:"omitempty,min=0"`
	IsActive      *bool    `json:"is_active"`
	Notes         *string  `json:"notes"`
}

// SupplierFilterRequest represents query parameters for filtering suppliers
type SupplierFilterRequest struct {
	Search   string `form:"search"`
	Country  string `form:"country"`
	City     string `form:"city"`
	IsActive *bool  `form:"is_active"`
	Page     int    `form:"page" binding:"omitempty,min=1"`
	PageSize int    `form:"page_size" binding:"omitempty,min=1,max=100"`
	SortBy   string `form:"sort_by" binding:"omitempty,oneof=id code name city country created_at updated_at"`
	SortOrder string `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}
