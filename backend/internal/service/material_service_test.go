package service

import (
	"testing"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestMaterialService(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	repo := repository.NewMaterialRepository(db)
	svc := NewMaterialService(repo)

	userID := int64(1)

	t.Run("CreateMaterial - Success", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := dto.CreateMaterialRequest{
			Code:         "MAT-001",
			TradingName:  "Test Material",
			MaterialType: "raw_material",
			Unit:         "kg",
			IsActive:     true,
		}

		material, err := svc.CreateMaterial(req, userID)
		assert.NoError(t, err)
		assert.Equal(t, "MAT-001", material.Code)
		assert.Equal(t, true, *material.IsActive)
	})

	t.Run("CreateMaterial - Duplicate Code", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := dto.CreateMaterialRequest{
			Code:         "MAT-001",
			TradingName:  "Test Material",
			MaterialType: "raw_material",
			Unit:         "kg",
			IsActive:     true,
		}
		_, _ = svc.CreateMaterial(req, userID)

		_, err := svc.CreateMaterial(req, userID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "already exists")
	})

	t.Run("UpdateMaterial - Success", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := dto.CreateMaterialRequest{
			Code:         "MAT-002",
			TradingName:  "Original Name",
			MaterialType: "raw_material",
			Unit:         "kg",
			IsActive:     true,
		}
		m, _ := svc.CreateMaterial(req, userID)

		newName := "Updated Name"
		updateReq := dto.UpdateMaterialRequest{
			TradingName: &newName,
		}

		updated, err := svc.UpdateMaterial(m.ID, updateReq, userID)
		assert.NoError(t, err)
		assert.Equal(t, newName, updated.TradingName)
	})

	t.Run("UpdateMaterial - Deactivate", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := dto.CreateMaterialRequest{
			Code:         "MAT-003",
			TradingName:  "Test",
			MaterialType: "raw_material",
			Unit:         "kg",
			IsActive:     true,
		}
		m, _ := svc.CreateMaterial(req, userID)

		active := false
		updateReq := dto.UpdateMaterialRequest{
			IsActive: &active,
		}

		updated, err := svc.UpdateMaterial(m.ID, updateReq, userID)
		assert.NoError(t, err)
		assert.Equal(t, false, *updated.IsActive)
	})

	t.Run("DeleteMaterial - Success", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := dto.CreateMaterialRequest{
			Code:         "MAT-004",
			TradingName:  "Test",
			MaterialType: "raw_material",
			Unit:         "kg",
			IsActive:     true,
		}
		m, _ := svc.CreateMaterial(req, userID)

		err := svc.DeleteMaterial(m.ID)
		assert.NoError(t, err)

		// Verify it's gone
		_, err = svc.GetMaterialByID(m.ID)
		assert.Error(t, err)
	})
}
