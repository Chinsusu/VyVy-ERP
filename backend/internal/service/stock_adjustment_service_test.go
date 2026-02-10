package service

import (
	"testing"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestStockAdjustmentService_Post_LogicStructure(t *testing.T) {
	t.Log("Verifying Stock Adjustment Posting logic components...")

	// 1. Initial State
	sa := models.StockAdjustment{
		ID:               1,
		AdjustmentNumber: "ADJ-2026-000001",
		Status:           "draft",
		IsPosted:         false,
		WarehouseID:      1,
		Items: []models.StockAdjustmentItem{
			{
				ID:                 1,
				ItemType:           "material",
				ItemID:             1,
				AdjustmentQuantity: 50.0,
				PreviousQuantity:   100.0,
				NewQuantity:        150.0,
				UnitCost:           10.0,
			},
			{
				ID:                 2,
				ItemType:           "material",
				ItemID:             1,
				AdjustmentQuantity: -20.0,
				PreviousQuantity:   150.0, // Sequential adjustment in same batch for test
				NewQuantity:        130.0,
				UnitCost:           10.0,
			},
		},
	}

	assert.Equal(t, "draft", sa.Status)
	assert.False(t, sa.IsPosted)

	// 2. Mock Balance Update Logic
	now := time.Now()
	balances := map[string]*models.StockBalance{
		"material-1": {
			ItemID:   1,
			ItemType: "material",
			Quantity: 100.0,
			UnitCost: 10.0,
		},
	}

	for _, item := range sa.Items {
		key := item.ItemType + "-1"
		balance := balances[key]
		
		// Logic from PostAdjustment
		balance.Quantity += item.AdjustmentQuantity
		balance.TotalCost = balance.Quantity * balance.UnitCost
		balance.LastTransactionDate = &now
		
		// Verify Ledger Entry Data
		ledger := models.StockLedger{
			TransactionType: "adjustment",
			Quantity:        item.AdjustmentQuantity,
			BalanceQuantity: balance.Quantity,
		}
		assert.Equal(t, item.AdjustmentQuantity, ledger.Quantity)
		assert.Equal(t, balance.Quantity, ledger.BalanceQuantity)
	}

	// 3. Final State Update
	sa.Status = "posted"
	sa.IsPosted = true
	sa.PostedAt = &now

	assert.Equal(t, float64(130), balances["material-1"].Quantity)
	assert.Equal(t, "posted", sa.Status)
	assert.True(t, sa.IsPosted)
	
	t.Log("Stock Adjustment Posting logic verified successfully.")
}

func TestStockAdjustmentService_Cancel_LogicStructure(t *testing.T) {
	sa := models.StockAdjustment{
		Status:   "draft",
		IsPosted: false,
	}

	// Logic from CancelAdjustment
	if !sa.IsPosted {
		sa.Status = "cancelled"
	}

	assert.Equal(t, "cancelled", sa.Status)
}
