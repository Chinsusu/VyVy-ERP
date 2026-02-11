package service

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

// WarehouseLocationService defines the interface for warehouse location business logic
type WarehouseLocationService interface {
	CreateLocation(req *dto.CreateWarehouseLocationRequest, userID uint) (*models.SafeWarehouseLocation, error)
	GetLocationByID(id uint) (*models.SafeWarehouseLocation, error)
	ListLocations(filter *dto.WarehouseLocationFilterRequest) ([]*models.SafeWarehouseLocation, int64, error)
	UpdateLocation(id uint, req *dto.UpdateWarehouseLocationRequest, userID uint) (*models.SafeWarehouseLocation, error)
	DeleteLocation(id uint) error
}

// warehouseLocationService implements WarehouseLocationService
type warehouseLocationService struct {
	repo          repository.WarehouseLocationRepository
	warehouseRepo repository.WarehouseRepository
}

// NewWarehouseLocationService creates a new warehouse location service
func NewWarehouseLocationService(repo repository.WarehouseLocationRepository, warehouseRepo repository.WarehouseRepository) WarehouseLocationService {
	return &warehouseLocationService{
		repo:          repo,
		warehouseRepo: warehouseRepo,
	}
}

// CreateLocation creates a new warehouse location
func (s *warehouseLocationService) CreateLocation(req *dto.CreateWarehouseLocationRequest, userID uint) (*models.SafeWarehouseLocation, error) {
	// Check if warehouse exists
	_, err := s.warehouseRepo.GetByID(req.WarehouseID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("warehouse not found")
		}
		return nil, err
	}

	// Check if code already exists
	existing, err := s.repo.GetByCode(req.Code)
	if err == nil && existing != nil {
		return nil, errors.New("location code already exists")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Set default location type
	locationType := req.LocationType
	if locationType == "" {
		locationType = "storage"
	}

	// Create location
	location := &models.WarehouseLocation{
		WarehouseID:  req.WarehouseID,
		Code:         req.Code,
		Name:         req.Name,
		Aisle:        req.Aisle,
		Rack:         req.Rack,
		Shelf:        req.Shelf,
		Bin:          req.Bin,
		LocationType: locationType,
		IsActive:     &req.IsActive,
		Notes:        req.Notes,
		CreatedBy:    &userID,
		UpdatedBy:    &userID,
	}

	if err := s.repo.Create(location); err != nil {
		return nil, err
	}

	return location.ToSafe(), nil
}

// GetLocationByID retrieves a warehouse location by ID
func (s *warehouseLocationService) GetLocationByID(id uint) (*models.SafeWarehouseLocation, error) {
	location, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("location not found")
		}
		return nil, err
	}
	return location.ToSafe(), nil
}

// ListLocations retrieves warehouse locations with filters
func (s *warehouseLocationService) ListLocations(filter *dto.WarehouseLocationFilterRequest) ([]*models.SafeWarehouseLocation, int64, error) {
	locations, total, err := s.repo.List(filter)
	if err != nil {
		return nil, 0, err
	}

	// Convert to safe locations
	safeLocations := make([]*models.SafeWarehouseLocation, len(locations))
	for i, location := range locations {
		safeLocations[i] = location.ToSafe()
	}

	return safeLocations, total, nil
}

// UpdateLocation updates a warehouse location
func (s *warehouseLocationService) UpdateLocation(id uint, req *dto.UpdateWarehouseLocationRequest, userID uint) (*models.SafeWarehouseLocation, error) {
	// Get existing location
	location, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("location not found")
		}
		return nil, err
	}

	// If warehouse_id is being changed, check if new warehouse exists
	if req.WarehouseID != 0 && req.WarehouseID != location.WarehouseID {
		_, err := s.warehouseRepo.GetByID(req.WarehouseID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("warehouse not found")
			}
			return nil, err
		}
		location.WarehouseID = req.WarehouseID
	}

	// Check if new code conflicts with existing location
	if req.Code != "" && req.Code != location.Code {
		existing, err := s.repo.GetByCode(req.Code)
		if err == nil && existing != nil && existing.ID != id {
			return nil, errors.New("location code already exists")
		}
	}

	// Update fields
	if req.Code != "" {
		location.Code = req.Code
	}
	if req.Name != "" {
		location.Name = req.Name
	}
	if req.Aisle != nil {
		location.Aisle = req.Aisle
	}
	if req.Rack != nil {
		location.Rack = req.Rack
	}
	if req.Shelf != nil {
		location.Shelf = req.Shelf
	}
	if req.Bin != nil {
		location.Bin = req.Bin
	}
	if req.LocationType != "" {
		location.LocationType = req.LocationType
	}
	if req.IsActive != nil {
		location.IsActive = req.IsActive
	}
	if req.Notes != nil {
		location.Notes = req.Notes
	}

	location.UpdatedBy = &userID
	location.UpdatedAt = time.Now()

	if err := s.repo.Update(location); err != nil {
		return nil, err
	}

	return location.ToSafe(), nil
}

// DeleteLocation soft deletes a warehouse location
func (s *warehouseLocationService) DeleteLocation(id uint) error {
	// Check if location exists
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("location not found")
		}
		return err
	}

	return s.repo.Delete(id)
}
