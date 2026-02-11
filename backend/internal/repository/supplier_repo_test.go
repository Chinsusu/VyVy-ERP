package repository

import (
	"testing"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestSupplierRepository(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	repo := NewSupplierRepository(db)

	trueVal := true
	falseVal := false

	t.Run("Create and GetByID", func(t *testing.T) {
		testutils.ClearDatabase(db)
		s := &models.Supplier{
			Code: "SUP-01",
			Name: "Supplier One",
		}

		err := repo.Create(s)
		assert.NoError(t, err)
		assert.NotZero(t, s.ID)

		result, err := repo.GetByID(s.ID)
		assert.NoError(t, err)
		assert.Equal(t, s.Code, result.Code)
		assert.Equal(t, s.Name, result.Name)
	})

	t.Run("GetByCode", func(t *testing.T) {
		testutils.ClearDatabase(db)
		s := &models.Supplier{Code: "SUP-02", Name: "Supplier Two"}
		repo.Create(s)

		result, err := repo.GetByCode("SUP-02")
		assert.NoError(t, err)
		assert.Equal(t, s.ID, result.ID)
	})

	t.Run("Update", func(t *testing.T) {
		testutils.ClearDatabase(db)
		s := &models.Supplier{Code: "SUP-03", Name: "Original Name"}
		repo.Create(s)

		s.Name = "Updated Name"
		err := repo.Update(s)
		assert.NoError(t, err)

		result, _ := repo.GetByID(s.ID)
		assert.Equal(t, "Updated Name", result.Name)
	})

	t.Run("List with Filters", func(t *testing.T) {
		testutils.ClearDatabase(db)
		suppliers := []models.Supplier{
			{Code: "S1", Name: "Alpha Corp", Country: "Vietnam", IsActive: &trueVal},
			{Code: "S2", Name: "Beta Inc", Country: "USA", IsActive: &trueVal},
			{Code: "S3", Name: "Gamma Ltd", Country: "Vietnam", IsActive: &falseVal},
		}
		for i := range suppliers {
			repo.Create(&suppliers[i])
		}

		// Filter by Country
		items, total, err := repo.List(&dto.SupplierFilterRequest{Country: "Vietnam"})
		assert.NoError(t, err)
		assert.Equal(t, int64(2), total)

		// Search
		items, total, err = repo.List(&dto.SupplierFilterRequest{Search: "Beta"})
		assert.NoError(t, err)
		assert.Equal(t, int64(1), total)
		assert.Equal(t, "S2", items[0].Code)

		// Filter by IsActive
		items, total, err = repo.List(&dto.SupplierFilterRequest{IsActive: &trueVal})
		assert.NoError(t, err)
		assert.Equal(t, int64(2), total)
	})

	t.Run("Delete", func(t *testing.T) {
		testutils.ClearDatabase(db)
		s := &models.Supplier{Code: "S-DEL", Name: "To Delete"}
		repo.Create(s)

		err := repo.Delete(s.ID)
		assert.NoError(t, err)

		_, err = repo.GetByID(s.ID)
		assert.Error(t, err)
	})
}
