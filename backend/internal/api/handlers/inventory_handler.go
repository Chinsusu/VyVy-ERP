package handlers

import (
	"net/http"
	"strconv"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/gin-gonic/gin"
)

type InventoryHandler struct {
	saService service.StockAdjustmentService
	stService service.StockTransferService
}

func NewInventoryHandler(saService service.StockAdjustmentService, stService service.StockTransferService) *InventoryHandler {
	return &InventoryHandler{
		saService: saService,
		stService: stService,
	}
}

// --- Stock Adjustments ---

func (h *InventoryHandler) CreateAdjustment(c *gin.Context) {
	var req dto.CreateStockAdjustmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := uint(c.MustGet("user_id").(int64))
	sa, err := h.saService.CreateAdjustment(&req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, sa)
}

func (h *InventoryHandler) GetAdjustment(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	sa, err := h.saService.GetAdjustmentByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Adjustment not found"})
		return
	}
	c.JSON(http.StatusOK, sa)
}

func (h *InventoryHandler) ListAdjustments(c *gin.Context) {
	var filter dto.StockAdjustmentFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if filter.Limit == 0 {
		filter.Limit = 10
	}

	sas, total, err := h.saService.ListAdjustments(&filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  sas,
		"total": total,
	})
}

func (h *InventoryHandler) PostAdjustment(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID := uint(c.MustGet("user_id").(int64))
	sa, err := h.saService.PostAdjustment(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sa)
}

func (h *InventoryHandler) CancelAdjustment(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID := uint(c.MustGet("user_id").(int64))
	sa, err := h.saService.CancelAdjustment(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sa)
}

// --- Stock Transfers ---

func (h *InventoryHandler) CreateTransfer(c *gin.Context) {
	var req dto.CreateStockTransferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := uint(c.MustGet("user_id").(int64))
	st, err := h.stService.CreateTransfer(&req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, st)
}

func (h *InventoryHandler) GetTransfer(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	st, err := h.stService.GetTransferByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transfer not found"})
		return
	}
	c.JSON(http.StatusOK, st)
}

func (h *InventoryHandler) ListTransfers(c *gin.Context) {
	var filter dto.StockTransferFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if filter.Limit == 0 {
		filter.Limit = 10
	}

	sts, total, err := h.stService.ListTransfers(&filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  sts,
		"total": total,
	})
}

func (h *InventoryHandler) PostTransfer(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID := uint(c.MustGet("user_id").(int64))
	st, err := h.stService.PostTransfer(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, st)
}

func (h *InventoryHandler) CancelTransfer(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID := uint(c.MustGet("user_id").(int64))
	st, err := h.stService.CancelTransfer(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, st)
}
