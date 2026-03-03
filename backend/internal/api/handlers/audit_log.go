package handlers

import (
	"net/http"
	"strconv"

	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// AuditLogHandler handles audit log HTTP requests
type AuditLogHandler struct {
	service service.AuditLogService
}

// NewAuditLogHandler creates a new audit log handler
func NewAuditLogHandler(service service.AuditLogService) *AuditLogHandler {
	return &AuditLogHandler{service: service}
}

// GetHistory returns the audit trail for a specific record
// GET /api/v1/audit-logs?table=materials&record_id=1
func (h *AuditLogHandler) GetHistory(c *gin.Context) {
	tableName := c.Query("table")
	if tableName == "" {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", "table parameter is required"))
		return
	}

	recordIDStr := c.Query("record_id")
	if recordIDStr == "" {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", "record_id parameter is required"))
		return
	}

	recordID, err := strconv.ParseInt(recordIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_QUERY", "record_id must be a number"))
		return
	}

	logs, err := h.service.GetHistory(tableName, recordID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(logs))
}
