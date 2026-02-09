package handlers

import (
	"erp-warehouse/internal/dto"
	"erp-warehouse/internal/service"
	"erp-warehouse/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// WarehouseLocationHandler handles warehouse location-related HTTP requests
type WarehouseLocationHandler struct {
	service service.WarehouseLocationService
}

// NewWarehouseLocationHandler creates a new warehouse location handler
func NewWarehouseLocationHandler(service service.WarehouseLocationService) *WarehouseLocationHandler {
	return &WarehouseLocationHandler{service: service}
}

// List retrieves warehouse locations with filters
// @route GET /api/v1/warehouse-locations
func (h *WarehouseLocationHandler) List(c *gin.Context) {
	var filter dto.WarehouseLocationFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", err.Error()))
		return
	}

	locations, total, err := h.service.ListLocations(&filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	// Build pagination
	page := 1
	if filter.Page > 0 {
		page = filter.Page
	}
	pageSize := 20
	if filter.PageSize > 0 {
		pageSize = filter.PageSize
	}

	pagination := utils.Pagination{
		Page:       page,
		PageSize:   pageSize,
		Total:      total,
		TotalPages: (int(total) + pageSize - 1) / pageSize,
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"data":       locations,
		"pagination": pagination,
	})
}

// GetByID retrieves a warehouse location by ID
// @route GET /api/v1/warehouse-locations/:id
func (h *WarehouseLocationHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid location ID"))
		return
	}

	location, err := h.service.GetLocationByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(location))
}

// Create creates a new warehouse location
// @route POST /api/v1/warehouse-locations
func (h *WarehouseLocationHandler) Create(c *gin.Context) {
	var req dto.CreateWarehouseLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_REQUEST", err.Error()))
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User ID not found"))
		return
	}

	location, err := h.service.CreateLocation(&req, userID.(uint))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(location))
}

// Update updates a warehouse location
// @route PUT /api/v1/warehouse-locations/:id
func (h *WarehouseLocationHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid location ID"))
		return
	}

	var req dto.UpdateWarehouseLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_REQUEST", err.Error()))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User ID not found"))
		return
	}

	location, err := h.service.UpdateLocation(uint(id), &req, userID.(uint))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(location))
}

// Delete soft deletes a warehouse location
// @route DELETE /api/v1/warehouse-locations/:id
func (h *WarehouseLocationHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid location ID"))
		return
	}

	if err := h.service.DeleteLocation(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Location deleted successfully", nil))
}
