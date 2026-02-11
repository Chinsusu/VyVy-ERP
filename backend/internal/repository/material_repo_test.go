package repository

import (
	"testing"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestMaterialRepository(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	repo := NewMaterialRepository(db)

	t.Run("Create and GetByID", func(t *testing.T) {
		testutils.ClearDatabase(db)
		m := &models.Material{
			Code:         "MAT-UNIT-TEST-01",
			TradingName:  "Test Material 01",
			MaterialType: "raw_material",
			Unit:         "KG",
		}

		err := repo.Create(m)
		assert.NoError(t, err)
		assert.NotZero(t, m.ID)

		result, err := repo.GetByID(m.ID)
		assert.NoError(t, err)
		assert.Equal(t, m.Code, result.Code)
		assert.Equal(t, m.TradingName, result.TradingName)
	})

	t.Run("GetByCode", func(t *testing.T) {
		testutils.ClearDatabase(db)
		m := &models.Material{
			Code:         "MAT-UNIT-TEST-02",
			TradingName:  "Test Material 02",
			MaterialType: "packaging",
			Unit:         "PCS",
		}
		repo.Create(m)

		result, err := repo.GetByCode("MAT-UNIT-TEST-02")
		assert.NoError(t, err)
		assert.Equal(t, m.ID, result.ID)
	})

	t.Run("Update", func(t *testing.T) {
		testutils.ClearDatabase(db)
		m := &models.Material{
			Code:         "MAT-UNIT-TEST-03",
			TradingName:  "Original Name",
			MaterialType: "raw_material",
		}
		repo.Create(m)

		m.TradingName = "Updated Name"
		err := repo.Update(m)
		assert.NoError(t, err)

		result, _ := repo.GetByID(m.ID)
		assert.Equal(t, "Updated Name", result.TradingName)
	})

	t.Run("List with Filters", func(t *testing.T) {
		testutils.ClearDatabase(db)
		
		var countBefore int64
		db.Model(&models.Material{}).Count(&countBefore)
		t.Logf("Materials before subtest: %d", countBefore)

		trueVal := true
		falseVal := false

		materials := []models.Material{
			{Code: "M1", TradingName: "Alpha", MaterialType: "raw_material", IsActive: &trueVal},
			{Code: "M2", TradingName: "Beta", MaterialType: "packaging", IsActive: &trueVal},
			{Code: "M3", TradingName: "Gamma", MaterialType: "raw_material", IsActive: &falseVal},
		}
		for i := range materials {
			repo.Create(&materials[i])
		}

		// Filter by MaterialType
		items, total, err := repo.List(dto.MaterialFilterRequest{MaterialType: "raw_material"})
		assert.NoError(t, err)
		t.Logf("Found %d raw materials", total)
		assert.Equal(t, int64(2), total)
		assert.Len(t, items, 2)

		// Search
		items, total, err = repo.List(dto.MaterialFilterRequest{Search: "Alpha"})
		assert.NoError(t, err)
		assert.Equal(t, int64(1), total)
		assert.Equal(t, "M1", items[0].Code)

		// Filter by IsActive
		items, total, err = repo.List(dto.MaterialFilterRequest{IsActive: &trueVal})
		assert.NoError(t, err)
		assert.Equal(t, int64(2), total)
	})

	t.Run("Soft Delete and Restore", func(t *testing.T) {
		testutils.ClearDatabase(db)
		m := &models.Material{Code: "M-DEL", TradingName: "To Delete", MaterialType: "raw_material"}
		repo.Create(m)

		err := repo.Delete(m.ID)
		assert.NoError(t, err)

		_, err = repo.GetByID(m.ID)
		assert.Error(t, err) // Should not find soft-deleted item with First

		err = repo.Restore(m.ID)
		assert.NoError(t, err)

		result, err := repo.GetByID(m.ID)
		assert.NoError(t, err)
		assert.Equal(t, m.ID, result.ID)
	})
}
