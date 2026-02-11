package service

import (
	"testing"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestStockService(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	repo := repository.NewStockBalanceRepository(db)
	svc := NewStockService(repo)

	t.Run("GetStockBalance - Success", func(t *testing.T) {
		testutils.ClearDatabase(db)
		// Setup warehouse and material to satisfy potential FKs if needed, though StockBalance might not have them enforced in all tests
		w := &models.Warehouse{Code: "W1", Name: "Warehouse 1"}
		db.Create(w)
		m := &models.Material{Code: "M1", TradingName: "Material 1", MaterialType: "raw_material", Unit: "kg"}
		db.Create(m)

		balance := &models.StockBalance{
			ItemType:    "material",
			ItemID:      uint(m.ID),
			WarehouseID: w.ID,
			Quantity:    100,
		}
		db.Create(balance)

		result, err := svc.GetStockBalance("material", uint(m.ID), w.ID)
		assert.NoError(t, err)
		assert.Len(t, result, 1)
		assert.Equal(t, float64(100), result[0].Quantity)
	})

	t.Run("GetGlobalStockBalance - Filters", func(t *testing.T) {
		testutils.ClearDatabase(db)
		w := &models.Warehouse{Code: "W1", Name: "Warehouse 1"}
		db.Create(w)
		m1 := &models.Material{Code: "M1", TradingName: "Material 1", MaterialType: "raw_material", Unit: "kg"}
		db.Create(m1)
		m2 := &models.Material{Code: "M2", TradingName: "Material 2", MaterialType: "raw_material", Unit: "kg"}
		db.Create(m2)

		db.Create(&models.StockBalance{ItemType: "material", ItemID: uint(m1.ID), WarehouseID: w.ID, Quantity: 50})
		db.Create(&models.StockBalance{ItemType: "material", ItemID: uint(m2.ID), WarehouseID: w.ID, Quantity: 30})

		filters := map[string]interface{}{
			"item_type": "material",
			"item_id":   uint(m1.ID),
		}
		result, err := svc.GetGlobalStockBalance(filters)
		assert.NoError(t, err)
		assert.Len(t, result, 1)
		assert.Equal(t, float64(50), result[0].Quantity)
	})
}
