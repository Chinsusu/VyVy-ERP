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
	materialSupplierRepo := repository.NewMaterialSupplierRepository(db)
	supplierRepo := repository.NewSupplierRepository(db)
	warehouseRepo := repository.NewWarehouseRepository(db)
	warehouseLocationRepo := repository.NewWarehouseLocationRepository(db)
	finishedProductRepo := repository.NewFinishedProductRepository(db)
	productFormulaRepo := repository.NewProductFormulaRepository(db)
	purchaseOrderRepo := repository.NewPurchaseOrderRepository(db)
	purchaseOrderItemRepo := repository.NewPurchaseOrderItemRepository(db)
	grnRepo := repository.NewGoodsReceiptNoteRepository(db)
	grnItemRepo := repository.NewGoodsReceiptNoteItemRepository(db)
	ppRepo := repository.NewProductionPlanRepository(db)
	ppItemRepo := repository.NewProductionPlanItemRepository(db)
	stockLedgerRepo := repository.NewStockLedgerRepository(db)
	stockBalanceRepo := repository.NewStockBalanceRepository(db)
	minRepo := repository.NewMaterialIssueNoteRepository(db)
	stockReservationRepo := repository.NewStockReservationRepository(db)
	doRepo := repository.NewDeliveryOrderRepository(db)
	saRepo := repository.NewStockAdjustmentRepository(db)
	stRepo := repository.NewStockTransferRepository(db)
	salesChannelRepo := repository.NewSalesChannelRepository(db)
	carrierRepo := repository.NewCarrierRepository(db)
	reconRepo := repository.NewReconciliationRepository(db)
	roRepo := repository.NewReturnOrderRepository(db)
	auditLogRepo := repository.NewAuditLogRepository(db)
	productionTaskRepo := repository.NewProductionTaskRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, cfg)
	auditLogService := service.NewAuditLogService(auditLogRepo)
	materialService := service.NewMaterialService(materialRepo, materialSupplierRepo, auditLogService)
	supplierService := service.NewSupplierService(supplierRepo, auditLogService)
	warehouseService := service.NewWarehouseService(warehouseRepo, warehouseLocationRepo, auditLogService)
	warehouseLocationService := service.NewWarehouseLocationService(warehouseLocationRepo, warehouseRepo)
	finishedProductService := service.NewFinishedProductService(finishedProductRepo, auditLogService)
	productFormulaService := service.NewProductFormulaService(productFormulaRepo, finishedProductRepo, materialRepo)
	purchaseOrderService := service.NewPurchaseOrderService(purchaseOrderRepo, purchaseOrderItemRepo, supplierRepo, warehouseRepo, auditLogService)
	grnService := service.NewGRNService(db, grnRepo, grnItemRepo, purchaseOrderRepo, purchaseOrderItemRepo, warehouseRepo, stockLedgerRepo, stockBalanceRepo)
	ppService := service.NewProductionPlanService(db, ppRepo, ppItemRepo, warehouseRepo, materialRepo, stockBalanceRepo, stockReservationRepo, auditLogService)
	minService := service.NewMaterialIssueNoteService(minRepo, ppRepo, materialRepo, stockBalanceRepo, stockReservationRepo, db)
	stockService := service.NewStockService(stockBalanceRepo)
	doService := service.NewDeliveryOrderService(db, doRepo, warehouseRepo, finishedProductRepo, stockBalanceRepo, stockReservationRepo)
	saService := service.NewStockAdjustmentService(db, saRepo, warehouseRepo, materialRepo, finishedProductRepo, stockBalanceRepo)
	stService := service.NewStockTransferService(db, stRepo, warehouseRepo, stockBalanceRepo)
	dashboardService := service.NewDashboardService(db)
	reportService := service.NewReportService(db)
	alertService := service.NewAlertService(db)
	salesChannelService := service.NewSalesChannelService(salesChannelRepo)
	carrierService := service.NewCarrierService(carrierRepo)
	reconService := service.NewReconciliationService(reconRepo, carrierRepo)
	roService := service.NewReturnOrderService(db, roRepo, doRepo)
	productionTaskService := service.NewProductionTaskService(productionTaskRepo)

	supplierDocHandler := handlers.NewSupplierDocumentHandler(db)
	poDocHandler := handlers.NewPODocumentHandler(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	auditLogHandler := handlers.NewAuditLogHandler(auditLogService)
	materialHandler := handlers.NewMaterialHandler(materialService)
	supplierHandler := handlers.NewSupplierHandler(supplierService)
	warehouseHandler := handlers.NewWarehouseHandler(warehouseService)
	warehouseLocationHandler := handlers.NewWarehouseLocationHandler(warehouseLocationService)
	finishedProductHandler := handlers.NewFinishedProductHandler(finishedProductService)
	productFormulaHandler := handlers.NewProductFormulaHandler(productFormulaService)
	purchaseOrderHandler := handlers.NewPurchaseOrderHandler(purchaseOrderService)
	grnHandler := handlers.NewGRNHandler(grnService)
	ppHandler := handlers.NewProductionPlanHandler(ppService)
	minHandler := handlers.NewMaterialIssueNoteHandler(minService)
	stockHandler := handlers.NewStockHandler(stockService)
	doHandler := handlers.NewDeliveryOrderHandler(doService)
	inventoryHandler := handlers.NewInventoryHandler(saService, stService)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)
	reportHandler := handlers.NewReportHandler(reportService)
	alertHandler := handlers.NewAlertHandler(alertService)
	salesChannelHandler := handlers.NewSalesChannelHandler(salesChannelService)
	carrierHandler := handlers.NewCarrierHandler(carrierService)
	reconHandler := handlers.NewReconciliationHandler(reconService)
	roHandler := handlers.NewReturnOrderHandler(roService)
	productionTaskHandler := handlers.NewProductionTaskHandler(productionTaskService)

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

	// Material routes - All protected
	materialGroup := v1.Group("/materials")
	materialGroup.Use(middleware.AuthMiddleware(authService))
	{
		materialGroup.GET("", materialHandler.List)
		materialGroup.GET("/:id", materialHandler.GetByID)
		materialGroup.POST("", materialHandler.Create)
		materialGroup.PUT("/:id", materialHandler.Update)
		materialGroup.DELETE("/:id", middleware.RequireRole("admin"), materialHandler.Delete)
	}

	// Supplier routes - All protected
	supplierGroup := v1.Group("/suppliers")
	supplierGroup.Use(middleware.AuthMiddleware(authService))
	{
		supplierGroup.GET("", supplierHandler.List)
		supplierGroup.GET("/:id", supplierHandler.GetByID)
		supplierGroup.POST("", supplierHandler.Create)
		supplierGroup.PUT("/:id", supplierHandler.Update)
		supplierGroup.DELETE("/:id", middleware.RequireRole("admin"), supplierHandler.Delete)
		// Documents
		supplierGroup.GET("/:id/documents", supplierDocHandler.List)
		supplierGroup.POST("/:id/documents", supplierDocHandler.Upload)
		supplierGroup.DELETE("/:id/documents/:docId", supplierDocHandler.Delete)
	}

	// Warehouse routes - All protected
	warehouseGroup := v1.Group("/warehouses")
	warehouseGroup.Use(middleware.AuthMiddleware(authService))
	{
		warehouseGroup.GET("", warehouseHandler.List)
		warehouseGroup.GET("/:id", warehouseHandler.GetByID)
		warehouseGroup.GET("/:id/locations", warehouseHandler.GetLocations)

		// Admin/Warehouse Admin roles
		warehouseGroup.POST("", middleware.RequireRole("warehouse_admin"), warehouseHandler.Create)
		warehouseGroup.PUT("/:id", middleware.RequireRole("warehouse_admin"), warehouseHandler.Update)
		warehouseGroup.DELETE("/:id", middleware.RequireRole("admin"), warehouseHandler.Delete)
	}

	// Warehouse Location routes - All protected
	locationGroup := v1.Group("/warehouse-locations")
	locationGroup.Use(middleware.AuthMiddleware(authService))
	{
		locationGroup.GET("", warehouseLocationHandler.List)
		locationGroup.GET("/:id", warehouseLocationHandler.GetByID)

		locationGroup.POST("", middleware.RequireRole("warehouse_admin"), warehouseLocationHandler.Create)
		locationGroup.PUT("/:id", middleware.RequireRole("warehouse_admin"), warehouseLocationHandler.Update)
		locationGroup.DELETE("/:id", middleware.RequireRole("admin"), warehouseLocationHandler.Delete)
	}

	// Finished Products routes - All protected
	productGroup := v1.Group("/finished-products")
	productGroup.Use(middleware.AuthMiddleware(authService))
	{
		productGroup.GET("", finishedProductHandler.List)
		productGroup.GET("/:id", finishedProductHandler.GetByID)
		productGroup.POST("", finishedProductHandler.Create)
		productGroup.PUT("/:id", finishedProductHandler.Update)
		productGroup.DELETE("/:id", middleware.RequireRole("admin"), finishedProductHandler.Delete)

		// BOM (Formula) endpoints
		productGroup.GET("/:id/formulas", productFormulaHandler.ListByProduct)
		productGroup.GET("/:id/formulas/:fid", productFormulaHandler.GetByID)
		productGroup.POST("/:id/formulas", productFormulaHandler.Create)
		productGroup.PUT("/:id/formulas/:fid", productFormulaHandler.Update)
		productGroup.DELETE("/:id/formulas/:fid", productFormulaHandler.Delete)
	}

	// Purchase Orders routes - All protected
	poGroup := v1.Group("/purchase-orders")
	poGroup.Use(middleware.AuthMiddleware(authService))
	{
		poGroup.GET("", purchaseOrderHandler.List)
		poGroup.GET("/:id", purchaseOrderHandler.GetByID)
		poGroup.POST("", purchaseOrderHandler.Create)
		poGroup.PUT("/:id", purchaseOrderHandler.Update)
		poGroup.DELETE("/:id", middleware.RequireRole("admin"), purchaseOrderHandler.Delete)
		
		// Workflow endpoints
		poGroup.POST("/:id/approve", middleware.RequireRole("procurement_manager"), purchaseOrderHandler.Approve)
		poGroup.POST("/:id/cancel", middleware.RequireRole("procurement_manager"), purchaseOrderHandler.Cancel)
		poGroup.PUT("/:id/order-status", purchaseOrderHandler.UpdateOrderStatus)
		poGroup.PUT("/:id/payment-status", purchaseOrderHandler.UpdatePaymentStatus)
		poGroup.PUT("/:id/invoice-status", purchaseOrderHandler.UpdateInvoiceStatus)
		// Documents
		poGroup.GET("/:id/documents", poDocHandler.List)
		poGroup.POST("/:id/documents", poDocHandler.Upload)
		poGroup.DELETE("/:id/documents/:docId", poDocHandler.Delete)
	}


	// Stock / Inventory routes - All protected
	invGroup := v1.Group("/inventory")
	invGroup.Use(middleware.AuthMiddleware(authService))
	{
		invGroup.GET("/balance", stockHandler.GetBalance)

		// Adjustments
		invGroup.GET("/adjustments", inventoryHandler.ListAdjustments)
		invGroup.GET("/adjustments/:id", inventoryHandler.GetAdjustment)
		invGroup.POST("/adjustments", inventoryHandler.CreateAdjustment)
		invGroup.POST("/adjustments/:id/post", middleware.RequireRole("warehouse_manager"), inventoryHandler.PostAdjustment)
		invGroup.POST("/adjustments/:id/cancel", middleware.RequireRole("warehouse_manager"), inventoryHandler.CancelAdjustment)

		// Transfers
		invGroup.GET("/transfers", inventoryHandler.ListTransfers)
		invGroup.GET("/transfers/:id", inventoryHandler.GetTransfer)
		invGroup.POST("/transfers", inventoryHandler.CreateTransfer)
		invGroup.POST("/transfers/:id/post", middleware.RequireRole("warehouse_manager"), inventoryHandler.PostTransfer)
		invGroup.POST("/transfers/:id/cancel", middleware.RequireRole("warehouse_manager"), inventoryHandler.CancelTransfer)
	}

	// Goods Receipt Note (GRN) routes - All protected
	grnGroup := v1.Group("/grns")
	grnGroup.Use(middleware.AuthMiddleware(authService))
	{
		grnGroup.GET("", grnHandler.List)
		grnGroup.GET("/:id", grnHandler.GetByID)
		grnGroup.POST("", grnHandler.Create)
		grnGroup.POST("/:id/qc", grnHandler.UpdateQC)
		grnGroup.POST("/:id/post", middleware.RequireRole("warehouse_manager"), grnHandler.Post)
	}

	// Material Request (MR) routes - All protected
	ppGroup := v1.Group("/production-plans")
	ppGroup.Use(middleware.AuthMiddleware(authService))
	{
		ppGroup.GET("", ppHandler.List)
		ppGroup.GET("/:id", ppHandler.GetByID)
		ppGroup.POST("", ppHandler.Create)
		ppGroup.PUT("/:id", ppHandler.Update)
		ppGroup.DELETE("/:id", middleware.RequireRole("admin"), ppHandler.Delete)

		// Workflow endpoints
		ppGroup.POST("/:id/approve", middleware.RequireRole("warehouse_manager"), ppHandler.Approve)
		ppGroup.POST("/:id/cancel", middleware.RequireRole("warehouse_manager"), ppHandler.Cancel)

		// Production task endpoints
		ppGroup.GET("/:id/tasks", productionTaskHandler.List)
		ppGroup.POST("/:id/tasks", productionTaskHandler.Create)
		ppGroup.PUT("/:id/tasks/:taskId", productionTaskHandler.Update)
		ppGroup.DELETE("/:id/tasks/:taskId", productionTaskHandler.Delete)

		// Related purchase orders (auto-created on approve)
		ppGroup.GET("/:id/purchase-orders", ppHandler.GetRelatedPOs)
	}

	// Material Issue Note (MIN) routes - All protected
	minGroup := v1.Group("/material-issue-notes")
	minGroup.Use(middleware.AuthMiddleware(authService))
	{
		minGroup.GET("", minHandler.List)
		minGroup.GET("/:id", minHandler.GetByID)
		minGroup.POST("", minHandler.Create)
		minGroup.POST("/:id/post", middleware.RequireRole("warehouse_manager"), minHandler.Post)
		minGroup.POST("/:id/cancel", middleware.RequireRole("warehouse_manager"), minHandler.Cancel)
	}

	// Delivery Order (DO) routes - All protected
	doGroup := v1.Group("/delivery-orders")
	doGroup.Use(middleware.AuthMiddleware(authService))
	{
		doGroup.GET("", doHandler.List)
		doGroup.GET("/:id", doHandler.GetByID)
		doGroup.POST("", doHandler.Create)
		doGroup.PUT("/:id", doHandler.Update)
		doGroup.POST("/:id/ship", middleware.RequireRole("warehouse_manager"), doHandler.Ship)
		doGroup.POST("/:id/cancel", middleware.RequireRole("warehouse_manager"), doHandler.Cancel)
	}

	// Sales Channel routes - All protected
	scGroup := v1.Group("/sales-channels")
	scGroup.Use(middleware.AuthMiddleware(authService))
	{
		scGroup.GET("", salesChannelHandler.List)
		scGroup.GET("/:id", salesChannelHandler.GetByID)
		scGroup.POST("", salesChannelHandler.Create)
		scGroup.PUT("/:id", salesChannelHandler.Update)
		scGroup.DELETE("/:id", middleware.RequireRole("admin"), salesChannelHandler.Delete)
	}

	// Dashboard & Report routes - All protected
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
		reportGroup.GET("/low-stock", reportHandler.GetLowStockReport)
		reportGroup.GET("/expiring-soon", reportHandler.GetExpiringSoonReport)
	}

	// Alert routes - All protected
	alertGroup := v1.Group("/alerts")
	alertGroup.Use(middleware.AuthMiddleware(authService))
	{
		alertGroup.GET("/summary", alertHandler.GetAlertSummary)
		alertGroup.GET("/low-stock", alertHandler.GetLowStockAlerts)
		alertGroup.GET("/expiring-soon", alertHandler.GetExpiringSoonAlerts)
	}

	// Audit Log routes - All protected
	auditGroup := v1.Group("/audit-logs")
	auditGroup.Use(middleware.AuthMiddleware(authService))
	{
		auditGroup.GET("", auditLogHandler.GetHistory)
	}
	// Carrier routes - All protected
	carrierGroup := v1.Group("/carriers")
	carrierGroup.Use(middleware.AuthMiddleware(authService))
	{
		carrierGroup.GET("", carrierHandler.List)
		carrierGroup.GET("/:id", carrierHandler.GetByID)
		carrierGroup.POST("", carrierHandler.Create)
		carrierGroup.PUT("/:id", carrierHandler.Update)
		carrierGroup.DELETE("/:id", middleware.RequireRole("admin"), carrierHandler.Delete)
	}

	// Reconciliation routes - All protected
	reconGroup := v1.Group("/reconciliations")
	reconGroup.Use(middleware.AuthMiddleware(authService))
	{
		reconGroup.GET("", reconHandler.List)
		reconGroup.GET("/:id", reconHandler.GetByID)
		reconGroup.POST("", reconHandler.Create)
		reconGroup.POST("/:id/items", reconHandler.AddItems)
		reconGroup.PUT("/:id/confirm", middleware.RequireRole("warehouse_manager"), reconHandler.Confirm)
		reconGroup.DELETE("/:id", middleware.RequireRole("admin"), reconHandler.Delete)
	}

	// Return Order routes - All protected
	roGroup := v1.Group("/return-orders")
	roGroup.Use(middleware.AuthMiddleware(authService))
	{
		roGroup.GET("", roHandler.List)
		roGroup.GET("/:id", roHandler.GetByID)
		roGroup.POST("", roHandler.Create)
		roGroup.PUT("/:id", roHandler.Update)
		roGroup.DELETE("/:id", middleware.RequireRole("admin"), roHandler.Delete)

		// Workflow endpoints
		roGroup.POST("/:id/approve", middleware.RequireRole("warehouse_manager"), roHandler.Approve)
		roGroup.POST("/:id/receive", roHandler.Receive)
		roGroup.PUT("/:id/items/:itemId/inspect", roHandler.InspectItem)
		roGroup.POST("/:id/complete", middleware.RequireRole("warehouse_manager"), roHandler.Complete)
		roGroup.POST("/:id/cancel", roHandler.Cancel)
	}

	// Static file serving for uploads (authenticated)
	uploadsGroup := v1.Group("/uploads")
	uploadsGroup.Use(middleware.AuthMiddleware(authService))
	{
		uploadsGroup.GET("/supplier_documents/:supplierId/:filename", supplierDocHandler.ServeFile)
		uploadsGroup.GET("/po_documents/:poId/:filename", poDocHandler.ServeFile)
	}
}
