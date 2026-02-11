package service

import (
	"testing"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestPurchaseOrderService(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	poRepo := repository.NewPurchaseOrderRepository(db)
	poItemRepo := repository.NewPurchaseOrderItemRepository(db)
	supplierRepo := repository.NewSupplierRepository(db)
	warehouseRepo := repository.NewWarehouseRepository(db)
	
	svc := NewPurchaseOrderService(poRepo, poItemRepo, supplierRepo, warehouseRepo)

	userID := uint(1)

	// Pre-requisites
	testutils.ClearDatabase(db)
	s := &models.Supplier{Code: "S1", Name: "Supplier 1"}
	supplierRepo.Create(s)
	w := &models.Warehouse{Code: "W1", Name: "Warehouse 1"}
	warehouseRepo.Create(w)
	m := &models.Material{Code: "M1", TradingName: "Material 1", MaterialType: "raw_material"}
	db.Create(m) // Use db directly for simplicity in setup

	t.Run("CreatePurchaseOrder - Success", func(t *testing.T) {
		req := &dto.CreatePurchaseOrderRequest{
			PONumber:    "PO-SVC-001",
			SupplierID:  s.ID,
			WarehouseID: w.ID,
			OrderDate:   time.Now().Format("2006-01-02"),
			Items: []dto.CreatePurchaseOrderItemRequest{
				{MaterialID: uint(m.ID), Quantity: 10, UnitPrice: 100},
			},
		}

		po, err := svc.CreatePurchaseOrder(req, userID)
		assert.NoError(t, err)
		assert.Equal(t, "PO-SVC-001", po.PONumber)
		assert.Equal(t, "draft", po.Status)
		assert.Len(t, po.Items, 1)
		assert.Equal(t, float64(1000), po.TotalAmount)
	})

	t.Run("CreatePurchaseOrder - Duplicate PONumber", func(t *testing.T) {
		req := &dto.CreatePurchaseOrderRequest{
			PONumber:    "PO-SVC-001", // Already created in the previous subtest
			SupplierID:  s.ID,
			WarehouseID: w.ID,
			OrderDate:   time.Now().Format("2006-01-02"),
			Items: []dto.CreatePurchaseOrderItemRequest{
				{MaterialID: uint(m.ID), Quantity: 5, UnitPrice: 100},
			},
		}

		_, err := svc.CreatePurchaseOrder(req, userID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "already exists")
	})

	t.Run("ApprovePurchaseOrder - Success", func(t *testing.T) {
		// Create a draft PO
		req := &dto.CreatePurchaseOrderRequest{
			PONumber:    "PO-SVC-002",
			SupplierID:  s.ID,
			WarehouseID: w.ID,
			OrderDate:   time.Now().Format("2006-01-02"),
			Items: []dto.CreatePurchaseOrderItemRequest{
				{MaterialID: uint(m.ID), Quantity: 10, UnitPrice: 100},
			},
		}
		po, _ := svc.CreatePurchaseOrder(req, userID)

		// Create user to satisfy FK
		db.Create(&models.User{ID: int64(userID), Username: "svcuser", Email: "svc@test.com"})

		approved, err := svc.ApprovePurchaseOrder(po.ID, userID)
		assert.NoError(t, err)
		assert.Equal(t, "approved", approved.Status)
		assert.NotNil(t, approved.ApprovedAt)
	})

	t.Run("ApprovePurchaseOrder - Not Found", func(t *testing.T) {
		_, err := svc.ApprovePurchaseOrder(999, userID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "not found")
	})
}
