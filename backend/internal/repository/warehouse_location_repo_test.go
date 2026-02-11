package repository

import (
	"testing"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestWarehouseLocationRepository(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	repo := NewWarehouseLocationRepository(db)
	warehouseRepo := NewWarehouseRepository(db)

	trueVal := true
	falseVal := false

	t.Run("Create and GetByID", func(t *testing.T) {
		testutils.ClearDatabase(db)
		w := &models.Warehouse{Code: "WH-1", Name: "Warehouse 1"}
		warehouseRepo.Create(w)

		l := &models.WarehouseLocation{
			WarehouseID: w.ID,
			Code:        "LOC-01",
			Name:        "Location 01",
		}

		err := repo.Create(l)
		assert.NoError(t, err)
		assert.NotZero(t, l.ID)

		result, err := repo.GetByID(l.ID)
		assert.NoError(t, err)
		assert.Equal(t, l.Code, result.Code)
		assert.Equal(t, w.ID, result.WarehouseID)
		assert.NotNil(t, result.Warehouse)
	})

	t.Run("List By Warehouse ID", func(t *testing.T) {
		testutils.ClearDatabase(db)
		w := &models.Warehouse{Code: "WH-2", Name: "Warehouse 2"}
		warehouseRepo.Create(w)

		locs := []models.WarehouseLocation{
			{WarehouseID: w.ID, Code: "L1", Name: "Loc 1"},
			{WarehouseID: w.ID, Code: "L2", Name: "Loc 2"},
		}
		for i := range locs {
			repo.Create(&locs[i])
		}

		result, err := repo.ListByWarehouseID(w.ID)
		assert.NoError(t, err)
		assert.Len(t, result, 2)
	})

	t.Run("List with Filters", func(t *testing.T) {
		testutils.ClearDatabase(db)
		w1 := &models.Warehouse{Code: "WH-A", Name: "Warehouse A"}
		warehouseRepo.Create(w1)
		w2 := &models.Warehouse{Code: "WH-B", Name: "Warehouse B"}
		warehouseRepo.Create(w2)

		locs := []models.WarehouseLocation{
			{WarehouseID: w1.ID, Code: "A1", Name: "Section A", LocationType: "storage", IsActive: &trueVal},
			{WarehouseID: w1.ID, Code: "A2", Name: "Section B", LocationType: "qc", IsActive: &trueVal},
			{WarehouseID: w2.ID, Code: "B1", Name: "Section C", LocationType: "storage", IsActive: &falseVal},
		}
		for i := range locs {
			repo.Create(&locs[i])
		}

		// Filter by WarehouseID
		_, total, err := repo.List(&dto.WarehouseLocationFilterRequest{WarehouseID: &w1.ID})
		assert.NoError(t, err)
		assert.Equal(t, int64(2), total)

		// Filter by LocationType
		_, total, err = repo.List(&dto.WarehouseLocationFilterRequest{LocationType: "storage"})
		assert.NoError(t, err)
		assert.Equal(t, int64(2), total)

		// Filter by IsActive
		_, total, err = repo.List(&dto.WarehouseLocationFilterRequest{IsActive: &trueVal})
		assert.NoError(t, err)
		assert.Equal(t, int64(2), total)
	})
}
