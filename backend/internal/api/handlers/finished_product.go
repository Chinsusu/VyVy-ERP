package handlers

import (
	"net/http"
	"strconv"

	"erp-warehouse/internal/dto"
	"erp-warehouse/internal/service"
	"erp-warehouse/internal/utils"

	"github.com/gin-gonic/gin"
)

type FinishedProductHandler struct {
	service service.FinishedProductService
}

func NewFinishedProductHandler(service service.FinishedProductService) *FinishedProductHandler {
	return &FinishedProductHandler{service: service}
}

// List godoc
// @Summary List finished products
// @Description Get a list of finished products with optional filters
// @Tags finished-products
// @Accept json
// @Produce json
// @Param search query string false "Search by code, name, or barcode"
// @Param category query string false "Filter by category"
// @Param sub_category query string false "Filter by sub-category"
// @Param is_active query boolean false "Filter by active status"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Param sort_by query string false "Sort by field"
// @Param sort_order query string false "Sort order (asc/desc)"
// @Success 200 {object} utils.Response
// @Router /api/v1/finished-products [get]
func (h *FinishedProductHandler) List(c *gin.Context) {
	var filter dto.FinishedProductFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", err.Error()))
		return
	}

	products, total, err := h.service.ListFinishedProducts(&filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("LIST_ERROR", err.Error()))
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
		"data":       products,
		"pagination": pagination,
	})
}

// GetByID godoc
// @Summary Get finished product by ID
// @Description Get a single finished product by ID
// @Tags finished-products
// @Accept json
// @Produce json
// @Param id path int true "Finished Product ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/finished-products/:id [get]
func (h *FinishedProductHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid finished product ID"))
		return
	}

	product, err := h.service.GetFinishedProductByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(product))
}

// Create godoc
// @Summary Create finished product
// @Description Create a new finished product
// @Tags finished-products
// @Accept json
// @Produce json
// @Param product body dto.CreateFinishedProductRequest true "Finished Product data"
// @Success 201 {object} utils.Response
// @Router /api/v1/finished-products [post]
func (h *FinishedProductHandler) Create(c *gin.Context) {
	var req dto.CreateFinishedProductRequest
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

	product, err := h.service.CreateFinishedProduct(&req, userID.(uint))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(product))
}

// Update godoc
// @Summary Update finished product
// @Description Update an existing finished product
// @Tags finished-products
// @Accept json
// @Produce json
// @Param id path int true "Finished Product ID"
// @Param product body dto.UpdateFinishedProductRequest true "Finished Product data"
// @Success 200 {object} utils.Response
// @Router /api/v1/finished-products/:id [put]
func (h *FinishedProductHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid finished product ID"))
		return
	}

	var req dto.UpdateFinishedProductRequest
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

	product, err := h.service.UpdateFinishedProduct(uint(id), &req, userID.(uint))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(product))
}

// Delete godoc
// @Summary Delete finished product
// @Description Delete a finished product
// @Tags finished-products
// @Accept json
// @Produce json
// @Param id path int true "Finished Product ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/finished-products/:id [delete]
func (h *FinishedProductHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid finished product ID"))
		return
	}

	if err := h.service.DeleteFinishedProduct(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(gin.H{"message": "Finished product deleted successfully"}))
}
