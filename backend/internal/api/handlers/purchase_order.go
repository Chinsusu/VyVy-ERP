package handlers

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// PurchaseOrderHandler handles HTTP requests for purchase orders
type PurchaseOrderHandler struct {
	service service.PurchaseOrderService
}

// NewPurchaseOrderHandler creates a new PurchaseOrderHandler
func NewPurchaseOrderHandler(service service.PurchaseOrderService) *PurchaseOrderHandler {
	return &PurchaseOrderHandler{service: service}
}

// List retrieves all purchase orders with filtering and pagination
func (h *PurchaseOrderHandler) List(c *gin.Context) {
	var filter dto.PurchaseOrderFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", err.Error()))
		return
	}

	pos, total, err := h.service.ListPurchaseOrders(&filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	pagination := utils.CalculatePagination(filter.Page, filter.PageSize, total)

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"data":       pos,
		"pagination": pagination,
	})
}

// GetByID retrieves a purchase order by ID
func (h *PurchaseOrderHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid purchase order ID"))
		return
	}

	po, err := h.service.GetPurchaseOrderByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(po))
}

// Create creates a new purchase order with items
func (h *PurchaseOrderHandler) Create(c *gin.Context) {
	var req dto.CreatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_REQUEST", err.Error()))
		return
	}

	// Get user ID from context
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User not authenticated"))
		return
	}
	userID := val.(int64)

	po, err := h.service.CreatePurchaseOrder(&req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(po))
}

// Update updates a purchase order (only if status is draft)
func (h *PurchaseOrderHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid purchase order ID"))
		return
	}

	var req dto.UpdatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_REQUEST", err.Error()))
		return
	}

	// Get user ID from context
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User not authenticated"))
		return
	}
	userID := val.(int64)

	po, err := h.service.UpdatePurchaseOrder(uint(id), &req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(po))
}

// Delete deletes a purchase order (only if status is draft)
func (h *PurchaseOrderHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid purchase order ID"))
		return
	}

	err = h.service.DeletePurchaseOrder(uint(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Purchase order deleted successfully", nil))
}

// Approve approves a purchase order (draft → approved)
func (h *PurchaseOrderHandler) Approve(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid purchase order ID"))
		return
	}

	// Get user ID from context
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User not authenticated"))
		return
	}
	userID := val.(int64)

	po, err := h.service.ApprovePurchaseOrder(uint(id), uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("APPROVE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(po))
}

// Cancel cancels a purchase order
func (h *PurchaseOrderHandler) Cancel(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid purchase order ID"))
		return
	}

	po, err := h.service.CancelPurchaseOrder(uint(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CANCEL_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(po))
}
