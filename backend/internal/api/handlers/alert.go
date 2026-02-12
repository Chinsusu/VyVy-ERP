package handlers

import (
	"net/http"
	"strconv"

	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

type AlertHandler struct {
	alertService service.AlertService
}

func NewAlertHandler(alertService service.AlertService) *AlertHandler {
	return &AlertHandler{alertService: alertService}
}

// GetAlertSummary returns combined low stock + expiring soon alerts
func (h *AlertHandler) GetAlertSummary(c *gin.Context) {
	summary, err := h.alertService.GetAlertSummary()
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("ALERT_ERROR", "Failed to get alerts: "+err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse(summary))
}

// GetLowStockAlerts returns items below reorder point
func (h *AlertHandler) GetLowStockAlerts(c *gin.Context) {
	items, err := h.alertService.GetLowStockAlerts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("ALERT_ERROR", "Failed to get low stock alerts: "+err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse(items))
}

// GetExpiringSoonAlerts returns items expiring within N days
func (h *AlertHandler) GetExpiringSoonAlerts(c *gin.Context) {
	days := 30
	if d := c.Query("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 {
			days = parsed
		}
	}

	items, err := h.alertService.GetExpiringSoonAlerts(days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("ALERT_ERROR", "Failed to get expiring soon alerts: "+err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse(items))
}
