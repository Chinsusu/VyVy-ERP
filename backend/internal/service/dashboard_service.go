package service

import (
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

type DashboardService interface {
	GetDashboardStats() (*dto.DashboardStats, error)
}

type dashboardService struct {
	db *gorm.DB
}

func NewDashboardService(db *gorm.DB) DashboardService {
	return &dashboardService{db: db}
}

func (s *dashboardService) GetDashboardStats() (*dto.DashboardStats, error) {
	var stats dto.DashboardStats
	stats.LastUpdatedAt = time.Now()

	// 1. Total POs
	s.db.Model(&models.PurchaseOrder{}).Count(&stats.TotalPurchaseOrders)

	// 2. Pending GRNs (requires_qc = true AND status = pending_qc) OR status = draft
	s.db.Model(&models.GoodsReceiptNote{}).Where("status IN ?", []string{"draft", "pending_qc"}).Count(&stats.PendingGRNs)

	// 3. Total Material Requests
	s.db.Model(&models.MaterialRequest{}).Count(&stats.TotalMaterialRequests)

	// 4. Total Delivery Orders
	s.db.Model(&models.DeliveryOrder{}).Count(&stats.TotalDeliveryOrders)

	// 5. Inventory Value
	var totalValue float64
	s.db.Model(&models.StockBalance{}).Select("COALESCE(SUM(quantity * unit_cost), 0)").Scan(&totalValue)
	stats.InventoryValue = totalValue

	// 6. Low Stock Count
	s.db.Table("materials").
		Joins("JOIN stock_balance ON materials.id = stock_balance.item_id AND stock_balance.item_type = 'material'").
		Where("stock_balance.quantity < materials.reorder_point").
		Count(&stats.LowStockCount)

	// 7. Expiring Soon Count (within 30 days)
	limitDate := time.Now().AddDate(0, 0, 30).Format("2006-01-02")
	s.db.Model(&models.StockBalance{}).
		Where("expiry_date IS NOT NULL AND expiry_date <= ?", limitDate).
		Count(&stats.ExpiringSoonCount)

	return &stats, nil
}

type ReportService interface {
	GetStockMovementReport(filters map[string]interface{}) ([]dto.StockMovementReportRow, error)
	GetInventoryValueReport(filters map[string]interface{}) ([]dto.InventoryValueReportRow, error)
}

type reportService struct {
	db *gorm.DB
}

func NewReportService(db *gorm.DB) ReportService {
	return &reportService{db: db}
}

func (s *reportService) GetStockMovementReport(filters map[string]interface{}) ([]dto.StockMovementReportRow, error) {
	var rows []dto.StockMovementReportRow

	// This is a simplified version. A real one would needs a complex query joining ledger and materials.
	// We'll aggregate from stock_ledger for the given period.
	
	query := s.db.Table("stock_ledger").
		Select(`
			materials.code as item_code,
			materials.trading_name as item_name,
			warehouses.name as warehouse_name,
			materials.unit as unit,
			SUM(CASE WHEN transaction_type = 'receipt' THEN quantity ELSE 0 END) as received_qty,
			SUM(CASE WHEN transaction_type = 'issue' THEN ABS(quantity) ELSE 0 END) as issued_qty,
			SUM(CASE WHEN transaction_type = 'adjustment' THEN quantity ELSE 0 END) as adjusted_qty,
			SUM(CASE WHEN transaction_type IN ('transfer_in', 'transfer_out') THEN quantity ELSE 0 END) as transferred_qty
		`).
		Joins("JOIN materials ON stock_ledger.item_id = materials.id AND stock_ledger.item_type = 'material'").
		Joins("JOIN warehouses ON stock_ledger.warehouse_id = warehouses.id").
		Group("materials.code, materials.trading_name, warehouses.name, materials.unit")

	if startDate, ok := filters["start_date"].(time.Time); ok {
		query = query.Where("stock_ledger.created_at >= ?", startDate)
	}
	if endDate, ok := filters["end_date"].(time.Time); ok {
		query = query.Where("stock_ledger.created_at <= ?", endDate)
	}

	err := query.Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	// Calculate Opening/Closing would require another subquery or separate logic.
	// For this Phase 7 MVP, we provide the movements.
	
	return rows, nil
}

func (s *reportService) GetInventoryValueReport(filters map[string]interface{}) ([]dto.InventoryValueReportRow, error) {
	var rows []dto.InventoryValueReportRow

	query := s.db.Table("stock_balance").
		Select(`
			materials.code as item_code,
			materials.trading_name as item_name,
			materials.category as category,
			warehouses.name as warehouse_name,
			stock_balance.quantity as quantity,
			stock_balance.unit_cost as unit_cost,
			(stock_balance.quantity * stock_balance.unit_cost) as total_value,
			materials.unit as unit
		`).
		Joins("JOIN materials ON stock_balance.item_id = materials.id AND stock_balance.item_type = 'material'").
		Joins("JOIN warehouses ON stock_balance.warehouse_id = warehouses.id")

	if warehouseID, ok := filters["warehouse_id"].(uint); ok && warehouseID > 0 {
		query = query.Where("stock_balance.warehouse_id = ?", warehouseID)
	}

	err := query.Scan(&rows).Error
	return rows, err
}
