package handlers

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GRNHandler handles HTTP requests for Goods Receipt Notes
type GRNHandler struct {
	service service.GRNService
}

// NewGRNHandler creates a new GRNHandler
func NewGRNHandler(service service.GRNService) *GRNHandler {
	return &GRNHandler{service: service}
}

// List retrieves all GRNs with filtering and pagination
func (h *GRNHandler) List(c *gin.Context) {
	var filter dto.GRNFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", err.Error()))
		return
	}

	grns, total, err := h.service.ListGRNs(&filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	pagination := utils.CalculatePagination(filter.Page, filter.PageSize, total)

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"data":       grns,
		"pagination": pagination,
	})
}

// GetByID retrieves a GRN by ID
func (h *GRNHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid GRN ID"))
		return
	}

	grn, err := h.service.GetGRNByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(grn))
}

// Create creates a new GRN from a PO
func (h *GRNHandler) Create(c *gin.Context) {
	var req dto.CreateGRNRequest
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

	grn, err := h.service.CreateGRN(&req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(grn))
}

// UpdateQC updates the QC status and quantities for a GRN
func (h *GRNHandler) UpdateQC(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid GRN ID"))
		return
	}

	var req dto.UpdateGRNQCRequest
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

	grn, err := h.service.UpdateQC(uint(id), &req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(grn))
}

// Post finalizes the GRN and updates inventory
func (h *GRNHandler) Post(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid GRN ID"))
		return
	}

	// Get user ID from context
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User not authenticated"))
		return
	}
	userID := val.(int64)

	grn, err := h.service.PostGRN(uint(id), uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("POST_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(grn))
}
