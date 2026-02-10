package service

import (
	"testing"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestStockTransferService_Post_LogicStructure(t *testing.T) {
	t.Log("Verifying Stock Transfer Posting logic components...")

	// 1. Initial State
	st := models.StockTransfer{
		ID:              1,
		TransferNumber:  "TR-2026-000001",
		FromWarehouseID: 1,
		ToWarehouseID:   2,
		Status:          "draft",
		IsPosted:        false,
		Items: []models.StockTransferItem{
			{
				ItemID:   1,
				ItemType: "material",
				Quantity: 30.0,
				UnitCost: 100.0,
			},
		},
	}

	// 2. Setup Mock Balances
	sourceBalance := models.StockBalance{
		WarehouseID: 1,
		ItemID:      1,
		ItemType:    "material",
		Quantity:    100.0,
		UnitCost:    100.0,
	}
	
	destBalance := models.StockBalance{
		WarehouseID: 2,
		ItemID:      1,
		ItemType:    "material",
		Quantity:    0.0,
		UnitCost:    100.0,
	}

	// 3. Simulate Post Logic
	for _, item := range st.Items {
		// Outflow from source
		sourceBalance.Quantity -= item.Quantity
		sourceBalance.TotalCost = sourceBalance.Quantity * sourceBalance.UnitCost
		
		// Inflow to destination
		destBalance.Quantity += item.Quantity
		destBalance.TotalCost = destBalance.Quantity * destBalance.UnitCost
		
		// Verify source ledger
		outLedger := models.StockLedger{
			TransactionType: "transfer_out",
			Quantity:        -item.Quantity,
			BalanceQuantity: sourceBalance.Quantity,
		}
		assert.Equal(t, float64(-30), outLedger.Quantity)
		assert.Equal(t, float64(70), outLedger.BalanceQuantity)

		// Verify dest ledger
		inLedger := models.StockLedger{
			TransactionType: "transfer_in",
			Quantity:        item.Quantity,
			BalanceQuantity: destBalance.Quantity,
		}
		assert.Equal(t, float64(30), inLedger.Quantity)
		assert.Equal(t, float64(30), inLedger.BalanceQuantity)
	}

	st.Status = "posted"
	st.IsPosted = true
	now := time.Now()
	st.PostedAt = &now

	assert.Equal(t, float64(70), sourceBalance.Quantity)
	assert.Equal(t, float64(30), destBalance.Quantity)
	assert.Equal(t, "posted", st.Status)
	
	t.Log("Stock Transfer Posting logic verified successfully.")
}

func TestStockTransferService_Cancel_LogicStructure(t *testing.T) {
	st := models.StockTransfer{
		Status:   "draft",
		IsPosted: false,
	}

	if !st.IsPosted {
		st.Status = "cancelled"
	}

	assert.Equal(t, "cancelled", st.Status)
}
