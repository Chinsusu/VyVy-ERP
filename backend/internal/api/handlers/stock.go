package handlers

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type StockHandler struct {
	stockService service.StockService
}

func NewStockHandler(stockService service.StockService) *StockHandler {
	return &StockHandler{stockService: stockService}
}

func (h *StockHandler) GetBalance(c *gin.Context) {
	itemType := c.DefaultQuery("item_type", "material")
	
	itemIDStr := c.Query("item_id")
	var itemID uint
	if itemIDStr != "" {
		id, _ := strconv.ParseUint(itemIDStr, 10, 32)
		itemID = uint(id)
	}

	warehouseIDStr := c.Query("warehouse_id")
	var warehouseID uint
	if warehouseIDStr != "" {
		id, _ := strconv.ParseUint(warehouseIDStr, 10, 32)
		warehouseID = uint(id)
	}

	balances, err := h.stockService.GetStockBalance(itemType, itemID, warehouseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_FAILED", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(balances))
}
