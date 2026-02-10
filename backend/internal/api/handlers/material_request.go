package handlers

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// MaterialRequestHandler handles HTTP requests for material requests
type MaterialRequestHandler struct {
	service service.MaterialRequestService
}

// NewMaterialRequestHandler creates a new MaterialRequestHandler
func NewMaterialRequestHandler(service service.MaterialRequestService) *MaterialRequestHandler {
	return &MaterialRequestHandler{service: service}
}

// List retrieves all material requests with filtering and pagination
func (h *MaterialRequestHandler) List(c *gin.Context) {
	var filter dto.MaterialRequestFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", err.Error()))
		return
	}

	mrs, total, err := h.service.ListMaterialRequests(&filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	pagination := utils.CalculatePagination(filter.Page, filter.PageSize, total)

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"data":       mrs,
		"pagination": pagination,
	})
}

// GetByID retrieves a material request by ID
func (h *MaterialRequestHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	mr, err := h.service.GetMaterialRequestByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(mr))
}

// Create creates a new material request with items
func (h *MaterialRequestHandler) Create(c *gin.Context) {
	var req dto.CreateMaterialRequestRequest
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

	mr, err := h.service.CreateMaterialRequest(&req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(mr))
}

// Update updates a material request
func (h *MaterialRequestHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	var req dto.UpdateMaterialRequestRequest
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

	mr, err := h.service.UpdateMaterialRequest(uint(id), &req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(mr))
}

// Delete deletes a material request
func (h *MaterialRequestHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	err = h.service.DeleteMaterialRequest(uint(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Material request deleted successfully", nil))
}

// Approve approves a material request
func (h *MaterialRequestHandler) Approve(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	// Get user ID from context
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User not authenticated"))
		return
	}
	userID := val.(int64)

	mr, err := h.service.ApproveMaterialRequest(uint(id), uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("APPROVE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(mr))
}

// Cancel cancels a material request
func (h *MaterialRequestHandler) Cancel(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	mr, err := h.service.CancelMaterialRequest(uint(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CANCEL_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(mr))
}
