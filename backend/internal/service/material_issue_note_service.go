package service

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type MaterialIssueNoteService interface {
	Create(min *models.MaterialIssueNote) (*models.MaterialIssueNote, error)
	GetByID(id uint) (*models.MaterialIssueNote, error)
	List(filters map[string]interface{}, offset, limit int) ([]*models.MaterialIssueNote, int64, error)
	Post(id uint, userID uint) error
	Cancel(id uint, userID uint) error
}

type materialIssueNoteService struct {
	minRepo    repository.MaterialIssueNoteRepository
	mrRepo     repository.MaterialRequestRepository
	materialRepo repository.MaterialRepository
	stockRepo  repository.StockBalanceRepository
	reservationRepo repository.StockReservationRepository
	db         *gorm.DB
}

func NewMaterialIssueNoteService(
	minRepo repository.MaterialIssueNoteRepository,
	mrRepo repository.MaterialRequestRepository,
	materialRepo repository.MaterialRepository,
	stockRepo repository.StockBalanceRepository,
	reservationRepo repository.StockReservationRepository,
	db *gorm.DB,
) MaterialIssueNoteService {
	return &materialIssueNoteService{
		minRepo:      minRepo,
		mrRepo:       mrRepo,
		materialRepo: materialRepo,
		stockRepo:    stockRepo,
		reservationRepo: reservationRepo,
		db:           db,
	}
}

func (s *materialIssueNoteService) Create(min *models.MaterialIssueNote) (*models.MaterialIssueNote, error) {
	// 1. Validate MR status
	mr, err := s.mrRepo.GetByID(min.MaterialRequestID)
	if err != nil {
		return nil, errors.New("material request not found")
	}
	if mr.Status != "approved" && mr.Status != "picking" {
		return nil, errors.New("material request must be approved to issue")
	}

	// 2. Generate MIN number: MIN-YYYY-XXXXXX
	year := time.Now().Format("2006")
	var count int64
	s.db.Model(&models.MaterialIssueNote{}).Where("min_number LIKE ?", "MIN-"+year+"-%").Count(&count)
	min.MINNumber = fmt.Sprintf("MIN-%s-%06d", year, count+1)
	min.Status = "draft"
	min.IsPosted = false

	// 3. Save MIN
	if err := s.minRepo.Create(min); err != nil {
		return nil, err
	}

	// 4. Update MR status to picking if it was approved
	if mr.Status == "approved" {
		mr.Status = "picking"
		s.mrRepo.Update(mr)
	}

	return min, nil
}

func (s *materialIssueNoteService) GetByID(id uint) (*models.MaterialIssueNote, error) {
	return s.minRepo.GetByID(id)
}

func (s *materialIssueNoteService) List(filters map[string]interface{}, offset, limit int) ([]*models.MaterialIssueNote, int64, error) {
	return s.minRepo.List(filters, offset, limit)
}

