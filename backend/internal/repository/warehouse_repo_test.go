package repository

import (
	"testing"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestWarehouseRepository(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	repo := NewWarehouseRepository(db)

	trueVal := true
	falseVal := false

	t.Run("Create and GetByID", func(t *testing.T) {
		testutils.ClearDatabase(db)
		w := &models.Warehouse{
			Code: "WH-01",
			Name: "Main Warehouse",
		}

		err := repo.Create(w)
		assert.NoError(t, err)
		assert.NotZero(t, w.ID)

		result, err := repo.GetByID(w.ID)
		assert.NoError(t, err)
		assert.Equal(t, w.Code, result.Code)
	})

	t.Run("GetByCode", func(t *testing.T) {
		testutils.ClearDatabase(db)
		w := &models.Warehouse{Code: "WH-02", Name: "Secondary Warehouse"}
		repo.Create(w)

		result, err := repo.GetByCode("WH-02")
		assert.NoError(t, err)
		assert.Equal(t, w.ID, result.ID)
	})

	t.Run("List with Filters", func(t *testing.T) {
		testutils.ClearDatabase(db)
		warehouses := []models.Warehouse{
			{Code: "W1", Name: "Central", WarehouseType: "main", IsActive: &trueVal},
			{Code: "W2", Name: "Regional", WarehouseType: "satellite", IsActive: &trueVal},
			{Code: "W3", Name: "Hidden", WarehouseType: "main", IsActive: &falseVal},
		}
		for i := range warehouses {
			repo.Create(&warehouses[i])
		}

		// Filter by WarehouseType
		_, total, err := repo.List(&dto.WarehouseFilterRequest{WarehouseType: "main"})
		assert.NoError(t, err)
		assert.Equal(t, int64(2), total)

		// Filter by IsActive
		_, total, err = repo.List(&dto.WarehouseFilterRequest{IsActive: &trueVal})
		assert.NoError(t, err)
		assert.Equal(t, int64(2), total)
	})

	t.Run("GetLocationsCount", func(t *testing.T) {
		testutils.ClearDatabase(db)
		w := &models.Warehouse{Code: "WH-LOC", Name: "Warehouse with Locations"}
		repo.Create(w)

		locs := []*models.WarehouseLocation{
			{Code: "L1", Name: "Bin 1", WarehouseID: w.ID},
			{Code: "L2", Name: "Bin 2", WarehouseID: w.ID},
		}
		for _, l := range locs {
			db.Create(l)
		}

		count, err := repo.GetLocationsCount(w.ID)
		assert.NoError(t, err)
		assert.Equal(t, int64(2), count)
	})
}
