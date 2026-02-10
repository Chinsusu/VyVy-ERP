package service

import (
	"errors"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"gorm.io/gorm"
)

// MaterialService interface defines business logic methods
type MaterialService interface {
	CreateMaterial(req dto.CreateMaterialRequest, userID int64) (*models.SafeMaterial, error)
	GetMaterialByID(id int64) (*models.SafeMaterial, error)
	ListMaterials(filter dto.MaterialFilterRequest) ([]*models.SafeMaterial, int64, error)
	UpdateMaterial(id int64, req dto.UpdateMaterialRequest, userID int64) (*models.SafeMaterial, error)
	DeleteMaterial(id int64) error
}

// materialService implements MaterialService
type materialService struct {
	repo repository.MaterialRepository
}

// NewMaterialService creates a new material service
func NewMaterialService(repo repository.MaterialRepository) MaterialService {
	return &materialService{repo: repo}
}

// CreateMaterial creates a new material
func (s *materialService) CreateMaterial(req dto.CreateMaterialRequest, userID int64) (*models.SafeMaterial, error) {
	// Check if code already exists
	existing, err := s.repo.GetByCode(req.Code)
	if err == nil && existing != nil {
		return nil, errors.New("material code already exists")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Create material
	material := &models.Material{
		Code:              req.Code,
		TradingName:       req.TradingName,
		InciName:          req.InciName,
		MaterialType:      req.MaterialType,
		Category:          req.Category,
		SubCategory:       req.SubCategory,
		Unit:              req.Unit,
		SupplierID:        req.SupplierID,
		StandardCost:      req.StandardCost,
		LastPurchasePrice: req.LastPurchasePrice,
		MinStockLevel:     req.MinStockLevel,
		MaxStockLevel:     req.MaxStockLevel,
		ReorderPoint:      req.ReorderPoint,
		ReorderQuantity:   req.ReorderQuantity,
		RequiresQC:        req.RequiresQC,
		ShelfLifeDays:     req.ShelfLifeDays,
		StorageConditions: req.StorageConditions,
		Hazardous:         req.Hazardous,
		IsActive:          req.IsActive,
		Notes:             req.Notes,
		CreatedBy:         &userID,
		UpdatedBy:         &userID,
	}

	if err := s.repo.Create(material); err != nil {
		return nil, err
	}

	return material.ToSafe(), nil
}

// GetMaterialByID retrieves a material by ID
func (s *materialService) GetMaterialByID(id int64) (*models.SafeMaterial, error) {
	material, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("material not found")
		}
		return nil, err
	}

	return material.ToSafe(), nil
}

func (s *materialService) ListMaterials(filter dto.MaterialFilterRequest) ([]*models.SafeMaterial, int64, error) {
	materials, total, err := s.repo.List(filter)
	if err != nil {
		return nil, 0, err
	}

	safeMaterials := make([]*models.SafeMaterial, len(materials))
	for i, material := range materials {
		safeMaterials[i] = material.ToSafe()
	}

	return safeMaterials, total, nil
}

// UpdateMaterial updates a material
func (s *materialService) UpdateMaterial(id int64, req dto.UpdateMaterialRequest, userID int64) (*models.SafeMaterial, error) {
	material, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("material not found")
		}
		return nil, err
	}

	// Update fields if provided
	if req.TradingName != nil {
		material.TradingName = *req.TradingName
	}
	if req.InciName != nil {
		material.InciName = req.InciName
	}
	if req.MaterialType != nil {
		material.MaterialType = *req.MaterialType
	}
	if req.Category != nil {
		material.Category = req.Category
	}
	if req.SubCategory != nil {
		material.SubCategory = req.SubCategory
	}
	if req.Unit != nil {
		material.Unit = *req.Unit
	}
	if req.SupplierID != nil {
		material.SupplierID = req.SupplierID
	}
	if req.StandardCost != nil {
		material.StandardCost = req.StandardCost
	}
	if req.LastPurchasePrice != nil {
		material.LastPurchasePrice = req.LastPurchasePrice
	}
	if req.MinStockLevel != nil {
		material.MinStockLevel = req.MinStockLevel
	}
	if req.MaxStockLevel != nil {
		material.MaxStockLevel = req.MaxStockLevel
	}
	if req.ReorderPoint != nil {
		material.ReorderPoint = req.ReorderPoint
	}
	if req.ReorderQuantity != nil {
		material.ReorderQuantity = req.ReorderQuantity
	}
	if req.RequiresQC != nil {
		material.RequiresQC = *req.RequiresQC
	}
	if req.ShelfLifeDays != nil {
		material.ShelfLifeDays = req.ShelfLifeDays
	}
	if req.StorageConditions != nil {
		material.StorageConditions = req.StorageConditions
	}
	if req.Hazardous != nil {
		material.Hazardous = *req.Hazardous
	}
	if req.IsActive != nil {
		material.IsActive = *req.IsActive
	}
	if req.Notes != nil {
		material.Notes = req.Notes
	}

	material.UpdatedBy = &userID

	if err := s.repo.Update(material); err != nil {
		return nil, err
	}

	return material.ToSafe(), nil
}

// DeleteMaterial soft deletes a material
func (s *materialService) DeleteMaterial(id int64) error {
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("material not found")
		}
		return err
	}

	return s.repo.Delete(id)
}
