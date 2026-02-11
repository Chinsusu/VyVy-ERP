package repository

import (
	"testing"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestPurchaseOrderRepository(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	repo := NewPurchaseOrderRepository(db)
	supplierRepo := NewSupplierRepository(db)
	warehouseRepo := NewWarehouseRepository(db)
	materialRepo := NewMaterialRepository(db)

	t.Run("Create and GetByID", func(t *testing.T) {
		testutils.ClearDatabase(db)
		
		s := &models.Supplier{Code: "S1", Name: "Sup 1"}
		supplierRepo.Create(s)
		w := &models.Warehouse{Code: "W1", Name: "Wh 1"}
		warehouseRepo.Create(w)
		m := &models.Material{Code: "M1", TradingName: "Mat 1", MaterialType: "raw_material"}
		materialRepo.Create(m)

		po := &models.PurchaseOrder{
			PONumber:   "PO-001",
			SupplierID: s.ID,
			WarehouseID: w.ID,
			OrderDate:  time.Now().Format("2006-01-02"),
			Items: []*models.PurchaseOrderItem{
				{MaterialID: uint(m.ID), Quantity: 10, UnitPrice: 100, LineTotal: 1000},
			},
		}

		err := repo.Create(po)
		assert.NoError(t, err)
		assert.NotZero(t, po.ID)

		result, err := repo.GetByID(po.ID)
		assert.NoError(t, err)
		assert.Equal(t, "PO-001", result.PONumber)
		assert.Len(t, result.Items, 1)
		assert.Equal(t, uint(m.ID), result.Items[0].MaterialID)
		assert.NotNil(t, result.Supplier)
		assert.NotNil(t, result.Warehouse)
	})

	t.Run("UpdateStatus", func(t *testing.T) {
		testutils.ClearDatabase(db)
		s := &models.Supplier{Code: "S2", Name: "Sup 2"}
		db.Create(s)
		w := &models.Warehouse{Code: "W2", Name: "Wh 2"}
		db.Create(w)
		
		user := &models.User{Username: "testuser", Email: "test@example.com"}
		db.Create(user)
		userID := uint(user.ID)

		po := &models.PurchaseOrder{
			PONumber:   "PO-002",
			SupplierID: s.ID,
			WarehouseID: w.ID,
			OrderDate:  "2024-01-01",
			Status:     "draft",
		}
		db.Omit("Items").Create(po)

		now := time.Now()
		err := repo.UpdateStatus(po.ID, "approved", &userID, &now)
		assert.NoError(t, err)

		var updated models.PurchaseOrder
		db.First(&updated, po.ID)
		assert.Equal(t, "approved", updated.Status)
		assert.NotNil(t, updated.ApprovedBy)
	})

	t.Run("CalculateTotals", func(t *testing.T) {
		testutils.ClearDatabase(db)
		s := &models.Supplier{Code: "S3", Name: "Sup 3"}
		supplierRepo.Create(s)
		w := &models.Warehouse{Code: "W3", Name: "Wh 3"}
		warehouseRepo.Create(w)
		m1 := &models.Material{Code: "M1", TradingName: "Mat 1", MaterialType: "raw_material"}
		materialRepo.Create(m1)
		m2 := &models.Material{Code: "M2", TradingName: "Mat 2", MaterialType: "raw_material"}
		materialRepo.Create(m2)

		po := &models.PurchaseOrder{
			PONumber:   "PO-003",
			SupplierID: s.ID,
			WarehouseID: w.ID,
			OrderDate:  "2024-01-01",
		}
		db.Omit("Items").Create(po)

		items := []*models.PurchaseOrderItem{
			{PurchaseOrderID: po.ID, MaterialID: uint(m1.ID), Quantity: 10, UnitPrice: 100, TaxRate: 10, LineTotal: 1100},
			{PurchaseOrderID: po.ID, MaterialID: uint(m2.ID), Quantity: 5, UnitPrice: 200, DiscountRate: 10, LineTotal: 900},
		}
		for _, item := range items {
			err := db.Create(item).Error
			assert.NoError(t, err)
		}

		err := repo.CalculateTotals(po.ID)
		assert.NoError(t, err)

		var result models.PurchaseOrder
		db.First(&result, po.ID)
		assert.Equal(t, float64(2000), result.Subtotal)
		assert.Equal(t, float64(100), result.TaxAmount)
		assert.Equal(t, float64(100), result.DiscountAmount)
		assert.Equal(t, float64(2000), result.TotalAmount)
	})
}
