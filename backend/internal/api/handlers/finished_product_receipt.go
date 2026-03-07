package handlers

import (
	"net/http"
	"strconv"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// FinishedProductReceiptHandler handles HTTP requests for FPRN
type FinishedProductReceiptHandler struct {
	fprnService service.FinishedProductReceiptService
}

func NewFinishedProductReceiptHandler(fprnService service.FinishedProductReceiptService) *FinishedProductReceiptHandler {
	return &FinishedProductReceiptHandler{fprnService: fprnService}
}

// Create handles POST /finished-product-receipts
func (h *FinishedProductReceiptHandler) Create(c *gin.Context) {
	var fprn models.FinishedProductReceipt
	if err := c.ShouldBindJSON(&fprn); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_PAYLOAD", "Invalid request payload"))
		return
	}

	val, _ := c.Get("user_id")
	userID := val.(int64)
	uID := uint(userID)
	fprn.CreatedBy = &uID

	created, err := h.fprnService.Create(&fprn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("CREATE_FAILED", err.Error()))
		return
	}
	c.JSON(http.StatusCreated, utils.SuccessMessageResponse("Finished product receipt created successfully", created))
}

// GetByID handles GET /finished-product-receipts/:id
func (h *FinishedProductReceiptHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid ID format"))
		return
	}
	fprn, err := h.fprnService.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", "Finished product receipt not found"))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse(fprn))
}

// List handles GET /finished-product-receipts
func (h *FinishedProductReceiptHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	filters := make(map[string]interface{})
	if search := c.Query("search"); search != "" {
		filters["search"] = search
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if warehouseID := c.Query("warehouse_id"); warehouseID != "" {
		id, _ := strconv.ParseUint(warehouseID, 10, 32)
		filters["warehouse_id"] = uint(id)
	}
	if planID := c.Query("production_plan_id"); planID != "" {
		id, _ := strconv.ParseUint(planID, 10, 32)
		filters["production_plan_id"] = uint(id)
	}

	fprns, total, err := h.fprnService.List(filters, offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("LIST_FAILED", err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.PaginatedResponse(fprns, total, page, limit))
}

// Post handles POST /finished-product-receipts/:id/post
func (h *FinishedProductReceiptHandler) Post(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid ID format"))
		return
	}
	val, _ := c.Get("user_id")
	userID := uint(val.(int64))

	if err := h.fprnService.Post(uint(id), userID); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("POST_FAILED", err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Finished product receipt posted successfully", nil))
}

// Cancel handles POST /finished-product-receipts/:id/cancel
func (h *FinishedProductReceiptHandler) Cancel(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid ID format"))
		return
	}
	val, _ := c.Get("user_id")
	userID := uint(val.(int64))

	if err := h.fprnService.Cancel(uint(id), userID); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CANCEL_FAILED", err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Finished product receipt cancelled", nil))
}
