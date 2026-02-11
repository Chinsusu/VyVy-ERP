package service

import (
	"testing"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGRNService(t *testing.T) {
	db, cleanup := testutils.SetupTestDB()
	defer cleanup()

	grnRepo := repository.NewGoodsReceiptNoteRepository(db)
	grnItemRepo := repository.NewGoodsReceiptNoteItemRepository(db)
	poRepo := repository.NewPurchaseOrderRepository(db)
	poItemRepo := repository.NewPurchaseOrderItemRepository(db)
	warehouseRepo := repository.NewWarehouseRepository(db)
	stockLedgerRepo := repository.NewStockLedgerRepository(db)
	stockBalanceRepo := repository.NewStockBalanceRepository(db)

	svc := NewGRNService(db, grnRepo, grnItemRepo, poRepo, poItemRepo, warehouseRepo, stockLedgerRepo, stockBalanceRepo)

	userID := uint(1)

	setup := func(t *testing.T) (*models.PurchaseOrder, *models.PurchaseOrderItem, *models.Warehouse, *models.WarehouseLocation, *models.Material) {
		testutils.ClearDatabase(db)
		
		err := db.Create(&models.User{ID: int64(userID), Username: "grnuser", Email: "grn@test.com"}).Error
		require.NoError(t, err)
		
		s := &models.Supplier{Code: "S1", Name: "Supplier 1"}
		require.NoError(t, db.Create(s).Error)
		
		w := &models.Warehouse{Code: "W1", Name: "Warehouse 1"}
		require.NoError(t, db.Create(w).Error)
		
		loc := &models.WarehouseLocation{WarehouseID: w.ID, Code: "L1", Name: "Location 1"}
		require.NoError(t, db.Create(loc).Error)
		
		m := &models.Material{Code: "M1", TradingName: "Material 1", MaterialType: "raw_material", Unit: "kg"}
		require.NoError(t, db.Create(m).Error)

		po := &models.PurchaseOrder{
			PONumber:    "PO-GRN",
			SupplierID:  s.ID,
			WarehouseID: w.ID,
			OrderDate:   time.Now().Format("2006-01-02"),
			Status:      "approved",
			CreatedBy:   &userID,
		}
		require.NoError(t, db.Create(po).Error)

		poItem := &models.PurchaseOrderItem{
			PurchaseOrderID: po.ID,
			MaterialID:      uint(m.ID),
			Quantity:        100,
			UnitPrice:       10,
		}
		require.NoError(t, db.Create(poItem).Error)

		return po, poItem, w, loc, m
	}

	t.Run("CreateGRN - Success", func(t *testing.T) {
		po, poItem, w, loc, m := setup(t)
		req := &dto.CreateGRNRequest{
			GRNNumber:       "GRN-001",
			PurchaseOrderID: po.ID,
			WarehouseID:     w.ID,
			ReceiptDate:     time.Now().Format("2006-01-02"),
			Items: []dto.CreateGRNItemRequest{
				{
					POItemID:            poItem.ID,
					MaterialID:          uint(m.ID),
					WarehouseLocationID: &loc.ID,
					Quantity:            100,
					UnitCost:            10,
				},
			},
		}

		grn, err := svc.CreateGRN(req, userID)
		require.NoError(t, err)
		assert.Equal(t, "GRN-001", grn.GRNNumber)
		assert.Equal(t, "pending_qc", grn.Status)
	})

	t.Run("UpdateQC - Success", func(t *testing.T) {
		po, poItem, w, loc, m := setup(t)
		req := &dto.CreateGRNRequest{
			GRNNumber:       "GRN-002",
			PurchaseOrderID: po.ID,
			WarehouseID:     w.ID,
			ReceiptDate:     time.Now().Format("2006-01-02"),
			Items: []dto.CreateGRNItemRequest{
				{
					POItemID:            poItem.ID,
					MaterialID:          uint(m.ID),
					WarehouseLocationID: &loc.ID,
					Quantity:            100,
					UnitCost:            10,
				},
			},
		}
		grnSafe, err := svc.CreateGRN(req, userID)
		require.NoError(t, err)
		
		var grnItem models.GoodsReceiptNoteItem
		err = db.Where("grn_id = ?", grnSafe.ID).First(&grnItem).Error
		require.NoError(t, err)

		qcReq := &dto.UpdateGRNQCRequest{
			Items: map[uint]dto.UpdateGRNQCItemRequest{
				grnItem.ID: {
					AcceptedQuantity: 95,
					RejectedQuantity: 5,
					QCStatus:         "pass",
				},
			},
		}

		updated, err := svc.UpdateQC(grnSafe.ID, qcReq, userID)
		require.NoError(t, err)
		assert.Equal(t, "qc_completed", updated.Status)
	})

	t.Run("PostGRN - Success and Stock Update", func(t *testing.T) {
		po, poItem, w, loc, m := setup(t)
		req := &dto.CreateGRNRequest{
			GRNNumber:       "GRN-POST",
			PurchaseOrderID: po.ID,
			WarehouseID:     w.ID,
			ReceiptDate:     time.Now().Format("2006-01-02"),
			Items: []dto.CreateGRNItemRequest{
				{
					POItemID:            poItem.ID,
					MaterialID:          uint(m.ID),
					WarehouseLocationID: &loc.ID,
					Quantity:            100,
					UnitCost:            10,
				},
			},
		}
		grnSafe, err := svc.CreateGRN(req, userID)
		require.NoError(t, err)
		
		var grnItem models.GoodsReceiptNoteItem
		err = db.Where("grn_id = ?", grnSafe.ID).First(&grnItem).Error
		require.NoError(t, err)

		qcReq := &dto.UpdateGRNQCRequest{
			Items: map[uint]dto.UpdateGRNQCItemRequest{
				grnItem.ID: {
					AcceptedQuantity: 100,
					RejectedQuantity: 0,
					QCStatus:         "pass",
				},
			},
		}
		_, err = svc.UpdateQC(grnSafe.ID, qcReq, userID)
		require.NoError(t, err)

		posted, err := svc.PostGRN(grnSafe.ID, userID)
		require.NoError(t, err)
		assert.True(t, posted.Posted)

		var balance models.StockBalance
		err = db.Where("item_id = ? AND warehouse_id = ?", m.ID, w.ID).First(&balance).Error
		require.NoError(t, err)
		assert.Equal(t, float64(100), balance.Quantity)
		assert.Equal(t, float64(100), balance.AvailableQuantity)

		var ledger models.StockLedger
		err = db.Where("reference_id = ? AND reference_type = ?", grnSafe.ID, "GRN").First(&ledger).Error
		require.NoError(t, err)
		assert.Equal(t, float64(100), ledger.Quantity)
	})
}
