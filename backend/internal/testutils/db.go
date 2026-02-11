package testutils

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// SetupTestDB initializes a test database and migrates all models
func SetupTestDB() (*gorm.DB, func()) {
	host := getEnv("TEST_DATABASE_HOST", "localhost")
	port := getEnv("TEST_DATABASE_PORT", "5432")
	user := getEnv("TEST_DATABASE_USER", "postgres")
	password := getEnv("TEST_DATABASE_PASSWORD", "postgres")
	dbname := getEnv("TEST_DATABASE_NAME", "erp_warehouse_test")
	sslmode := getEnv("TEST_DATABASE_SSLMODE", "disable")

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s", host, port, user, password, dbname, sslmode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})

	if err != nil {
		log.Fatalf("Failed to connect to test database: %v", err)
	}

	// Reset schema for a clean slate
	db.Exec("DROP SCHEMA public CASCADE")
	db.Exec("CREATE SCHEMA public")
	db.Exec("GRANT ALL ON SCHEMA public TO public")

	// Models to migrate
	modelsToMigrate := []interface{}{
		&models.User{},
		&models.Supplier{},
		&models.Warehouse{},
		&models.Material{},
		&models.FinishedProduct{},
		&models.WarehouseLocation{},
		&models.PurchaseOrder{},
		&models.MaterialRequest{},
		&models.DeliveryOrder{},
		&models.GoodsReceiptNote{},
		&models.MaterialIssueNote{},
		&models.PurchaseOrderItem{},
		&models.GoodsReceiptNoteItem{},
		&models.MaterialRequestItem{},
		&models.MaterialIssueNoteItem{},
		&models.DeliveryOrderItem{},
		&models.StockLedger{},
		&models.StockBalance{},
		&models.StockReservation{},
		&models.StockAdjustment{},
		&models.StockAdjustmentItem{},
		&models.StockTransfer{},
		&models.StockTransferItem{},
	}

	// Create tables without constraints first
	for _, model := range modelsToMigrate {
		if err := db.Migrator().CreateTable(model); err != nil {
			log.Printf("Warning: Failed to create table for model %T: %v", model, err)
		}
	}

	// Now add constraints and indices
	if err := db.AutoMigrate(modelsToMigrate...); err != nil {
		log.Fatalf("Failed to auto-migrate test database: %v", err)
	}

	cleanup := func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}

	return db, cleanup
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// ClearDatabase deletes all data from tables
func ClearDatabase(db *gorm.DB) {
	tables := []string{
		"stock_transfer_items", "stock_transfers",
		"stock_adjustment_items", "stock_adjustments",
		"stock_reservations", "stock_balance", "stock_ledger",
		"delivery_order_items", "delivery_orders",
		"material_issue_note_items", "material_issue_notes",
		"material_request_items", "material_requests",
		"goods_receipt_note_items", "goods_receipt_notes",
		"purchase_order_items", "purchase_orders",
		"finished_products", "warehouse_locations", "warehouses",
		"suppliers", "materials", "users",
	}

	cmd := "TRUNCATE " + strings.Join(tables, ", ") + " RESTART IDENTITY CASCADE"
	if err := db.Exec(cmd).Error; err != nil {
		log.Printf("Warning: ClearDatabase failed: %v", err)
	}
}