func (s *materialIssueNoteService) Post(id uint, userID uint) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Get MIN with items
		var min models.MaterialIssueNote
		if err := tx.Preload("Items").Preload("MaterialRequest.Items").First(&min, id).Error; err != nil {
			return errors.New("material issue note not found")
		}

		if min.IsPosted {
			return errors.New("material issue note is already posted")
		}

		// 2. Process each item
		now := time.Now()
		for _, item := range min.Items {
			// a. Get stock balance
			var balance models.StockBalance
			query := tx.Where("item_type = ? AND item_id = ? AND warehouse_id = ?", "material", item.MaterialID, min.WarehouseID)
			
			if item.WarehouseLocationID != nil {
				query = query.Where("warehouse_location_id = ?", *item.WarehouseLocationID)
			} else {
				query = query.Where("warehouse_location_id IS NULL")
			}
			
			if item.BatchNumber != "" {
				query = query.Where("batch_number = ?", item.BatchNumber)
			} else {
				query = query.Where("(batch_number = '' OR batch_number IS NULL)")
			}

			if err := query.First(&balance).Error; err != nil {
				return fmt.Errorf("stock balance not found for material %d in specified batch/location", item.MaterialID)
			}

			if balance.Quantity < item.Quantity {
				return fmt.Errorf("insufficient physical stock for material %d (quantity: %f, required: %f)", item.MaterialID, balance.Quantity, item.Quantity)
			}

			// b. Find matching reservation for this MR
			var reservation models.StockReservation
			resQuery := tx.Where("reference_type = ? AND reference_id = ? AND item_id = ? AND item_type = ?", "material_request", min.MaterialRequestID, item.MaterialID, "material").
				Where("status = 'active'")

			if item.WarehouseLocationID != nil {
				resQuery = resQuery.Where("warehouse_location_id = ?", *item.WarehouseLocationID)
			} else {
				resQuery = resQuery.Where("warehouse_location_id IS NULL")
			}
			
			if item.BatchNumber != "" {
				resQuery = resQuery.Where("batch_number = ?", item.BatchNumber)
			} else {
				resQuery = resQuery.Where("(batch_number = '' OR batch_number IS NULL)")
			}

			err := resQuery.First(&reservation).Error

			hasReservation := err == nil
			
			// c. Calculate new balance for ledger entry
			var prevBalance float64
			row := tx.Table("stock_ledger").
				Select("balance_quantity").
				Where("item_type = ? AND item_id = ? AND warehouse_id = ?", "material", item.MaterialID, min.WarehouseID).
				Order("created_at DESC, id DESC").
				Limit(1).
				Row()
			row.Scan(&prevBalance)
			newBalance := prevBalance - item.Quantity

			// d. Create stock ledger entry
			ledger := models.StockLedger{
				TransactionType:   "MIN",
				TransactionNumber: min.MINNumber,
				TransactionDate:   now,
				ItemType:          "material",
				ItemID:            item.MaterialID,
				WarehouseID:       min.WarehouseID,
				WarehouseLocationID: item.WarehouseLocationID,
				BatchNumber:       item.BatchNumber,
				LotNumber:         item.LotNumber,
				Quantity:          -item.Quantity,
				UnitCost:          balance.UnitCost,
				TotalCost:         -item.Quantity * balance.UnitCost,
				BalanceQuantity:   newBalance,
				ReferenceType:     "MIN",
				ReferenceID:       min.ID,
				CreatedBy:         &userID,
			}
			if err := tx.Create(&ledger).Error; err != nil {
				return err
			}

			// e. Update stock balance and reservation
			balance.Quantity -= item.Quantity
			if hasReservation {
				// Fulfill reservation
				fulfilledQty := item.Quantity
				if fulfilledQty > (reservation.ReservedQuantity - reservation.FulfilledQuantity) {
					fulfilledQty = reservation.ReservedQuantity - reservation.FulfilledQuantity
				}
				
				reservation.FulfilledQuantity += fulfilledQty
				if reservation.FulfilledQuantity >= reservation.ReservedQuantity {
					reservation.Status = "fulfilled"
				}
				if err := tx.Save(&reservation).Error; err != nil {
					return err
				}
				
				// Reduce reserved quantity in balance
				balance.ReservedQuantity -= fulfilledQty
			}
			
			balance.TotalCost = balance.Quantity * balance.UnitCost
			balance.LastTransactionDate = &now
			if err := tx.Save(&balance).Error; err != nil {
				return err
			}

			// f. Update MR item issued quantity
			for _, mrItem := range min.MaterialRequest.Items {
				if mrItem.ID == item.MRItemID {
					mrItem.IssuedQuantity += item.Quantity
					if err := tx.Save(mrItem).Error; err != nil {
						return err
					}
				}
			}
		}

		// 3. Update MIN status
		min.IsPosted = true
		min.Status = "posted"
		min.PostedBy = &userID
		min.PostedAt = &now
		if err := tx.Save(&min).Error; err != nil {
			return err
		}

		// 4. Update MR overall status if fulfilled
		allFulfilled := true
		for _, mrItem := range min.MaterialRequest.Items {
			if mrItem.IssuedQuantity < mrItem.RequestedQuantity {
				allFulfilled = false
				break
			}
		}
		if allFulfilled {
			min.MaterialRequest.Status = "issued"
			if err := tx.Save(min.MaterialRequest).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (s *materialIssueNoteService) Cancel(id uint, userID uint) error {
	min, err := s.minRepo.GetByID(id)
	if err != nil {
		return err
	}
	if min.IsPosted {
		return errors.New("cannot cancel a posted issue note")
	}
	if min.Status == "cancelled" {
		return errors.New("issue note is already cancelled")
	}

	min.Status = "cancelled"
	min.UpdatedBy = &userID
	return s.minRepo.Update(min)
}
