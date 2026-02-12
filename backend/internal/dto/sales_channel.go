package dto

// CreateSalesChannelRequest is the DTO for creating a new sales channel
type CreateSalesChannelRequest struct {
	Code         string `json:"code" binding:"required"`
	Name         string `json:"name" binding:"required"`
	PlatformType string `json:"platform_type" binding:"required"` // marketplace, social, branch, other
	Description  string `json:"description"`
}

// UpdateSalesChannelRequest is the DTO for updating a sales channel
type UpdateSalesChannelRequest struct {
	Name         string `json:"name"`
	PlatformType string `json:"platform_type"`
	IsActive     *bool  `json:"is_active"`
	Description  string `json:"description"`
}

// SalesChannelFilterRequest is the DTO for filtering sales channels
type SalesChannelFilterRequest struct {
	PlatformType string `form:"platform_type"`
	IsActive     *bool  `form:"is_active"`
	Search       string `form:"search"`
	Offset       int    `form:"offset,default=0"`
	Limit        int    `form:"limit,default=20"`
}
