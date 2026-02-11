package service

import (
	"testing"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

func TestSupplierService(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	repo := repository.NewSupplierRepository(db)
	svc := NewSupplierService(repo)

	userID := uint(1)

	t.Run("CreateSupplier - Success", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := &dto.CreateSupplierRequest{
			Code:     "SUP-001",
			Name:     "Test Supplier",
			Country:  "Vietnam",
			IsActive: true,
		}

		supplier, err := svc.CreateSupplier(req, userID)
		assert.NoError(t, err)
		assert.Equal(t, "SUP-001", supplier.Code)
		assert.Equal(t, true, *supplier.IsActive)
	})

	t.Run("CreateSupplier - Duplicate Code", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := &dto.CreateSupplierRequest{
			Code:     "SUP-001",
			Name:     "Test Supplier",
			Country:  "Vietnam",
			IsActive: true,
		}
		_, _ = svc.CreateSupplier(req, userID)

		_, err := svc.CreateSupplier(req, userID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "already exists")
	})

	t.Run("UpdateSupplier - Success", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := &dto.CreateSupplierRequest{
			Code:     "SUP-002",
			Name:     "Original Name",
			Country:  "Vietnam",
			IsActive: true,
		}
		s, _ := svc.CreateSupplier(req, userID)

		newName := "Updated Name"
		updateReq := &dto.UpdateSupplierRequest{
			Name: newName,
		}

		updated, err := svc.UpdateSupplier(s.ID, updateReq, userID)
		assert.NoError(t, err)
		assert.Equal(t, newName, updated.Name)
	})

	t.Run("DeleteSupplier - Success", func(t *testing.T) {
		testutils.ClearDatabase(db)
		req := &dto.CreateSupplierRequest{
			Code:     "SUP-003",
			Name:     "Test",
			Country:  "Vietnam",
			IsActive: true,
		}
		s, _ := svc.CreateSupplier(req, userID)

		err := svc.DeleteSupplier(s.ID)
		assert.NoError(t, err)

		_, err = svc.GetSupplierByID(s.ID)
		assert.Error(t, err)
	})
}
