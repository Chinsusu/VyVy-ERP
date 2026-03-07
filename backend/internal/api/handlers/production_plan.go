package handlers

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ProductionPlanHandler handles HTTP requests for material requests
type ProductionPlanHandler struct {
	service service.ProductionPlanService
}

// NewProductionPlanHandler creates a new ProductionPlanHandler
func NewProductionPlanHandler(service service.ProductionPlanService) *ProductionPlanHandler {
	return &ProductionPlanHandler{service: service}
}

// List retrieves all material requests with filtering and pagination
func (h *ProductionPlanHandler) List(c *gin.Context) {
	var filter dto.ProductionPlanFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", err.Error()))
		return
	}

	mrs, total, err := h.service.ListProductionPlans(&filter)
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
func (h *ProductionPlanHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	mr, err := h.service.GetProductionPlanByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(mr))
}

// Create creates a new material request with items
func (h *ProductionPlanHandler) Create(c *gin.Context) {
	var req dto.CreateProductionPlanRequest
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

	// Get username from context
	username := ""
	if u, ok := c.Get("username"); ok {
		username, _ = u.(string)
	}

	mr, err := h.service.CreateProductionPlan(&req, uint(userID), username)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(mr))
}

// Update updates a material request
func (h *ProductionPlanHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	var req dto.UpdateProductionPlanRequest
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

	// Get username from context
	username := ""
	if u, ok := c.Get("username"); ok {
		username, _ = u.(string)
	}

	mr, err := h.service.UpdateProductionPlan(uint(id), &req, uint(userID), username)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(mr))
}

// Delete deletes a material request
func (h *ProductionPlanHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	// Get user ID from context
	userID := int64(0)
	if val, exists := c.Get("user_id"); exists {
		userID = val.(int64)
	}
	username := ""
	if u, ok := c.Get("username"); ok {
		username, _ = u.(string)
	}

	err = h.service.DeleteProductionPlan(uint(id), uint(userID), username)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Material request deleted successfully", nil))
}

// Approve approves a material request
func (h *ProductionPlanHandler) Approve(c *gin.Context) {
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

	// Get username from context
	username := ""
	if u, ok := c.Get("username"); ok {
		username, _ = u.(string)
	}

	mr, err := h.service.ApproveProductionPlan(uint(id), uint(userID), username)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("APPROVE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(mr))
}

// Cancel cancels a material request
func (h *ProductionPlanHandler) Cancel(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	// Get user ID from context
	userID := int64(0)
	if val, exists := c.Get("user_id"); exists {
		userID = val.(int64)
	}
	username := ""
	if u, ok := c.Get("username"); ok {
		username, _ = u.(string)
	}

	mr, err := h.service.CancelProductionPlan(uint(id), uint(userID), username)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CANCEL_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(mr))
}

// GetRelatedPOs returns purchase orders auto-created from this material request
func (h *ProductionPlanHandler) GetRelatedPOs(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	pos, err := h.service.GetRelatedPurchaseOrders(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(pos))
}

// GetRelatedFPRNs returns finished product receipts linked to this production plan
func (h *ProductionPlanHandler) GetRelatedFPRNs(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid production plan ID"))
		return
	}

	fprns, err := h.service.GetRelatedFPRNs(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(fprns))
}
