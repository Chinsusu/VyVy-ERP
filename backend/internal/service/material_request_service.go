package service

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

// MaterialRequestService defines the interface for material request business logic
type MaterialRequestService interface {
	CreateMaterialRequest(req *dto.CreateMaterialRequestRequest, userID uint) (*models.SafeMaterialRequest, error)
	GetMaterialRequestByID(id uint) (*models.SafeMaterialRequest, error)
	ListMaterialRequests(filter *dto.MaterialRequestFilterRequest) ([]*models.SafeMaterialRequest, int64, error)
	UpdateMaterialRequest(id uint, req *dto.UpdateMaterialRequestRequest, userID uint) (*models.SafeMaterialRequest, error)
	DeleteMaterialRequest(id uint) error
	ApproveMaterialRequest(id uint, userID uint) (*models.SafeMaterialRequest, error)
	CancelMaterialRequest(id uint) (*models.SafeMaterialRequest, error)
}

type materialRequestService struct {
	mrRepo         repository.MaterialRequestRepository
	mrItemRepo     repository.MaterialRequestItemRepository
	warehouseRepo  repository.WarehouseRepository
	materialRepo   repository.MaterialRepository
}

// NewMaterialRequestService creates a new MaterialRequestService
func NewMaterialRequestService(
	mrRepo repository.MaterialRequestRepository,
	mrItemRepo repository.MaterialRequestItemRepository,
	warehouseRepo repository.WarehouseRepository,
	materialRepo repository.MaterialRepository,
) MaterialRequestService {
	return &materialRequestService{
		mrRepo:        mrRepo,
		mrItemRepo:    mrItemRepo,
		warehouseRepo: warehouseRepo,
		materialRepo:  materialRepo,
	}
}

// CreateMaterialRequest creates a new material request with items
func (s *materialRequestService) CreateMaterialRequest(req *dto.CreateMaterialRequestRequest, userID uint) (*models.SafeMaterialRequest, error) {
	// Validate MR number uniqueness
	existing, err := s.mrRepo.GetByMRNumber(req.MRNumber)
	if err == nil && existing.ID > 0 {
		return nil, errors.New("material request number already exists")
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Validate warehouse exists
	_, err = s.warehouseRepo.GetByID(req.WarehouseID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("warehouse not found")
		}
		return nil, err
	}

	// Create material request
	mr := &models.MaterialRequest{
		MRNumber:     req.MRNumber,
		WarehouseID:  req.WarehouseID,
		Department:   req.Department,
		RequestDate:  req.RequestDate,
		Purpose:      req.Purpose,
		Notes:        req.Notes,
		Status:       "draft",
		CreatedBy:    &userID,
		UpdatedBy:    &userID,
	}

	if req.RequiredDate != "" {
		mr.RequiredDate = &req.RequiredDate
	}

	// Create MR
	if err := s.mrRepo.Create(mr); err != nil {
		return nil, err
	}

	// Create items
	items := make([]*models.MaterialRequestItem, len(req.Items))
	for i, itemReq := range req.Items {
		// Validate material exists
		_, err := s.materialRepo.GetByID(int64(itemReq.MaterialID))
		if err != nil {
			return nil, errors.New("material not found")
		}

		item := &models.MaterialRequestItem{
			MaterialRequestID: mr.ID,
			MaterialID:        itemReq.MaterialID,
			RequestedQuantity: itemReq.RequestedQuantity,
			Notes:             itemReq.Notes,
			CreatedBy:         &userID,
			UpdatedBy:         &userID,
		}
		items[i] = item
	}

	// Bulk create items
	if err := s.mrItemRepo.CreateBulk(items); err != nil {
		return nil, err
	}

	// Fetch complete MR
	mr, err = s.mrRepo.GetByID(mr.ID)
	if err != nil {
		return nil, err
	}

	return mr.ToSafe(), nil
}

// GetMaterialRequestByID retrieves a material request by ID
func (s *materialRequestService) GetMaterialRequestByID(id uint) (*models.SafeMaterialRequest, error) {
	mr, err := s.mrRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("material request not found")
		}
		return nil, err
	}
	return mr.ToSafe(), nil
}

