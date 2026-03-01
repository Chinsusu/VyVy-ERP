package handlers

import (
	"net/http"
	"strconv"

	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

type ProductFormulaHandler struct {
	service service.ProductFormulaService
}

func NewProductFormulaHandler(svc service.ProductFormulaService) *ProductFormulaHandler {
	return &ProductFormulaHandler{service: svc}
}

// ListByProduct returns all formulas for a finished product
func (h *ProductFormulaHandler) ListByProduct(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid product ID"))
		return
	}

	formulas, err := h.service.GetFormulasByProductID(uint(productID))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(formulas))
}

// GetByID returns a single formula
func (h *ProductFormulaHandler) GetByID(c *gin.Context) {
	formulaID, err := strconv.ParseUint(c.Param("fid"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid formula ID"))
		return
	}

	formula, err := h.service.GetFormulaByID(uint(formulaID))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(formula))
}

// Create creates a new formula for a product
func (h *ProductFormulaHandler) Create(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid product ID"))
		return
	}

	var req service.CreateFormulaRequest
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

	formula, err := h.service.CreateFormula(uint(productID), &req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(formula))
}

// Update updates an existing formula
func (h *ProductFormulaHandler) Update(c *gin.Context) {
	formulaID, err := strconv.ParseUint(c.Param("fid"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid formula ID"))
		return
	}

	var req service.UpdateFormulaRequest
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

	formula, err := h.service.UpdateFormula(uint(formulaID), &req, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(formula))
}

// Delete deletes a formula
func (h *ProductFormulaHandler) Delete(c *gin.Context) {
	formulaID, err := strconv.ParseUint(c.Param("fid"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid formula ID"))
		return
	}

	if err := h.service.DeleteFormula(uint(formulaID)); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(gin.H{"message": "Formula deleted successfully"}))
}
