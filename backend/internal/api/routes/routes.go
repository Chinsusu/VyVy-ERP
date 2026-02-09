package routes

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/config"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// API v1 group
	_ = router.Group("/api/v1") // Will use this when adding route groups

	// Public routes (no auth required)
	// auth := api.Group("/auth")
	// {
	//     // Will add auth routes later
	// }

	// Protected routes (auth required)
	// Will add protected routes with auth middleware later

	// Placeholder for future route groups:
	// - Materials
	// - Suppliers
	// - Warehouses
	// - Purchase Orders
	// - GRN
	// - etc.
}
