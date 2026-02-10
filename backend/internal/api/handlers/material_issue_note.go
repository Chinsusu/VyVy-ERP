package handlers

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type MaterialIssueNoteHandler struct {
	minService service.MaterialIssueNoteService
}

func NewMaterialIssueNoteHandler(minService service.MaterialIssueNoteService) *MaterialIssueNoteHandler {
	return &MaterialIssueNoteHandler{minService: minService}
}

func (h *MaterialIssueNoteHandler) Create(c *gin.Context) {
	var min models.MaterialIssueNote
	if err := c.ShouldBindJSON(&min); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_PAYLOAD", "Invalid request payload"))
		return
	}

	userID := c.GetUint("user_id")
	min.CreatedBy = &userID

	createdMIN, err := h.minService.Create(&min)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("CREATE_FAILED", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessMessageResponse("Material issue note created successfully", createdMIN.ToSafe()))
}

func (h *MaterialIssueNoteHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid ID format"))
		return
	}

	min, err := h.minService.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", "Material issue note not found"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(min.ToSafe()))
}

func (h *MaterialIssueNoteHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	filters := make(map[string]interface{})
	if minNumber := c.Query("min_number"); minNumber != "" {
		filters["min_number"] = minNumber
	}
	if warehouseID := c.Query("warehouse_id"); warehouseID != "" {
		id, _ := strconv.ParseUint(warehouseID, 10, 32)
		filters["warehouse_id"] = uint(id)
	}
	if mrID := c.Query("material_request_id"); mrID != "" {
		id, _ := strconv.ParseUint(mrID, 10, 32)
		filters["material_request_id"] = uint(id)
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}

	mins, total, err := h.minService.List(filters, offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("LIST_FAILED", err.Error()))
		return
	}

	safeMINs := make([]*models.SafeMaterialIssueNote, len(mins))
	for i, min := range mins {
		safeMINs[i] = min.ToSafe()
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(gin.H{
		"items": safeMINs,
		"total": total,
		"page":  page,
		"limit": limit,
	}))
}

func (h *MaterialIssueNoteHandler) Post(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid ID format"))
		return
	}

	userID := c.GetUint("user_id")
	if err := h.minService.Post(uint(id), userID); err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("POST_FAILED", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Material issue note posted successfully", nil))
}

func (h *MaterialIssueNoteHandler) Cancel(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid ID format"))
		return
	}

	userID := c.GetUint("user_id")
	if err := h.minService.Cancel(uint(id), userID); err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("CANCEL_FAILED", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Material issue note cancelled successfully", nil))
}
