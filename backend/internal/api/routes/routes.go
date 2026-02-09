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
	materialRepo := repository.NewMaterialRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, cfg)
	materialService := service.NewMaterialService(materialRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	materialHandler := handlers.NewMaterialHandler(materialService)

	// Initialize auth middleware
	authMiddleware := middleware.NewAuthMiddleware(authService)

	// API v1 group
	v1 := router.Group("/api/v1")

	// Auth routes
	authGroup := v1.Group("/auth")
	{
		authGroup.POST("/login", authHandler.Login)
		authGroup.POST("/logout", authMiddleware.RequireAuth(), authHandler.Logout)
		authGroup.POST("/refresh", authHandler.RefreshToken)
		authGroup.GET("/me", authMiddleware.RequireAuth(), authHandler.Me)
	}

	// Material routes
	materialGroup := v1.Group("/materials")
	{
		// Public endpoints
		materialGroup.GET("", materialHandler.List)
		materialGroup.GET("/:id", materialHandler.GetByID)

		// Protected endpoints (require authentication)
		materialGroup.POST("", authMiddleware.RequireAuth(), materialHandler.Create)
		materialGroup.PUT("/:id", authMiddleware.RequireAuth(), materialHandler.Update)
		materialGroup.DELETE("/:id", authMiddleware.RequireAuth(), materialHandler.Delete)
	}
}
