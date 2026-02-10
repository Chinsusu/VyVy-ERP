package main

import (
	"log"

	"github.com/VyVy-ERP/warehouse-backend/internal/config"
	"github.com/VyVy-ERP/warehouse-backend/internal/database"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	db, err := database.Connect(&cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Starting database synchronization...")

	err = db.AutoMigrate(
		&models.User{},
		&models.Material{},
		&models.Supplier{},
		&models.Warehouse{},
		&models.WarehouseLocation{},
		&models.FinishedProduct{},
		&models.PurchaseOrder{},
		&models.PurchaseOrderItem{},
		&models.GoodsReceiptNote{},
		&models.GoodsReceiptNoteItem{},
		&models.MaterialRequest{},
		&models.MaterialRequestItem{},
		&models.MaterialIssueNote{},
		&models.MaterialIssueNoteItem{},
		&models.DeliveryOrder{},
		&models.DeliveryOrderItem{},
		&models.StockAdjustment{},
		&models.StockAdjustmentItem{},
		&models.StockTransfer{},
		&models.StockTransferItem{},
		&models.StockLedger{},
		&models.StockBalance{},
		&models.StockReservation{},
	)

	if err != nil {
		log.Fatal("Database synchronization failed:", err)
	}

	log.Println("✅ Database synchronization completed successfully!")
}
