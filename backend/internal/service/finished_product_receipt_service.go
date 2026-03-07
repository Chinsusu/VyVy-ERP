package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"gorm.io/gorm"
)

// FinishedProductReceiptService handles business logic for FPRN
type FinishedProductReceiptService interface {
	Create(fprn *models.FinishedProductReceipt) (*models.FinishedProductReceipt, error)
	GetByID(id uint) (*models.FinishedProductReceipt, error)
	List(filters map[string]interface{}, offset, limit int) ([]*models.FinishedProductReceipt, int64, error)
	Post(id uint, userID uint) error
	Cancel(id uint, userID uint) error
}

type fprnService struct {
	repo             repository.FinishedProductReceiptRepository
	stockLedgerRepo  repository.StockLedgerRepository
	stockBalanceRepo repository.StockBalanceRepository
	ppRepo           repository.ProductionPlanRepository
	db               *gorm.DB
}

func NewFinishedProductReceiptService(
	repo repository.FinishedProductReceiptRepository,
	stockLedgerRepo repository.StockLedgerRepository,
	stockBalanceRepo repository.StockBalanceRepository,
	ppRepo repository.ProductionPlanRepository,
	db *gorm.DB,
) FinishedProductReceiptService {
	return &fprnService{
		repo:             repo,
		stockLedgerRepo:  stockLedgerRepo,
		stockBalanceRepo: stockBalanceRepo,
		ppRepo:           ppRepo,
		db:               db,
	}
}

// generateFPRNNumber creates a unique FPRN number like FPRN-250307-001
func (s *fprnService) generateFPRNNumber() (string, error) {
	dateStr := time.Now().Format("060102")
	prefix := fmt.Sprintf("FPRN-%s", dateStr)
	count, err := s.repo.CountByFPRNNumber(prefix)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s-%03d", prefix, count+1), nil
}

func (s *fprnService) Create(fprn *models.FinishedProductReceipt) (*models.FinishedProductReceipt, error) {
	if fprn.WarehouseID == 0 {
		return nil, errors.New("warehouse_id is required")
	}
	if len(fprn.Items) == 0 {
		return nil, errors.New("at least one item is required")
	}

	number, err := s.generateFPRNNumber()
	if err != nil {
		return nil, err
	}
	fprn.FPRNNumber = number
	fprn.Status = "draft"
	fprn.Posted = false

	if err := s.repo.Create(fprn); err != nil {
		return nil, err
	}
	return s.repo.GetByID(fprn.ID)
}

func (s *fprnService) GetByID(id uint) (*models.FinishedProductReceipt, error) {
	return s.repo.GetByID(id)
}

func (s *fprnService) List(filters map[string]interface{}, offset, limit int) ([]*models.FinishedProductReceipt, int64, error) {
	return s.repo.List(filters, offset, limit)
}

// Post posts the FPRN: updates stock_ledger (item_type=finished_product, IN) and stock_balance
func (s *fprnService) Post(id uint, userID uint) error {
	fprn, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("FPRN not found")
	}
	if fprn.Status != "draft" {
		return errors.New("only draft FPRNs can be posted")
	}
	if fprn.Posted {
		return errors.New("FPRN is already posted")
	}

	now := time.Now()

	return s.db.Transaction(func(tx *gorm.DB) error {
		txLedger := repository.NewStockLedgerRepository(tx)
		txBalance := repository.NewStockBalanceRepository(tx)

		for _, item := range fprn.Items {
			if item.Quantity <= 0 {
				continue
			}

			// 1. Get latest balance for ledger continuity
			prevBalance, err := txLedger.GetLatestBalance(
				"finished_product",
				item.FinishedProductID,
				fprn.WarehouseID,
				item.WarehouseLocationID,
				item.BatchNumber,
				"", // lot_number not tracked at FPRN level
			)
			if err != nil {
				return fmt.Errorf("error getting balance for product %d: %w", item.FinishedProductID, err)
			}
			newBalance := prevBalance + item.Quantity

			// 2. Create Stock Ledger entry (IN transaction)
			ledgerEntry := &models.StockLedger{
				TransactionType:     "FPRN",
				TransactionNumber:   fprn.FPRNNumber,
				TransactionDate:     now,
				ItemType:            "finished_product",
				ItemID:              item.FinishedProductID,
				WarehouseID:         fprn.WarehouseID,
				WarehouseLocationID: item.WarehouseLocationID,
				BatchNumber:         item.BatchNumber,
				LotNumber:           "",
				Quantity:            item.Quantity,
				UnitCost:            item.UnitCost,
				TotalCost:           item.Quantity * item.UnitCost,
				BalanceQuantity:     newBalance,
				ReferenceType:       "FPRN",
				ReferenceID:         fprn.ID,
			}
			if item.ExpiryDate != nil {
				ledgerEntry.ExpiryDate = item.ExpiryDate
			}
			if err := txLedger.Create(ledgerEntry); err != nil {
				return fmt.Errorf("error creating ledger entry for product %d: %w", item.FinishedProductID, err)
			}

			// 3. Upsert Stock Balance (weighted average cost)
			existingBalance, _ := txBalance.Get(
				"finished_product",
				item.FinishedProductID,
				fprn.WarehouseID,
				item.WarehouseLocationID,
				item.BatchNumber,
				"",
			)

			newQty := item.Quantity
			newUnitCost := item.UnitCost
			newTotalCost := item.Quantity * item.UnitCost

			if existingBalance != nil && existingBalance.Quantity > 0 {
				newQty = existingBalance.Quantity + item.Quantity
				newTotalCost = existingBalance.TotalCost + item.Quantity*item.UnitCost
				if newQty > 0 {
					newUnitCost = newTotalCost / newQty
				}
			}

			lastTxDate := now
			balanceRow := &models.StockBalance{
				ItemType:            "finished_product",
				ItemID:              item.FinishedProductID,
				WarehouseID:         fprn.WarehouseID,
				WarehouseLocationID: item.WarehouseLocationID,
				BatchNumber:         item.BatchNumber,
				LotNumber:           "",
				Quantity:            newQty,
				ReservedQuantity:    0,
				UnitCost:            newUnitCost,
				TotalCost:           newTotalCost,
				LastTransactionDate: &lastTxDate,
			}
			if item.ManufactureDate != nil {
				balanceRow.ManufactureDate = item.ManufactureDate
			}
			if item.ExpiryDate != nil {
				balanceRow.ExpiryDate = item.ExpiryDate
			}
			if err := txBalance.Upsert(balanceRow); err != nil {
				return fmt.Errorf("error upserting stock balance for product %d: %w", item.FinishedProductID, err)
			}
		}

		// 4. Mark FPRN as posted
		if err := tx.Model(&models.FinishedProductReceipt{}).Where("id = ?", id).Updates(map[string]interface{}{
			"posted":    true,
			"posted_by": userID,
			"posted_at": now,
			"status":    "posted",
		}).Error; err != nil {
			return err
		}

		// 5. Auto-update linked KHSX procurement_status → 'completed'
		if fprn.ProductionPlanID != nil && *fprn.ProductionPlanID > 0 {
			if err := s.ppRepo.UpdateProcurementStatus(*fprn.ProductionPlanID, "completed"); err != nil {
				// Non-fatal: log but don't fail the transaction
				_ = err
			}
		}
		return nil
	})
}

func (s *fprnService) Cancel(id uint, userID uint) error {
	fprn, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("FPRN not found")
	}
	if fprn.Status != "draft" {
		return errors.New("only draft FPRNs can be cancelled")
	}
	return s.repo.UpdateStatus(id, "cancelled")
}
