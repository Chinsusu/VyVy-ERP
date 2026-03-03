package handlers

import (
	"net/http"
	"strconv"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type FinishedProductHandler struct {
	service service.FinishedProductService
}

func NewFinishedProductHandler(service service.FinishedProductService) *FinishedProductHandler {
	return &FinishedProductHandler{service: service}
}

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

	pagination := utils.CalculatePagination(filter.Page, filter.PageSize, total)

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"data":       products,
		"pagination": pagination,
	})
}

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

func (h *FinishedProductHandler) Create(c *gin.Context) {
	var req dto.CreateFinishedProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_REQUEST", err.Error()))
		return
	}

	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User ID not found"))
		return
	}
	userID := val.(int64)
	username, _ := c.Get("username")
	usernameStr, _ := username.(string)

	product, err := h.service.CreateFinishedProduct(&req, uint(userID), usernameStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(product))
}

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

	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User ID not found"))
		return
	}
	userID := val.(int64)
	username, _ := c.Get("username")
	usernameStr, _ := username.(string)

	product, err := h.service.UpdateFinishedProduct(uint(id), &req, uint(userID), usernameStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(product))
}

func (h *FinishedProductHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid finished product ID"))
		return
	}

	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("UNAUTHORIZED", "User ID not found"))
		return
	}
	userID := val.(int64)
	username, _ := c.Get("username")
	usernameStr, _ := username.(string)

	if err := h.service.DeleteFinishedProduct(uint(id), userID, usernameStr); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(gin.H{"message": "Finished product deleted successfully"}))
}
