package handlers

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// WarehouseHandler handles warehouse-related HTTP requests
type WarehouseHandler struct {
	service service.WarehouseService
}

// NewWarehouseHandler creates a new warehouse handler
func NewWarehouseHandler(service service.WarehouseService) *WarehouseHandler {
	return &WarehouseHandler{service: service}
}

// List retrieves warehouses with filters
// @route GET /api/v1/warehouses
func (h *WarehouseHandler) List(c *gin.Context) {
	var filter dto.WarehouseFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", err.Error()))
		return
	}

	warehouses, total, err := h.service.ListWarehouses(&filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	pagination := utils.CalculatePagination(filter.Page, filter.PageSize, total)

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"data":       warehouses,
		"pagination": pagination,
	})
}

// GetByID retrieves a warehouse by ID
// @route GET /api/v1/warehouses/:id
func (h *WarehouseHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid warehouse ID"))
		return
	}

	warehouse, err := h.service.GetWarehouseByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(warehouse))
}

// GetLocations retrieves all locations for a warehouse
// @route GET /api/v1/warehouses/:id/locations
func (h *WarehouseHandler) GetLocations(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid warehouse ID"))
		return
	}

	locations, err := h.service.GetWarehouseLocations(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(locations))
}

// Create creates a new warehouse
// @route POST /api/v1/warehouses
func (h *WarehouseHandler) Create(c *gin.Context) {
	var req dto.CreateWarehouseRequest
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

	warehouse, err := h.service.CreateWarehouse(&req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(warehouse))
}

// Update updates a warehouse
// @route PUT /api/v1/warehouses/:id
func (h *WarehouseHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid warehouse ID"))
		return
	}

	var req dto.UpdateWarehouseRequest
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

	warehouse, err := h.service.UpdateWarehouse(uint(id), &req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(warehouse))
}

// Delete soft deletes a warehouse
// @route DELETE /api/v1/warehouses/:id
func (h *WarehouseHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid warehouse ID"))
		return
	}

	if err := h.service.DeleteWarehouse(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Warehouse deleted successfully", nil))
}
