package handlers

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SupplierHandler handles supplier-related HTTP requests
type SupplierHandler struct {
	service service.SupplierService
}

// NewSupplierHandler creates a new supplier handler
func NewSupplierHandler(service service.SupplierService) *SupplierHandler {
	return &SupplierHandler{service: service}
}

// List retrieves suppliers with filters
// @route GET /api/v1/suppliers
func (h *SupplierHandler) List(c *gin.Context) {
	var filter dto.SupplierFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", err.Error()))
		return
	}

	suppliers, total, err := h.service.ListSuppliers(&filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	pagination := utils.CalculatePagination(filter.Page, filter.PageSize, total)

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"data":       suppliers,
		"pagination": pagination,
	})
}

// GetByID retrieves a supplier by ID
// @route GET /api/v1/suppliers/:id
func (h *SupplierHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid supplier ID"))
		return
	}

	supplier, err := h.service.GetSupplierByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(supplier))
}

// Create creates a new supplier
// @route POST /api/v1/suppliers
func (h *SupplierHandler) Create(c *gin.Context) {
	var req dto.CreateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_REQUEST", err.Error()))
		return
	}

	// Get user ID from context (set by auth middleware)
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User ID not found"))
		return
	}
	userID := val.(int64)

	supplier, err := h.service.CreateSupplier(&req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(supplier))
}

// Update updates a supplier
// @route PUT /api/v1/suppliers/:id
func (h *SupplierHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid supplier ID"))
		return
	}

	var req dto.UpdateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_REQUEST", err.Error()))
		return
	}

	// Get user ID from context
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User ID not found"))
		return
	}
	userID := val.(int64)

	supplier, err := h.service.UpdateSupplier(uint(id), &req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(supplier))
}

// Delete soft deletes a supplier
// @route DELETE /api/v1/suppliers/:id
func (h *SupplierHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid supplier ID"))
		return
	}

	if err := h.service.DeleteSupplier(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Supplier deleted successfully", nil))
}
