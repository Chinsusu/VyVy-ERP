package handlers

import (
	"net/http"
	"strconv"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// MaterialHandler handles material-related HTTP requests
type MaterialHandler struct {
	service service.MaterialService
}

// NewMaterialHandler creates a new material handler
func NewMaterialHandler(service service.MaterialService) *MaterialHandler {
	return &MaterialHandler{service: service}
}

// List godoc
// @Summary List materials
// @Description Get a list of materials with filters and pagination
// @Tags materials
// @Accept json
// @Produce json
// @Param search query string false "Search by code, name, or INCI name"
// @Param material_type query string false "Filter by material type"
// @Param category query string false "Filter by category"
// @Param supplier_id query int false "Filter by supplier ID"
// @Param requires_qc query bool false "Filter by QC requirement"
// @Param hazardous query bool false "Filter by hazardous flag"
// @Param is_active query bool false "Filter by active status"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Items per page" default(20)
// @Param sort_by query string false "Sort field" default(created_at)
// @Param sort_order query string false "Sort order (asc/desc)" default(desc)
// @Success 200 {object} utils.APIResponse
// @Router /api/v1/materials [get]
func (h *MaterialHandler) List(c *gin.Context) {
	var filter dto.MaterialFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", err.Error()))
		return
	}

	materials, total, err := h.service.ListMaterials(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	page := filter.Page
	if page == 0 {
		page = 1
	}
	pageSize := filter.PageSize
	if pageSize == 0 {
		pageSize = 20
	}

	pagination := utils.Pagination{
		Page:       page,
		Limit:      pageSize,
		TotalItems: total,
		TotalPages: int((total + int64(pageSize) - 1) / int64(pageSize)),
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    materials,
		"pagination": pagination,
	})
}

// GetByID godoc
// @Summary Get material by ID
// @Description Get a single material by ID
// @Tags materials
// @Accept json
// @Produce json
// @Param id path int true "Material ID"
// @Success 200 {object} utils.APIResponse
// @Failure 404 {object} utils.APIResponse
// @Router /api/v1/materials/{id} [get]
func (h *MaterialHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material ID"))
		return
	}

	material, err := h.service.GetMaterialByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(material))
}

// Create godoc
// @Summary Create material
// @Description Create a new material (requires authentication)
// @Tags materials
// @Accept json
// @Produce json
// @Param material body dto.CreateMaterialRequest true "Material data"
// @Success 201 {object} utils.APIResponse
// @Failure 400 {object} utils.APIResponse
// @Failure 401 {object} utils.APIResponse
// @Router /api/v1/materials [post]
// @Security BearerAuth
func (h *MaterialHandler) Create(c *gin.Context) {
	var req dto.CreateMaterialRequest
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

	material, err := h.service.CreateMaterial(req, userID.(int64))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(material))
}

// Update godoc
// @Summary Update material
// @Description Update an existing material (requires authentication)
// @Tags materials
// @Accept json
// @Produce json
// @Param id path int true "Material ID"
// @Param material body dto.UpdateMaterialRequest true "Material data"
// @Success 200 {object} utils.APIResponse
// @Failure 400 {object} utils.APIResponse
// @Failure 401 {object} utils.APIResponse
// @Failure 404 {object} utils.APIResponse
// @Router /api/v1/materials/{id} [put]
// @Security BearerAuth
func (h *MaterialHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material ID"))
		return
	}

	var req dto.UpdateMaterialRequest
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

	material, err := h.service.UpdateMaterial(id, req, userID.(int64))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(material))
}

// Delete godoc
// @Summary Delete material
// @Description Soft delete a material (requires authentication)
// @Tags materials
// @Accept json
// @Produce json
// @Param id path int true "Material ID"
// @Success 200 {object} utils.APIResponse
// @Failure 400 {object} utils.APIResponse
// @Failure 401 {object} utils.APIResponse
// @Failure 404 {object} utils.APIResponse
// @Router /api/v1/materials/{id} [delete]
// @Security BearerAuth
func (h *MaterialHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material ID"))
		return
	}

	if err := h.service.DeleteMaterial(id); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Material deleted successfully", nil))
}
