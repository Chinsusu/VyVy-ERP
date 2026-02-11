package handlers

import (
	"net/http"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	dashboardService service.DashboardService
}

func NewDashboardHandler(dashboardService service.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardService: dashboardService}
}

func (h *DashboardHandler) GetStats(c *gin.Context) {
	stats, err := h.dashboardService.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("DASHBOARD_STATS_ERROR", "Failed to get dashboard stats: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(stats))
}

type ReportHandler struct {
	reportService service.ReportService
}

func NewReportHandler(reportService service.ReportService) *ReportHandler {
	return &ReportHandler{reportService: reportService}
}

func (h *ReportHandler) GetStockMovementReport(c *gin.Context) {
	filters := make(map[string]interface{})
	
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if t, err := time.Parse(time.RFC3339, startDateStr); err == nil {
			filters["start_date"] = t
		}
	}
	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if t, err := time.Parse(time.RFC3339, endDateStr); err == nil {
			filters["end_date"] = t
		}
	}

	rows, err := h.reportService.GetStockMovementReport(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("REPORT_ERROR", "Failed to generate stock movement report: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(rows))
}

func (h *ReportHandler) GetInventoryValueReport(c *gin.Context) {
	filters := make(map[string]interface{})
	
	rows, err := h.reportService.GetInventoryValueReport(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("REPORT_ERROR", "Failed to generate inventory value report: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(rows))
}
