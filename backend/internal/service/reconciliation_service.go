package service

import (
	"errors"
	"math"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"gorm.io/gorm"
)

type ReconciliationService struct {
	repo        *repository.ReconciliationRepository
	carrierRepo *repository.CarrierRepository
}

func NewReconciliationService(repo *repository.ReconciliationRepository, carrierRepo *repository.CarrierRepository) *ReconciliationService {
	return &ReconciliationService{repo: repo, carrierRepo: carrierRepo}
}

func (s *ReconciliationService) Create(recon *models.ShippingReconciliation) error {
	// Validate carrier exists
	_, err := s.carrierRepo.GetByID(recon.CarrierID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("carrier not found")
		}
		return err
	}

	// Generate number
	number, err := s.repo.GetNextReconciliationNumber()
	if err != nil {
		return err
	}
	recon.ReconciliationNumber = number
	recon.Status = "draft"

	return s.repo.Create(recon)
}

func (s *ReconciliationService) GetByID(id uint) (*models.ShippingReconciliation, error) {
	return s.repo.GetByID(id)
}

func (s *ReconciliationService) List(filters map[string]interface{}) ([]models.ShippingReconciliation, int64, error) {
	return s.repo.List(filters)
}

// AddItems adds items to a reconciliation and auto-matches by tracking number
func (s *ReconciliationService) AddItems(reconID uint, items []AddReconciliationItemInput) error {
	recon, err := s.repo.GetByID(reconID)
	if err != nil {
		return errors.New("reconciliation not found")
	}
	if recon.Status == "confirmed" {
		return errors.New("cannot add items to a confirmed reconciliation")
	}

	var modelItems []models.ShippingReconciliationItem
	for _, item := range items {
		mi := models.ShippingReconciliationItem{
			ReconciliationID: reconID,
			TrackingNumber:   item.TrackingNumber,
			CarrierStatus:    item.CarrierStatus,
			CODAmount:        item.CODAmount,
			ShippingFee:      item.ShippingFee,
			ActualReceived:   item.ActualReceived,
			MatchStatus:      "pending",
		}

		// Try to match by tracking number
		do, err := s.repo.FindDOByTrackingNumber(item.TrackingNumber)
		if err == nil && do != nil {
			mi.DeliveryOrderID = &do.ID
			mi.MatchStatus = "matched"

			// Check for discrepancy (if ActualReceived differs from COD - ShippingFee)
			expected := item.CODAmount - item.ShippingFee
			if math.Abs(item.ActualReceived-expected) > 0.01 {
				mi.MatchStatus = "discrepancy"
				mi.DiscrepancyAmount = item.ActualReceived - expected
				mi.DiscrepancyNote = "Actual received differs from expected (COD - shipping fee)"
			}
		} else {
			mi.MatchStatus = "unmatched"
		}

		modelItems = append(modelItems, mi)
	}

	if err := s.repo.AddItems(modelItems); err != nil {
		return err
	}

	// Recalculate totals
	return s.recalculateTotals(reconID)
}

// Confirm marks a reconciliation as confirmed
func (s *ReconciliationService) Confirm(id uint) error {
	recon, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("reconciliation not found")
	}
	if recon.Status == "confirmed" {
		return errors.New("reconciliation is already confirmed")
	}

	recon.Status = "confirmed"
	return s.repo.Update(recon)
}

// recalculateTotals recalculates the summary totals for a reconciliation
func (s *ReconciliationService) recalculateTotals(reconID uint) error {
	recon, err := s.repo.GetByID(reconID)
	if err != nil {
		return err
	}

	items, err := s.repo.GetItemsByReconciliationID(reconID)
	if err != nil {
		return err
	}

	recon.TotalOrders = len(items)
	recon.TotalMatched = 0
	recon.TotalDiscrepancy = 0
	recon.TotalCODActual = 0
	recon.TotalShippingFee = 0

	for _, item := range items {
		recon.TotalCODActual += item.CODAmount
		recon.TotalShippingFee += item.ShippingFee

		switch item.MatchStatus {
		case "matched":
			recon.TotalMatched++
		case "discrepancy":
			recon.TotalDiscrepancy++
		}
	}

	recon.Status = "completed"
	return s.repo.Update(recon)
}

func (s *ReconciliationService) Delete(id uint) error {
	recon, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("reconciliation not found")
	}
	if recon.Status == "confirmed" {
		return errors.New("cannot delete a confirmed reconciliation")
	}
	return s.repo.Delete(id)
}

// AddReconciliationItemInput is the input for adding items
type AddReconciliationItemInput struct {
	TrackingNumber string  `json:"tracking_number" binding:"required"`
	CarrierStatus  string  `json:"carrier_status"`
	CODAmount      float64 `json:"cod_amount"`
	ShippingFee    float64 `json:"shipping_fee"`
	ActualReceived float64 `json:"actual_received"`
}
