package service

import (
	"errors"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"

	"gorm.io/gorm"
)

// FinishedProductService interface defines business logic for finished products
type FinishedProductService interface {
	CreateFinishedProduct(req *dto.CreateFinishedProductRequest, userID uint, username string) (*models.SafeFinishedProduct, error)
	GetFinishedProductByID(id uint) (*models.SafeFinishedProduct, error)
	GetFinishedProductByCode(code string) (*models.SafeFinishedProduct, error)
	ListFinishedProducts(filter *dto.FinishedProductFilterRequest) ([]*models.SafeFinishedProduct, int64, error)
	UpdateFinishedProduct(id uint, req *dto.UpdateFinishedProductRequest, userID uint, username string) (*models.SafeFinishedProduct, error)
	DeleteFinishedProduct(id uint, userID int64, username string) error
}

type finishedProductService struct {
	repo     repository.FinishedProductRepository
	auditSvc AuditLogService
}

// NewFinishedProductService creates a new instance of FinishedProductService
func NewFinishedProductService(repo repository.FinishedProductRepository, auditSvc AuditLogService) FinishedProductService {
	return &finishedProductService{repo: repo, auditSvc: auditSvc}
}

func (s *finishedProductService) CreateFinishedProduct(req *dto.CreateFinishedProductRequest, userID uint, username string) (*models.SafeFinishedProduct, error) {
	// Check if code already exists
	existing, err := s.repo.GetByCode(req.Code)
	if err == nil && existing != nil {
		return nil, errors.New("finished product code already exists")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Set default unit if empty
	unit := req.Unit
	if unit == "" {
		unit = "PCS"
	}

	// Create finished product
	product := &models.FinishedProduct{
		Code:              req.Code,
		Name:              req.Name,
		NameEn:            req.NameEn,
		Category:          req.Category,
		SubCategory:       req.SubCategory,
		Unit:              unit,
		StandardCost:      req.StandardCost,
		SellingPrice:      req.SellingPrice,
		NetWeight:         req.NetWeight,
		GrossWeight:       req.GrossWeight,
		Volume:            req.Volume,
		MinStockLevel:     req.MinStockLevel,
		MaxStockLevel:     req.MaxStockLevel,
		ReorderPoint:      req.ReorderPoint,
		ShelfLifeDays:     req.ShelfLifeDays,
		StorageConditions: req.StorageConditions,
		Barcode:           req.Barcode,
		IsActive:          req.IsActive,
		Notes:             req.Notes,
		CreatedBy:         &userID,
		UpdatedBy:         &userID,
	}

	if err := s.repo.Create(product); err != nil {
		return nil, err
	}

	safe := product.ToSafe()
	_ = s.auditSvc.Log("finished_products", "CREATE", int64(product.ID), int64(userID), username, nil, safe)

	return safe, nil
}

func (s *finishedProductService) GetFinishedProductByID(id uint) (*models.SafeFinishedProduct, error) {
	product, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("finished product not found")
		}
		return nil, err
	}

	return product.ToSafe(), nil
}

func (s *finishedProductService) GetFinishedProductByCode(code string) (*models.SafeFinishedProduct, error) {
	product, err := s.repo.GetByCode(code)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("finished product not found")
		}
		return nil, err
	}

	return product.ToSafe(), nil
}

func (s *finishedProductService) ListFinishedProducts(filter *dto.FinishedProductFilterRequest) ([]*models.SafeFinishedProduct, int64, error) {
	products, total, err := s.repo.List(filter)
	if err != nil {
		return nil, 0, err
	}

	// Convert to safe DTOs
	safeProducts := make([]*models.SafeFinishedProduct, len(products))
	for i, product := range products {
		safeProducts[i] = product.ToSafe()
	}

	return safeProducts, total, nil
}

func (s *finishedProductService) UpdateFinishedProduct(id uint, req *dto.UpdateFinishedProductRequest, userID uint, username string) (*models.SafeFinishedProduct, error) {
	// Get existing product
	product, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("finished product not found")
		}
		return nil, err
	}

	// Capture old values
	oldValues := product.ToSafe()

	// Update fields if provided
	if req.Code != "" {
		// Check if new code already exists
		if req.Code != product.Code {
			existing, err := s.repo.GetByCode(req.Code)
			if err == nil && existing != nil {
				return nil, errors.New("finished product code already exists")
			}
		}
		product.Code = req.Code
	}

	if req.Name != "" {
		product.Name = req.Name
	}

	if req.NameEn != "" {
		product.NameEn = req.NameEn
	}

	if req.Category != "" {
		product.Category = req.Category
	}

	if req.SubCategory != "" {
		product.SubCategory = req.SubCategory
	}

	if req.Unit != "" {
		product.Unit = req.Unit
	}

	if req.StandardCost != nil {
		product.StandardCost = req.StandardCost
	}

	if req.SellingPrice != nil {
		product.SellingPrice = req.SellingPrice
	}

	if req.NetWeight != nil {
		product.NetWeight = req.NetWeight
	}

	if req.GrossWeight != nil {
		product.GrossWeight = req.GrossWeight
	}

	if req.Volume != nil {
		product.Volume = req.Volume
	}

	if req.MinStockLevel != nil {
		product.MinStockLevel = req.MinStockLevel
	}

	if req.MaxStockLevel != nil {
		product.MaxStockLevel = req.MaxStockLevel
	}

	if req.ReorderPoint != nil {
		product.ReorderPoint = req.ReorderPoint
	}

	if req.ShelfLifeDays != nil {
		product.ShelfLifeDays = req.ShelfLifeDays
	}

	if req.StorageConditions != "" {
		product.StorageConditions = req.StorageConditions
	}

	if req.Barcode != "" {
		product.Barcode = req.Barcode
	}

	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}

	if req.Notes != "" {
		product.Notes = req.Notes
	}

	// Update audit fields
	product.UpdatedBy = &userID

	if err := s.repo.Update(product); err != nil {
		return nil, err
	}

	newValues := product.ToSafe()
	_ = s.auditSvc.Log("finished_products", "UPDATE", int64(product.ID), int64(userID), username, oldValues, newValues)

	return newValues, nil
}

func (s *finishedProductService) DeleteFinishedProduct(id uint, userID int64, username string) error {
	// Check if product exists
	product, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("finished product not found")
		}
		return err
	}

	oldValues := product.ToSafe()

	if err := s.repo.Delete(id); err != nil {
		return err
	}

	_ = s.auditSvc.Log("finished_products", "DELETE", int64(id), userID, username, oldValues, nil)

	return nil
}
