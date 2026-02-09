package routes

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/api/handlers"
	"github.com/VyVy-ERP/warehouse-backend/internal/api/middleware"
	"github.com/VyVy-ERP/warehouse-backend/internal/config"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Initialize repositories
	userRepo := repository.NewUserRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, cfg)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)

	// API v1 group
	api := router.Group("/api/v1")

	// Public routes (no auth required)
	auth := api.Group("/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.RefreshToken)
		auth.POST("/logout", authHandler.Logout)
	}

	// Protected routes (auth required)
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(authService))
	{
		// User profile
		protected.GET("/auth/me", authHandler.Me)

		// Future protected routes will go here:
		// - Materials
		// - Suppliers
		// - Warehouses
		// - Purchase Orders
		// - etc.
	}
}

