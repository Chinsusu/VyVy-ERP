package service

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

// SupplierService defines the interface for supplier business logic
type SupplierService interface {
	CreateSupplier(req *dto.CreateSupplierRequest, userID uint) (*models.SafeSupplier, error)
	GetSupplierByID(id uint) (*models.SafeSupplier, error)
	ListSuppliers(filter *dto.SupplierFilterRequest) ([]*models.SafeSupplier, int64, error)
	UpdateSupplier(id uint, req *dto.UpdateSupplierRequest, userID uint) (*models.SafeSupplier, error)
	DeleteSupplier(id uint) error
}

// supplierService implements SupplierService
type supplierService struct {
	repo repository.SupplierRepository
}

// NewSupplierService creates a new supplier service
func NewSupplierService(repo repository.SupplierRepository) SupplierService {
	return &supplierService{repo: repo}
}

// CreateSupplier creates a new supplier
func (s *supplierService) CreateSupplier(req *dto.CreateSupplierRequest, userID uint) (*models.SafeSupplier, error) {
	// Check if code already exists
	existing, err := s.repo.GetByCode(req.Code)
	if err == nil && existing != nil {
		return nil, errors.New("supplier code already exists")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Create supplier
	country := req.Country
	if country == "" {
		country = "Vietnam"
	}

	supplier := &models.Supplier{
		Code:          req.Code,
		Name:          req.Name,
		NameEn:        req.NameEn,
		TaxCode:       req.TaxCode,
		ContactPerson: req.ContactPerson,
		Phone:         req.Phone,
		Email:         req.Email,
		Address:       req.Address,
		City:          req.City,
		Country:       country,
		PaymentTerms:  req.PaymentTerms,
		CreditLimit:   req.CreditLimit,
		IsActive:      req.IsActive,
		Notes:         req.Notes,
		CreatedBy:     &userID,
		UpdatedBy:     &userID,
	}

	if err := s.repo.Create(supplier); err != nil {
		return nil, err
	}

	return supplier.ToSafe(), nil
}

// GetSupplierByID retrieves a supplier by ID
func (s *supplierService) GetSupplierByID(id uint) (*models.SafeSupplier, error) {
	supplier, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("supplier not found")
		}
		return nil, err
	}
	return supplier.ToSafe(), nil
}

// ListSuppliers retrieves suppliers with filters
func (s *supplierService) ListSuppliers(filter *dto.SupplierFilterRequest) ([]*models.SafeSupplier, int64, error) {
	suppliers, total, err := s.repo.List(filter)
	if err != nil {
		return nil, 0, err
	}

	// Convert to safe suppliers
	safeSuppliers := make([]*models.SafeSupplier, len(suppliers))
	for i, supplier := range suppliers {
		safeSuppliers[i] = supplier.ToSafe()
	}

	return safeSuppliers, total, nil
}

// UpdateSupplier updates a supplier
func (s *supplierService) UpdateSupplier(id uint, req *dto.UpdateSupplierRequest, userID uint) (*models.SafeSupplier, error) {
	// Get existing supplier
	supplier, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("supplier not found")
		}
		return nil, err
	}

	// Check if new code conflicts with existing supplier
	if req.Code != "" && req.Code != supplier.Code {
		existing, err := s.repo.GetByCode(req.Code)
		if err == nil && existing != nil && existing.ID != id {
			return nil, errors.New("supplier code already exists")
		}
	}

	// Update fields
	if req.Code != "" {
		supplier.Code = req.Code
	}
	if req.Name != "" {
		supplier.Name = req.Name
	}
	if req.NameEn != nil {
		supplier.NameEn = req.NameEn
	}
	if req.TaxCode != nil {
		supplier.TaxCode = req.TaxCode
	}
	if req.ContactPerson != nil {
		supplier.ContactPerson = req.ContactPerson
	}
	if req.Phone != nil {
		supplier.Phone = req.Phone
	}
	if req.Email != nil {
		supplier.Email = req.Email
	}
	if req.Address != nil {
		supplier.Address = req.Address
	}
	if req.City != nil {
		supplier.City = req.City
	}
	if req.Country != "" {
		supplier.Country = req.Country
	}
	if req.PaymentTerms != nil {
		supplier.PaymentTerms = req.PaymentTerms
	}
	if req.CreditLimit != nil {
		supplier.CreditLimit = req.CreditLimit
	}
	if req.IsActive != nil {
		supplier.IsActive = *req.IsActive
	}
	if req.Notes != nil {
		supplier.Notes = req.Notes
	}

	supplier.UpdatedBy = &userID
	supplier.UpdatedAt = time.Now()

	if err := s.repo.Update(supplier); err != nil {
		return nil, err
	}

	return supplier.ToSafe(), nil
}

// DeleteSupplier soft deletes a supplier
func (s *supplierService) DeleteSupplier(id uint) error {
	// Check if supplier exists
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("supplier not found")
		}
		return err
	}

	return s.repo.Delete(id)
}
