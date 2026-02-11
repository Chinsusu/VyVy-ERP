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

	if c.Query("export") == "csv" {
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", "attachment;filename=stock_movement_report.csv")
		csv := "Item Code,Item Name,Warehouse,Unit,Received,Issued,Adjusted,Transferred\n"
		for _, r := range rows {
			csv += r.ItemCode + "," + r.ItemName + "," + r.WarehouseName + "," + r.Unit + "," + utils.FloatToString(r.ReceivedQty) + "," + utils.FloatToString(r.IssuedQty) + "," + utils.FloatToString(r.AdjustedQty) + "," + utils.FloatToString(r.TransferredQty) + "\n"
		}
		c.String(http.StatusOK, csv)
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(rows))
}

func (h *ReportHandler) GetInventoryValueReport(c *gin.Context) {
	filters := make(map[string]interface{})
	if warehouseID := c.Query("warehouse_id"); warehouseID != "" {
		filters["warehouse_id"] = utils.StringToUint(warehouseID)
	}

	rows, err := h.reportService.GetInventoryValueReport(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("REPORT_ERROR", "Failed to generate inventory value report: "+err.Error()))
		return
	}

	if c.Query("export") == "csv" {
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", "attachment;filename=inventory_value_report.csv")
		// Simple CSV generation logic (production would use a proper encoder)
		csv := "Item Code,Item Name,Category,Warehouse,Quantity,Unit,Unit Cost,Total Value\n"
		for _, r := range rows {
			csv += r.ItemCode + "," + r.ItemName + "," + r.Category + "," + r.WarehouseName + "," + utils.FloatToString(r.Quantity) + "," + r.Unit + "," + utils.FloatToString(r.UnitCost) + "," + utils.FloatToString(r.TotalValue) + "\n"
		}
		c.String(http.StatusOK, csv)
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(rows))
}

func (h *ReportHandler) GetLowStockReport(c *gin.Context) {
	filters := make(map[string]interface{})
	if warehouseID := c.Query("warehouse_id"); warehouseID != "" {
		filters["warehouse_id"] = utils.StringToUint(warehouseID)
	}

	rows, err := h.reportService.GetLowStockReport(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("REPORT_ERROR", "Failed to generate low stock report: "+err.Error()))
		return
	}

	if c.Query("export") == "csv" {
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", "attachment;filename=low_stock_report.csv")
		csv := "Item Code,Item Name,Warehouse,Quantity,Reorder Point,Unit\n"
		for _, r := range rows {
			csv += r.ItemCode + "," + r.ItemName + "," + r.WarehouseName + "," + utils.FloatToString(r.Quantity) + "," + utils.FloatToString(r.ReorderPoint) + "," + r.Unit + "\n"
		}
		c.String(http.StatusOK, csv)
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(rows))
}

func (h *ReportHandler) GetExpiringSoonReport(c *gin.Context) {
	filters := make(map[string]interface{})
	if warehouseID := c.Query("warehouse_id"); warehouseID != "" {
		filters["warehouse_id"] = utils.StringToUint(warehouseID)
	}
	filters["days"] = 30 // Default

	rows, err := h.reportService.GetExpiringSoonReport(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("REPORT_ERROR", "Failed to generate expiring soon report: "+err.Error()))
		return
	}

	if c.Query("export") == "csv" {
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", "attachment;filename=expiring_soon_report.csv")
		csv := "Item Code,Item Name,Warehouse,Batch,Quantity,Expiry Date,Days to Expiry,Unit\n"
		for _, r := range rows {
			csv += r.ItemCode + "," + r.ItemName + "," + r.WarehouseName + "," + r.BatchNumber + "," + utils.FloatToString(r.Quantity) + "," + r.ExpiryDate.Format("2006-01-02") + "," + utils.IntToString(r.DaysToExpiry) + "," + r.Unit + "\n"
		}
		c.String(http.StatusOK, csv)
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(rows))
}
