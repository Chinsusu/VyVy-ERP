package service

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

// WarehouseService defines the interface for warehouse business logic
type WarehouseService interface {
	CreateWarehouse(req *dto.CreateWarehouseRequest, userID uint) (*models.SafeWarehouse, error)
	GetWarehouseByID(id uint) (*models.SafeWarehouse, error)
	ListWarehouses(filter *dto.WarehouseFilterRequest) ([]*models.SafeWarehouse, int64, error)
	UpdateWarehouse(id uint, req *dto.UpdateWarehouseRequest, userID uint) (*models.SafeWarehouse, error)
	DeleteWarehouse(id uint) error
	GetWarehouseLocations(id uint) ([]*models.SafeWarehouseLocation, error)
}

// warehouseService implements WarehouseService
type warehouseService struct {
	repo         repository.WarehouseRepository
	locationRepo repository.WarehouseLocationRepository
}

// NewWarehouseService creates a new warehouse service
func NewWarehouseService(repo repository.WarehouseRepository, locationRepo repository.WarehouseLocationRepository) WarehouseService {
	return &warehouseService{
		repo:         repo,
		locationRepo: locationRepo,
	}
}

// CreateWarehouse creates a new warehouse
func (s *warehouseService) CreateWarehouse(req *dto.CreateWarehouseRequest, userID uint) (*models.SafeWarehouse, error) {
	// Check if code already exists
	existing, err := s.repo.GetByCode(req.Code)
	if err == nil && existing != nil {
		return nil, errors.New("warehouse code already exists")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Set default warehouse type
	warehouseType := req.WarehouseType
	if warehouseType == "" {
		warehouseType = "main"
	}

	// Create warehouse
	warehouse := &models.Warehouse{
		Code:          req.Code,
		Name:          req.Name,
		WarehouseType: warehouseType,
		Address:       req.Address,
		City:          req.City,
		ManagerID:     req.ManagerID,
		IsActive:      req.IsActive,
		Notes:         req.Notes,
		CreatedBy:     &userID,
		UpdatedBy:     &userID,
	}

	if err := s.repo.Create(warehouse); err != nil {
		return nil, err
	}

	return warehouse.ToSafe(), nil
}

// GetWarehouseByID retrieves a warehouse by ID
func (s *warehouseService) GetWarehouseByID(id uint) (*models.SafeWarehouse, error) {
	warehouse, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("warehouse not found")
		}
		return nil, err
	}

	safe := warehouse.ToSafe()

	// Get locations count
	count, err := s.repo.GetLocationsCount(id)
	if err == nil {
		safe.LocationsCount = int(count)
	}

	return safe, nil
}

// ListWarehouses retrieves warehouses with filters
func (s *warehouseService) ListWarehouses(filter *dto.WarehouseFilterRequest) ([]*models.SafeWarehouse, int64, error) {
	warehouses, total, err := s.repo.List(filter)
	if err != nil {
		return nil, 0, err
	}

	// Convert to safe warehouses and add locations count
	safeWarehouses := make([]*models.SafeWarehouse, len(warehouses))
	for i, warehouse := range warehouses {
		safe := warehouse.ToSafe()

		// Get locations count for each warehouse
		count, err := s.repo.GetLocationsCount(warehouse.ID)
		if err == nil {
			safe.LocationsCount = int(count)
		}

		safeWarehouses[i] = safe
	}

	return safeWarehouses, total, nil
}

// UpdateWarehouse updates a warehouse
func (s *warehouseService) UpdateWarehouse(id uint, req *dto.UpdateWarehouseRequest, userID uint) (*models.SafeWarehouse, error) {
	// Get existing warehouse
	warehouse, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("warehouse not found")
		}
		return nil, err
	}

	// Check if new code conflicts with existing warehouse
	if req.Code != "" && req.Code != warehouse.Code {
		existing, err := s.repo.GetByCode(req.Code)
		if err == nil && existing != nil && existing.ID != id {
			return nil, errors.New("warehouse code already exists")
		}
	}

	// Update fields
	if req.Code != "" {
		warehouse.Code = req.Code
	}
	if req.Name != "" {
		warehouse.Name = req.Name
	}
	if req.WarehouseType != "" {
		warehouse.WarehouseType = req.WarehouseType
	}
	if req.Address != nil {
		warehouse.Address = req.Address
	}
	if req.City != nil {
		warehouse.City = req.City
	}
	if req.ManagerID != nil {
		warehouse.ManagerID = req.ManagerID
	}
	if req.IsActive != nil {
		warehouse.IsActive = *req.IsActive
	}
	if req.Notes != nil {
		warehouse.Notes = req.Notes
	}

	warehouse.UpdatedBy = &userID
	warehouse.UpdatedAt = time.Now()

	if err := s.repo.Update(warehouse); err != nil {
		return nil, err
	}

	safe := warehouse.ToSafe()

	// Get locations count
	count, err := s.repo.GetLocationsCount(id)
	if err == nil {
		safe.LocationsCount = int(count)
	}

	return safe, nil
}

// DeleteWarehouse soft deletes a warehouse
func (s *warehouseService) DeleteWarehouse(id uint) error {
	// Check if warehouse exists
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("warehouse not found")
		}
		return err
	}

	// Check if warehouse has active locations
	count, err := s.repo.GetLocationsCount(id)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("cannot delete warehouse with existing locations")
	}

	return s.repo.Delete(id)
}

// GetWarehouseLocations retrieves all locations for a warehouse
func (s *warehouseService) GetWarehouseLocations(id uint) ([]*models.SafeWarehouseLocation, error) {
	// Check if warehouse exists
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("warehouse not found")
		}
		return nil, err
	}

	// Get locations
	locations, err := s.locationRepo.ListByWarehouseID(id)
	if err != nil {
		return nil, err
	}

	// Convert to safe locations
	safeLocations := make([]*models.SafeWarehouseLocation, len(locations))
	for i, location := range locations {
		safeLocations[i] = location.ToSafe()
	}

	return safeLocations, nil
}