// ListMaterialRequests retrieves material requests with filtering
func (s *materialRequestService) ListMaterialRequests(filter *dto.MaterialRequestFilterRequest) ([]*models.SafeMaterialRequest, int64, error) {
	mrs, total, err := s.mrRepo.List(filter)
	if err != nil {
		return nil, 0, err
	}

	safeMRs := make([]*models.SafeMaterialRequest, len(mrs))
	for i, mr := range mrs {
		safeMRs[i] = mr.ToSafe()
	}

	return safeMRs, total, nil
}

// UpdateMaterialRequest updates a material request
func (s *materialRequestService) UpdateMaterialRequest(id uint, req *dto.UpdateMaterialRequestRequest, userID uint) (*models.SafeMaterialRequest, error) {
	// Get existing MR
	mr, err := s.mrRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("material request not found")
		}
		return nil, err
	}

	// Check if MR is in draft status
	if mr.Status != "draft" {
		return nil, errors.New("can only update material requests in draft status")
	}

	// Update fields if provided
	if req.MRNumber != "" && req.MRNumber != mr.MRNumber {
		existing, err := s.mrRepo.GetByMRNumber(req.MRNumber)
		if err == nil && existing.ID > 0 {
			return nil, errors.New("material request number already exists")
		}
		mr.MRNumber = req.MRNumber
	}

	if req.WarehouseID > 0 {
		_, err = s.warehouseRepo.GetByID(req.WarehouseID)
		if err != nil {
			return nil, errors.New("warehouse not found")
		}
		mr.WarehouseID = req.WarehouseID
	}

	if req.Department != "" {
		mr.Department = req.Department
	}
	if req.RequestDate != "" {
		mr.RequestDate = req.RequestDate
	}
	if req.RequiredDate != "" {
		mr.RequiredDate = &req.RequiredDate
	}
	mr.Purpose = req.Purpose
	mr.Notes = req.Notes
	mr.UpdatedBy = &userID

	// Update MR
	if err := s.mrRepo.Update(mr); err != nil {
		return nil, err
	}

	// Update items if provided
	if len(req.Items) > 0 {
		// Delete old items
		if err := s.mrItemRepo.DeleteByMRID(id); err != nil {
			return nil, err
		}

		// Create new items
		items := make([]*models.MaterialRequestItem, len(req.Items))
		for i, itemReq := range req.Items {
			_, err := s.materialRepo.GetByID(int64(itemReq.MaterialID))
			if err != nil {
				return nil, errors.New("material not found")
			}

			item := &models.MaterialRequestItem{
				MaterialRequestID: mr.ID,
				MaterialID:        itemReq.MaterialID,
				RequestedQuantity: itemReq.RequestedQuantity,
				Notes:             itemReq.Notes,
				CreatedBy:         &userID,
				UpdatedBy:         &userID,
			}
			items[i] = item
		}

		// Bulk create items
		if err := s.mrItemRepo.CreateBulk(items); err != nil {
			return nil, err
		}
	}

	// Fetch updated MR
	mr, err = s.mrRepo.GetByID(mr.ID)
	if err != nil {
		return nil, err
	}

	return mr.ToSafe(), nil
}

// DeleteMaterialRequest deletes a material request
func (s *materialRequestService) DeleteMaterialRequest(id uint) error {
	mr, err := s.mrRepo.GetByID(id)
	if err != nil {
		return err
	}

	if mr.Status != "draft" {
		return errors.New("can only delete material requests in draft status")
	}

	return s.mrRepo.Delete(id)
}

// ApproveMaterialRequest approves a material request
func (s *materialRequestService) ApproveMaterialRequest(id uint, userID uint) (*models.SafeMaterialRequest, error) {
	mr, err := s.mrRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if mr.Status != "draft" {
		return nil, errors.New("can only approve material requests in draft status")
	}

	now := time.Now()
	if err := s.mrRepo.UpdateStatus(id, "approved", &userID, &now); err != nil {
		return nil, err
	}

	return s.GetMaterialRequestByID(id)
}

// CancelMaterialRequest cancels a material request
func (s *materialRequestService) CancelMaterialRequest(id uint) (*models.SafeMaterialRequest, error) {
	mr, err := s.mrRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if mr.Status == "cancelled" || mr.Status == "closed" {
		return nil, errors.New("cannot cancel material request in current status")
	}

	if err := s.mrRepo.UpdateStatus(id, "cancelled", nil, nil); err != nil {
		return nil, err
	}

	return s.GetMaterialRequestByID(id)
}
