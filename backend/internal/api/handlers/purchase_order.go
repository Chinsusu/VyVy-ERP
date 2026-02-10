package handlers

import (
	"VyVy-ERP/internal/dto"
	"VyVy-ERP/internal/service"
	"VyVy-ERP/pkg/utils"
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
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid filter parameters")
		return
	}

	pos, total, err := h.service.ListPurchaseOrders(&filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Calculate pagination
	page := 1
	if filter.Page > 0 {
		page = filter.Page
	}
	pageSize := 10
	if filter.PageSize > 0 {
		pageSize = filter.PageSize
	}
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	pagination := utils.Pagination{
		Page:       page,
		PageSize:   pageSize,
		Total:      int(total),
		TotalPages: totalPages,
	}

	utils.SuccessResponseWithPagination(c, pos, pagination)
}

// GetByID retrieves a purchase order by ID
func (h *PurchaseOrderHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid purchase order ID")
		return
	}

	po, err := h.service.GetPurchaseOrderByID(uint(id))
	if err != nil {
		if err.Error() == "purchase order not found" {
			utils.ErrorResponse(c, http.StatusNotFound, err.Error())
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, po)
}

// Create creates a new purchase order with items
func (h *PurchaseOrderHandler) Create(c *gin.Context) {
	var req dto.CreatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	po, err := h.service.CreatePurchaseOrder(&req, userID.(uint))
	if err != nil {
		if err.Error() == "purchase order number already exists" ||
			err.Error() == "supplier not found" ||
			err.Error() == "warehouse not found" {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    po,
	})
}

// Update updates a purchase order (only if status is draft)
func (h *PurchaseOrderHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid purchase order ID")
		return
	}

	var req dto.UpdatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	po, err := h.service.UpdatePurchaseOrder(uint(id), &req, userID.(uint))
	if err != nil {
		if err.Error() == "purchase order not found" {
			utils.ErrorResponse(c, http.StatusNotFound, err.Error())
			return
		}
		if err.Error() == "can only update purchase orders in draft status" ||
			err.Error() == "purchase order number already exists" ||
			err.Error() == "supplier not found" ||
			err.Error() == "warehouse not found" {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, po)
}

// Delete deletes a purchase order (only if status is draft)
func (h *PurchaseOrderHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid purchase order ID")
		return
	}

	err = h.service.DeletePurchaseOrder(uint(id))
	if err != nil {
		if err.Error() == "purchase order not found" {
			utils.ErrorResponse(c, http.StatusNotFound, err.Error())
			return
		}
		if err.Error() == "can only delete purchase orders in draft status" {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Purchase order deleted successfully",
	})
}

// Approve approves a purchase order (draft → approved)
func (h *PurchaseOrderHandler) Approve(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid purchase order ID")
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	po, err := h.service.ApprovePurchaseOrder(uint(id), userID.(uint))
	if err != nil {
		if err.Error() == "purchase order not found" {
			utils.ErrorResponse(c, http.StatusNotFound, err.Error())
			return
		}
		if err.Error() == "can only approve purchase orders in draft status" {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, po)
}

// Cancel cancels a purchase order
func (h *PurchaseOrderHandler) Cancel(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid purchase order ID")
		return
	}

	po, err := h.service.CancelPurchaseOrder(uint(id))
	if err != nil {
		if err.Error() == "purchase order not found" {
			utils.ErrorResponse(c, http.StatusNotFound, err.Error())
			return
		}
		if err.Error() == "purchase order is already cancelled" {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, po)
}
