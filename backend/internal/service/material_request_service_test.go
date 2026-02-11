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

func TestMaterialRequestService(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	mrRepo := repository.NewMaterialRequestRepository(db)
	mrItemRepo := repository.NewMaterialRequestItemRepository(db)
	warehouseRepo := repository.NewWarehouseRepository(db)
	materialRepo := repository.NewMaterialRepository(db)
	stockRepo := repository.NewStockBalanceRepository(db)
	reservationRepo := repository.NewStockReservationRepository(db)

	svc := NewMaterialRequestService(db, mrRepo, mrItemRepo, warehouseRepo, materialRepo, stockRepo, reservationRepo)

	userID := uint(1)

	// Pre-requisites
	testutils.ClearDatabase(db)
	w := &models.Warehouse{Code: "WH-MR", Name: "Warehouse MR"}
	db.Create(w)
	m := &models.Material{Code: "MAT-MR", TradingName: "Material MR", MaterialType: "raw_material", Unit: "kg"}
	db.Create(m)
	loc := &models.WarehouseLocation{WarehouseID: w.ID, Code: "LOC-MR", Name: "Location MR"}
	db.Create(loc)

	t.Run("CreateMaterialRequest - Success", func(t *testing.T) {
		req := &dto.CreateMaterialRequestRequest{
			MRNumber:    "MR-001",
			WarehouseID: w.ID,
			Department:  "Production",
			RequestDate: time.Now().Format("2006-01-02"),
			Items: []dto.CreateMaterialRequestItemRequest{
				{MaterialID: uint(m.ID), RequestedQuantity: 10},
			},
		}

		mr, err := svc.CreateMaterialRequest(req, userID)
		assert.NoError(t, err)
		assert.Equal(t, "MR-001", mr.MRNumber)
		assert.Equal(t, "draft", mr.Status)
		assert.Len(t, mr.Items, 1)
	})

	t.Run("ApproveMaterialRequest - Success with Reservation", func(t *testing.T) {
		testutils.ClearDatabase(db)
		db.Create(w)
		db.Create(m)
		db.Create(loc)

		// Create user to satisfy FK
		db.Create(&models.User{ID: int64(userID), Username: "svcuser", Email: "svc@test.com"})

		// 1. Create stock balance first
		balance := &models.StockBalance{
			ItemType:            "material",
			ItemID:              uint(m.ID),
			WarehouseID:         w.ID,
			WarehouseLocationID: &loc.ID,
			Quantity:            100,
			AvailableQuantity:   100,
		}
		db.Create(balance)

		// 2. Create a draft MR
		req := &dto.CreateMaterialRequestRequest{
			MRNumber:    "MR-002",
			WarehouseID: w.ID,
			Department:  "Production",
			RequestDate: time.Now().Format("2006-01-02"),
			Items: []dto.CreateMaterialRequestItemRequest{
				{MaterialID: uint(m.ID), RequestedQuantity: 50},
			},
		}
		mr, err := svc.CreateMaterialRequest(req, userID)
		assert.NoError(t, err)

		// 3. Approve it
		approved, err := svc.ApproveMaterialRequest(mr.ID, userID)
		if !assert.NoError(t, err) {
			t.FailNow()
		}
		assert.Equal(t, "approved", approved.Status)

		// 4. Verify stock reservation
		var reservation models.StockReservation
		err = db.Where("reference_id = ? AND reference_type = ?", mr.ID, "material_request").First(&reservation).Error
		assert.NoError(t, err)
		assert.Equal(t, float64(50), reservation.ReservedQuantity)

		// 5. Verify stock balance update
		var updatedBalance models.StockBalance
		db.First(&updatedBalance, balance.ID)
		assert.Equal(t, float64(50), updatedBalance.AvailableQuantity)
		assert.Equal(t, float64(50), updatedBalance.ReservedQuantity)
	})

	t.Run("ApproveMaterialRequest - Insufficient Stock", func(t *testing.T) {
		testutils.ClearDatabase(db)
		db.Create(w)
		db.Create(m)
		
		// Create user to satisfy FK
		db.Create(&models.User{ID: int64(userID), Username: "svcuser", Email: "svc@test.com"})

		// Create MR for 100 but no stock
		req := &dto.CreateMaterialRequestRequest{
			MRNumber:    "MR-003",
			WarehouseID: w.ID,
			Department:  "Production",
			RequestDate: time.Now().Format("2006-01-02"),
			Items: []dto.CreateMaterialRequestItemRequest{
				{MaterialID: uint(m.ID), RequestedQuantity: 100},
			},
		}
		mr, err := svc.CreateMaterialRequest(req, userID)
		assert.NoError(t, err)

		_, err = svc.ApproveMaterialRequest(mr.ID, userID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "insufficient stock")
	})
}
