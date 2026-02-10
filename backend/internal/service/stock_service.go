package service

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
)

type StockService interface {
	GetStockBalance(itemType string, itemID uint, warehouseID uint) ([]*models.StockBalance, error)
	GetGlobalStockBalance(filters map[string]interface{}) ([]*models.StockBalance, error)
}

type stockService struct {
	stockBalanceRepo repository.StockBalanceRepository
}

func NewStockService(stockBalanceRepo repository.StockBalanceRepository) StockService {
	return &stockService{stockBalanceRepo: stockBalanceRepo}
}

func (s *stockService) GetStockBalance(itemType string, itemID uint, warehouseID uint) ([]*models.StockBalance, error) {
	return s.stockBalanceRepo.List(itemType, itemID, warehouseID)
}

func (s *stockService) GetGlobalStockBalance(filters map[string]interface{}) ([]*models.StockBalance, error) {
	// For now, reuse the list but handle more filters if needed
	itemType, _ := filters["item_type"].(string)
	itemID, _ := filters["item_id"].(uint)
	warehouseID, _ := filters["warehouse_id"].(uint)
	
	return s.stockBalanceRepo.List(itemType, itemID, warehouseID)
}
