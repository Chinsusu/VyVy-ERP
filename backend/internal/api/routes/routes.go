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
	grnRepo := repository.NewGoodsReceiptNoteRepository(db)
	grnItemRepo := repository.NewGoodsReceiptNoteItemRepository(db)
	mrRepo := repository.NewMaterialRequestRepository(db)
	mrItemRepo := repository.NewMaterialRequestItemRepository(db)
	stockLedgerRepo := repository.NewStockLedgerRepository(db)
	stockBalanceRepo := repository.NewStockBalanceRepository(db)
	minRepo := repository.NewMaterialIssueNoteRepository(db)
	stockReservationRepo := repository.NewStockReservationRepository(db)
	doRepo := repository.NewDeliveryOrderRepository(db)
	saRepo := repository.NewStockAdjustmentRepository(db)
	stRepo := repository.NewStockTransferRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, cfg)
	materialService := service.NewMaterialService(materialRepo)
	supplierService := service.NewSupplierService(supplierRepo)
	warehouseService := service.NewWarehouseService(warehouseRepo, warehouseLocationRepo)
	warehouseLocationService := service.NewWarehouseLocationService(warehouseLocationRepo, warehouseRepo)
	finishedProductService := service.NewFinishedProductService(finishedProductRepo)
	purchaseOrderService := service.NewPurchaseOrderService(purchaseOrderRepo, purchaseOrderItemRepo, supplierRepo, warehouseRepo)
	grnService := service.NewGRNService(db, grnRepo, grnItemRepo, purchaseOrderRepo, purchaseOrderItemRepo, warehouseRepo, stockLedgerRepo, stockBalanceRepo)
	mrService := service.NewMaterialRequestService(db, mrRepo, mrItemRepo, warehouseRepo, materialRepo, stockBalanceRepo, stockReservationRepo)
	minService := service.NewMaterialIssueNoteService(minRepo, mrRepo, materialRepo, stockBalanceRepo, stockReservationRepo, db)
	stockService := service.NewStockService(stockBalanceRepo)
	doService := service.NewDeliveryOrderService(db, doRepo, warehouseRepo, finishedProductRepo, stockBalanceRepo, stockReservationRepo)
	saService := service.NewStockAdjustmentService(db, saRepo, warehouseRepo, materialRepo, finishedProductRepo, stockBalanceRepo)
	stService := service.NewStockTransferService(db, stRepo, warehouseRepo, stockBalanceRepo)
	dashboardService := service.NewDashboardService(db)
	reportService := service.NewReportService(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	materialHandler := handlers.NewMaterialHandler(materialService)
	supplierHandler := handlers.NewSupplierHandler(supplierService)
	warehouseHandler := handlers.NewWarehouseHandler(warehouseService)
	warehouseLocationHandler := handlers.NewWarehouseLocationHandler(warehouseLocationService)
	finishedProductHandler := handlers.NewFinishedProductHandler(finishedProductService)
	purchaseOrderHandler := handlers.NewPurchaseOrderHandler(purchaseOrderService)
	grnHandler := handlers.NewGRNHandler(grnService)
	mrHandler := handlers.NewMaterialRequestHandler(mrService)
	minHandler := handlers.NewMaterialIssueNoteHandler(minService)
	stockHandler := handlers.NewStockHandler(stockService)
	doHandler := handlers.NewDeliveryOrderHandler(doService)
	inventoryHandler := handlers.NewInventoryHandler(saService, stService)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)
	reportHandler := handlers.NewReportHandler(reportService)

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

	// Stock / Inventory routes
	invGroup := v1.Group("/inventory")
	invGroup.Use(middleware.AuthMiddleware(authService))
	{
		invGroup.GET("/balance", stockHandler.GetBalance)

		// Adjustments
		invGroup.GET("/adjustments", inventoryHandler.ListAdjustments)
		invGroup.GET("/adjustments/:id", inventoryHandler.GetAdjustment)
		invGroup.POST("/adjustments", inventoryHandler.CreateAdjustment)
		invGroup.POST("/adjustments/:id/post", inventoryHandler.PostAdjustment)
		invGroup.POST("/adjustments/:id/cancel", inventoryHandler.CancelAdjustment)

		// Transfers
		invGroup.GET("/transfers", inventoryHandler.ListTransfers)
		invGroup.GET("/transfers/:id", inventoryHandler.GetTransfer)
		invGroup.POST("/transfers", inventoryHandler.CreateTransfer)
		invGroup.POST("/transfers/:id/post", inventoryHandler.PostTransfer)
		invGroup.POST("/transfers/:id/cancel", inventoryHandler.CancelTransfer)
	}

	// Goods Receipt Note (GRN) routes
	grnGroup := v1.Group("/grns")
	{
		// Public endpoints
		grnGroup.GET("", grnHandler.List)
		grnGroup.GET("/:id", grnHandler.GetByID)

		// Protected endpoints (require authentication)
		grnGroup.POST("", middleware.AuthMiddleware(authService), grnHandler.Create)
		grnGroup.POST("/:id/qc", middleware.AuthMiddleware(authService), grnHandler.UpdateQC)
		grnGroup.POST("/:id/post", middleware.AuthMiddleware(authService), grnHandler.Post)
	}

	// Material Request (MR) routes
	mrGroup := v1.Group("/material-requests")
	{
		// Public endpoints
		mrGroup.GET("", mrHandler.List)
		mrGroup.GET("/:id", mrHandler.GetByID)

		// Protected endpoints (require authentication)
		mrGroup.POST("", middleware.AuthMiddleware(authService), mrHandler.Create)
		mrGroup.PUT("/:id", middleware.AuthMiddleware(authService), mrHandler.Update)
		mrGroup.DELETE("/:id", middleware.AuthMiddleware(authService), mrHandler.Delete)

		// Workflow endpoints
		mrGroup.POST("/:id/approve", middleware.AuthMiddleware(authService), mrHandler.Approve)
		mrGroup.POST("/:id/cancel", middleware.AuthMiddleware(authService), mrHandler.Cancel)
	}

	// Material Issue Note (MIN) routes
	minGroup := v1.Group("/material-issue-notes")
	{
		// Public endpoints
		minGroup.GET("", minHandler.List)
		minGroup.GET("/:id", minHandler.GetByID)

		// Protected endpoints (require authentication)
		minGroup.POST("", middleware.AuthMiddleware(authService), minHandler.Create)
		minGroup.POST("/:id/post", middleware.AuthMiddleware(authService), minHandler.Post)
		minGroup.POST("/:id/cancel", middleware.AuthMiddleware(authService), minHandler.Cancel)
	}

	// Delivery Order (DO) routes
	doGroup := v1.Group("/delivery-orders")
	{
		// Public endpoints
		doGroup.GET("", doHandler.List)
		doGroup.GET("/:id", doHandler.GetByID)

		// Protected endpoints
		doGroup.POST("", middleware.AuthMiddleware(authService), doHandler.Create)
		doGroup.PUT("/:id", middleware.AuthMiddleware(authService), doHandler.Update)
		doGroup.POST("/:id/ship", middleware.AuthMiddleware(authService), doHandler.Ship)
		doGroup.POST("/:id/cancel", middleware.AuthMiddleware(authService), doHandler.Cancel)
	}

	// Dashboard & Report routes
	dashGroup := v1.Group("/dashboard")
	dashGroup.Use(middleware.AuthMiddleware(authService))
	{
		dashGroup.GET("/stats", dashboardHandler.GetStats)
	}

	reportGroup := v1.Group("/reports")
	reportGroup.Use(middleware.AuthMiddleware(authService))
	{
		reportGroup.GET("/stock-movement", reportHandler.GetStockMovementReport)
		reportGroup.GET("/inventory-value", reportHandler.GetInventoryValueReport)
	}
}
