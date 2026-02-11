package service

import (
	"testing"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestWarehouseService(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	repo := repository.NewWarehouseRepository(db)
	locationRepo := repository.NewWarehouseLocationRepository(db)
	svc := NewWarehouseService(repo, locationRepo)

	userID := uint(1)

	t.Run("CreateWarehouse - Success", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := &dto.CreateWarehouseRequest{
			Code:          "WH-001",
			Name:          "Main Warehouse",
			WarehouseType: "main",
			IsActive:      true,
		}

		warehouse, err := svc.CreateWarehouse(req, userID)
		assert.NoError(t, err)
		assert.Equal(t, "WH-001", warehouse.Code)
		assert.Equal(t, true, *warehouse.IsActive)
	})

	t.Run("UpdateWarehouse - Success", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := &dto.CreateWarehouseRequest{
			Code:          "WH-002",
			Name:          "Original Warehouse",
			WarehouseType: "main",
			IsActive:      true,
		}
		w, _ := svc.CreateWarehouse(req, userID)

		newName := "Updated Warehouse"
		updateReq := &dto.UpdateWarehouseRequest{
			Name: newName,
		}

		updated, err := svc.UpdateWarehouse(w.ID, updateReq, userID)
		assert.NoError(t, err)
		assert.Equal(t, newName, updated.Name)
	})

	t.Run("DeleteWarehouse - Fail when has locations", func(t *testing.T) {
		testutils.ClearDatabase(db)
		w := &models.Warehouse{Code: "WH-LOC", Name: "Warehouse with Locations"}
		db.Create(w)
		
		loc := &models.WarehouseLocation{WarehouseID: w.ID, Code: "LOC-1", Name: "Location 1"}
		db.Create(loc)

		err := svc.DeleteWarehouse(w.ID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "existing locations")
	})

	t.Run("GetWarehouseLocations - Success", func(t *testing.T) {
		testutils.ClearDatabase(db)
		w := &models.Warehouse{Code: "WH-LIST", Name: "Warehouse List"}
		db.Create(w)
		
		locations := []*models.WarehouseLocation{
			{WarehouseID: w.ID, Code: "L1", Name: "Loc 1"},
			{WarehouseID: w.ID, Code: "L2", Name: "Loc 2"},
		}
		for _, l := range locations {
			db.Create(l)
		}

		result, err := svc.GetWarehouseLocations(w.ID)
		assert.NoError(t, err)
		assert.Len(t, result, 2)
	})
}
