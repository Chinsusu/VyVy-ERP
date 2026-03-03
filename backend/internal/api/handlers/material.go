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
		"success":    true,
		"data":       materials,
		"pagination": pagination,
	})
}

// GetByID godoc
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
func (h *MaterialHandler) Create(c *gin.Context) {
	var req dto.CreateMaterialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_REQUEST", err.Error()))
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User ID not found"))
		return
	}
	username, _ := c.Get("username")
	usernameStr, _ := username.(string)

	material, err := h.service.CreateMaterial(req, userID.(int64), usernameStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(material))
}

// Update godoc
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

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User ID not found"))
		return
	}
	username, _ := c.Get("username")
	usernameStr, _ := username.(string)

	material, err := h.service.UpdateMaterial(id, req, userID.(int64), usernameStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(material))
}

// Delete godoc
func (h *MaterialHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material ID"))
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User ID not found"))
		return
	}
	username, _ := c.Get("username")
	usernameStr, _ := username.(string)

	if err := h.service.DeleteMaterial(id, userID.(int64), usernameStr); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Material deleted successfully", nil))
}
