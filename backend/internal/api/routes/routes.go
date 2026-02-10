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
	supplierRepo := repository.NewSupplierRepository(db)
	warehouseRepo := repository.NewWarehouseRepository(db)
	warehouseLocationRepo := repository.NewWarehouseLocationRepository(db)
	finishedProductRepo := repository.NewFinishedProductRepository(db)
	purchaseOrderRepo := repository.NewPurchaseOrderRepository(db)
	purchaseOrderItemRepo := repository.NewPurchaseOrderItemRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, cfg)
	materialService := service.NewMaterialService(materialRepo)
	supplierService := service.NewSupplierService(supplierRepo)
	warehouseService := service.NewWarehouseService(warehouseRepo, warehouseLocationRepo)
	warehouseLocationService := service.NewWarehouseLocationService(warehouseLocationRepo, warehouseRepo)
	finishedProductService := service.NewFinishedProductService(finishedProductRepo)
	purchaseOrderService := service.NewPurchaseOrderService(purchaseOrderRepo, purchaseOrderItemRepo, supplierRepo, warehouseRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	materialHandler := handlers.NewMaterialHandler(materialService)
	supplierHandler := handlers.NewSupplierHandler(supplierService)
	warehouseHandler := handlers.NewWarehouseHandler(warehouseService)
	warehouseLocationHandler := handlers.NewWarehouseLocationHandler(warehouseLocationService)
	finishedProductHandler := handlers.NewFinishedProductHandler(finishedProductService)
	purchaseOrderHandler := handlers.NewPurchaseOrderHandler(purchaseOrderService)

	// API v1 group
	v1 := router.Group("/api/v1")

	// Auth routes
	authGroup := v1.Group("/auth")
	{
		authGroup.POST("/login", authHandler.Login)
		authGroup.POST("/logout", middleware.AuthMiddleware(authService), authHandler.Logout)
		authGroup.POST("/refresh", authHandler.RefreshToken)
		authGroup.GET("/me", middleware.AuthMiddleware(authService), authHandler.Me)
	}

	// Material routes
	materialGroup := v1.Group("/materials")
	{
		// Public endpoints
		materialGroup.GET("", materialHandler.List)
		materialGroup.GET("/:id", materialHandler.GetByID)

		// Protected endpoints (require authentication)
		materialGroup.POST("", middleware.AuthMiddleware(authService), materialHandler.Create)
		materialGroup.PUT("/:id", middleware.AuthMiddleware(authService), materialHandler.Update)
		materialGroup.DELETE("/:id", middleware.AuthMiddleware(authService), materialHandler.Delete)
	}

	// Supplier routes
	supplierGroup := v1.Group("/suppliers")
	{
		// Public endpoints
		supplierGroup.GET("", supplierHandler.List)
		supplierGroup.GET("/:id", supplierHandler.GetByID)

		// Protected endpoints (require authentication)
		supplierGroup.POST("", middleware.AuthMiddleware(authService), supplierHandler.Create)
		supplierGroup.PUT("/:id", middleware.AuthMiddleware(authService), supplierHandler.Update)
		supplierGroup.DELETE("/:id", middleware.AuthMiddleware(authService), supplierHandler.Delete)
	}

	// Warehouse routes
	warehouseGroup := v1.Group("/warehouses")
	{
		// Public endpoints
		warehouseGroup.GET("", warehouseHandler.List)
		warehouseGroup.GET("/:id", warehouseHandler.GetByID)
		warehouseGroup.GET("/:id/locations", warehouseHandler.GetLocations)

		// Protected endpoints (require authentication)
		warehouseGroup.POST("", middleware.AuthMiddleware(authService), warehouseHandler.Create)
		warehouseGroup.PUT("/:id", middleware.AuthMiddleware(authService), warehouseHandler.Update)
		warehouseGroup.DELETE("/:id", middleware.AuthMiddleware(authService), warehouseHandler.Delete)
	}

	// Warehouse Location routes
	locationGroup := v1.Group("/warehouse-locations")
	{
		// Public endpoints
		locationGroup.GET("", warehouseLocationHandler.List)
		locationGroup.GET("/:id", warehouseLocationHandler.GetByID)

		// Protected endpoints (require authentication)
		locationGroup.POST("", middleware.AuthMiddleware(authService), warehouseLocationHandler.Create)
		locationGroup.PUT("/:id", middleware.AuthMiddleware(authService), warehouseLocationHandler.Update)
		locationGroup.DELETE("/:id", middleware.AuthMiddleware(authService), warehouseLocationHandler.Delete)
	}

	// Finished Products routes
	productGroup := v1.Group("/finished-products")
	{
		// Public endpoints
		productGroup.GET("", finishedProductHandler.List)
		productGroup.GET("/:id", finishedProductHandler.GetByID)

		// Protected endpoints (require authentication)
		productGroup.POST("", middleware.AuthMiddleware(authService), finishedProductHandler.Create)
		productGroup.PUT("/:id", middleware.AuthMiddleware(authService), finishedProductHandler.Update)
		productGroup.DELETE("/:id", middleware.AuthMiddleware(authService), finishedProductHandler.Delete)
	}

	// Purchase Orders routes
	poGroup := v1.Group("/purchase-orders")
	{
		// Public endpoints
		poGroup.GET("", purchaseOrderHandler.List)
		poGroup.GET("/:id", purchaseOrderHandler.GetByID)

		// Protected endpoints (require authentication)
		poGroup.POST("", middleware.AuthMiddleware(authService), purchaseOrderHandler.Create)
		poGroup.PUT("/:id", middleware.AuthMiddleware(authService), purchaseOrderHandler.Update)
		poGroup.DELETE("/:id", middleware.AuthMiddleware(authService), purchaseOrderHandler.Delete)
		
		// Workflow endpoints
		poGroup.POST("/:id/approve", middleware.AuthMiddleware(authService), purchaseOrderHandler.Approve)
		poGroup.POST("/:id/cancel", middleware.AuthMiddleware(authService), purchaseOrderHandler.Cancel)
	}

	return router
}
