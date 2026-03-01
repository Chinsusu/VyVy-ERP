package service

import (
	"errors"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"gorm.io/gorm"
)

// FormulaItemInput is used internally to pass item data
type FormulaItemInput struct {
	MaterialID uint    `json:"material_id" binding:"required"`
	Quantity   float64 `json:"quantity" binding:"required,gt=0"`
	Unit       string  `json:"unit" binding:"required"`
	Notes      string  `json:"notes"`
}

// CreateFormulaRequest is the DTO for creating a formula
type CreateFormulaRequest struct {
	Name        string             `json:"name" binding:"required"`
	Description string             `json:"description"`
	BatchSize   float64            `json:"batch_size"`
	BatchUnit   string             `json:"batch_unit"`
	IsActive    bool               `json:"is_active"`
	Notes       string             `json:"notes"`
	Items       []FormulaItemInput `json:"items"`
}

// UpdateFormulaRequest is the DTO for updating a formula
type UpdateFormulaRequest struct {
	Name        string             `json:"name"`
	Description string             `json:"description"`
	BatchSize   *float64           `json:"batch_size"`
	BatchUnit   string             `json:"batch_unit"`
	IsActive    *bool              `json:"is_active"`
	Notes       string             `json:"notes"`
	Items       []FormulaItemInput `json:"items"`
}

// ProductFormulaService defines business logic for BOM
type ProductFormulaService interface {
	GetFormulasByProductID(productID uint) ([]*models.ProductFormula, error)
	GetFormulaByID(id uint) (*models.ProductFormula, error)
	CreateFormula(productID uint, req *CreateFormulaRequest, userID uint) (*models.ProductFormula, error)
	UpdateFormula(id uint, req *UpdateFormulaRequest, userID uint) (*models.ProductFormula, error)
	DeleteFormula(id uint) error
}

type productFormulaService struct {
	repo         repository.ProductFormulaRepository
	fpRepo       repository.FinishedProductRepository
	materialRepo repository.MaterialRepository
}

// NewProductFormulaService creates a new ProductFormulaService
func NewProductFormulaService(
	repo repository.ProductFormulaRepository,
	fpRepo repository.FinishedProductRepository,
	materialRepo repository.MaterialRepository,
) ProductFormulaService {
	return &productFormulaService{repo: repo, fpRepo: fpRepo, materialRepo: materialRepo}
}

func (s *productFormulaService) GetFormulasByProductID(productID uint) ([]*models.ProductFormula, error) {
	// Verify product exists
	if _, err := s.fpRepo.GetByID(productID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("finished product not found")
		}
		return nil, err
	}
	return s.repo.GetByProductID(productID)
}

func (s *productFormulaService) GetFormulaByID(id uint) (*models.ProductFormula, error) {
	formula, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("formula not found")
		}
		return nil, err
	}
	return formula, nil
}

func (s *productFormulaService) CreateFormula(productID uint, req *CreateFormulaRequest, userID uint) (*models.ProductFormula, error) {
	// Verify product exists
	if _, err := s.fpRepo.GetByID(productID); err != nil {
		return nil, errors.New("finished product not found")
	}

	batchSize := req.BatchSize
	if batchSize <= 0 {
		batchSize = 1
	}
	batchUnit := req.BatchUnit
	if batchUnit == "" {
		batchUnit = "PCS"
	}

	formula := &models.ProductFormula{
		FinishedProductID: productID,
		Name:              req.Name,
		Description:       req.Description,
		BatchSize:         batchSize,
		BatchUnit:         batchUnit,
		IsActive:          req.IsActive,
		Notes:             req.Notes,
		CreatedBy:         &userID,
		UpdatedBy:         &userID,
	}

	// Build items
	for _, item := range req.Items {
		// Validate material exists
		mat, err := s.materialRepo.GetByID(int64(item.MaterialID))
		if err != nil {
			return nil, errors.New("material not found: invalid material_id")
		}
		unit := item.Unit
		if unit == "" {
			unit = mat.Unit
		}
		formula.Items = append(formula.Items, models.ProductFormulaItem{
			MaterialID: item.MaterialID,
			Quantity:   item.Quantity,
			Unit:       unit,
			Notes:      item.Notes,
		})
	}

	if err := s.repo.Create(formula); err != nil {
		return nil, err
	}

	// Reload with associations
	return s.repo.GetByID(formula.ID)
}

func (s *productFormulaService) UpdateFormula(id uint, req *UpdateFormulaRequest, userID uint) (*models.ProductFormula, error) {
	formula, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("formula not found")
		}
		return nil, err
	}

	if req.Name != "" {
		formula.Name = req.Name
	}
	if req.Description != "" {
		formula.Description = req.Description
	}
	if req.BatchSize != nil && *req.BatchSize > 0 {
		formula.BatchSize = *req.BatchSize
	}
	if req.BatchUnit != "" {
		formula.BatchUnit = req.BatchUnit
	}
	if req.IsActive != nil {
		formula.IsActive = *req.IsActive
	}
	if req.Notes != "" {
		formula.Notes = req.Notes
	}
	formula.UpdatedBy = &userID

	// If items are provided, replace them entirely
	if req.Items != nil {
		// Delete old items
		if err := s.repo.DeleteItems(formula.ID); err != nil {
			return nil, err
		}
		// Build new items
		newItems := make([]models.ProductFormulaItem, 0, len(req.Items))
		for _, item := range req.Items {
			mat, err := s.materialRepo.GetByID(int64(item.MaterialID))
			if err != nil {
				return nil, errors.New("material not found: invalid material_id")
			}
			unit := item.Unit
			if unit == "" {
				unit = mat.Unit
			}
			newItems = append(newItems, models.ProductFormulaItem{
				FormulaID:  formula.ID,
				MaterialID: item.MaterialID,
				Quantity:   item.Quantity,
				Unit:       unit,
				Notes:      item.Notes,
			})
		}
		formula.Items = newItems
	}

	if err := s.repo.Update(formula); err != nil {
		return nil, err
	}

	return s.repo.GetByID(formula.ID)
}

func (s *productFormulaService) DeleteFormula(id uint) error {
	if _, err := s.repo.GetByID(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("formula not found")
		}
		return err
	}
	return s.repo.Delete(id)
}
