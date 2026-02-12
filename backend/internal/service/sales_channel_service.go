package service

import (
	"errors"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
)

// SalesChannelService defines the interface for sales channel business logic
type SalesChannelService interface {
	Create(req *dto.CreateSalesChannelRequest, userID uint) (*models.SafeSalesChannel, error)
	GetByID(id uint) (*models.SafeSalesChannel, error)
	List(filter *dto.SalesChannelFilterRequest) ([]*models.SafeSalesChannel, int64, error)
	Update(id uint, req *dto.UpdateSalesChannelRequest, userID uint) (*models.SafeSalesChannel, error)
	Delete(id uint) error
}

type salesChannelService struct {
	repo repository.SalesChannelRepository
}

// NewSalesChannelService creates a new SalesChannelService
func NewSalesChannelService(repo repository.SalesChannelRepository) SalesChannelService {
	return &salesChannelService{repo: repo}
}

func (s *salesChannelService) Create(req *dto.CreateSalesChannelRequest, userID uint) (*models.SafeSalesChannel, error) {
	// Validate platform type
	validTypes := map[string]bool{"marketplace": true, "social": true, "branch": true, "other": true}
	if !validTypes[req.PlatformType] {
		return nil, errors.New("invalid platform_type: must be marketplace, social, branch, or other")
	}

	// Check for duplicate code
	existing, _ := s.repo.GetByCode(req.Code)
	if existing != nil {
		return nil, errors.New("sales channel with this code already exists")
	}

	channel := &models.SalesChannel{
		Code:         req.Code,
		Name:         req.Name,
		PlatformType: req.PlatformType,
		IsActive:     true,
		Description:  req.Description,
		CreatedBy:    &userID,
		UpdatedBy:    &userID,
	}

	if err := s.repo.Create(channel); err != nil {
		return nil, err
	}

	// Re-fetch with preloads
	created, err := s.repo.GetByID(channel.ID)
	if err != nil {
		return nil, err
	}
	return created.ToSafe(), nil
}

func (s *salesChannelService) GetByID(id uint) (*models.SafeSalesChannel, error) {
	channel, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("sales channel not found")
	}
	return channel.ToSafe(), nil
}

func (s *salesChannelService) List(filter *dto.SalesChannelFilterRequest) ([]*models.SafeSalesChannel, int64, error) {
	channels, total, err := s.repo.List(filter.PlatformType, filter.IsActive, filter.Search, filter.Offset, filter.Limit)
	if err != nil {
		return nil, 0, err
	}

	safeChannels := make([]*models.SafeSalesChannel, len(channels))
	for i, ch := range channels {
		safeChannels[i] = ch.ToSafe()
	}

	return safeChannels, total, nil
}

func (s *salesChannelService) Update(id uint, req *dto.UpdateSalesChannelRequest, userID uint) (*models.SafeSalesChannel, error) {
	channel, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("sales channel not found")
	}

	if req.Name != "" {
		channel.Name = req.Name
	}
	if req.PlatformType != "" {
		validTypes := map[string]bool{"marketplace": true, "social": true, "branch": true, "other": true}
		if !validTypes[req.PlatformType] {
			return nil, errors.New("invalid platform_type: must be marketplace, social, branch, or other")
		}
		channel.PlatformType = req.PlatformType
	}
	if req.IsActive != nil {
		channel.IsActive = *req.IsActive
	}
	if req.Description != "" {
		channel.Description = req.Description
	}
	channel.UpdatedBy = &userID

	if err := s.repo.Update(channel); err != nil {
		return nil, err
	}

	updated, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	return updated.ToSafe(), nil
}

func (s *salesChannelService) Delete(id uint) error {
	_, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("sales channel not found")
	}
	return s.repo.Delete(id)
}
