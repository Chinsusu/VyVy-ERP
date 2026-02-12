package service

import (
	"errors"
	"strings"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"gorm.io/gorm"
)

type CarrierService struct {
	repo *repository.CarrierRepository
}

func NewCarrierService(repo *repository.CarrierRepository) *CarrierService {
	return &CarrierService{repo: repo}
}

func (s *CarrierService) Create(carrier *models.Carrier) error {
	carrier.Code = strings.ToUpper(strings.TrimSpace(carrier.Code))
	carrier.Name = strings.TrimSpace(carrier.Name)

	if carrier.Code == "" {
		return errors.New("carrier code is required")
	}
	if carrier.Name == "" {
		return errors.New("carrier name is required")
	}

	// Check code uniqueness
	existing, err := s.repo.GetByCode(carrier.Code)
	if err == nil && existing != nil {
		return errors.New("carrier code already exists")
	}

	return s.repo.Create(carrier)
}

func (s *CarrierService) GetByID(id uint) (*models.Carrier, error) {
	return s.repo.GetByID(id)
}

func (s *CarrierService) List(filters map[string]interface{}) ([]models.Carrier, int64, error) {
	return s.repo.List(filters)
}

func (s *CarrierService) Update(id uint, updates map[string]interface{}) (*models.Carrier, error) {
	carrier, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("carrier not found")
		}
		return nil, err
	}

	if name, ok := updates["name"]; ok {
		carrier.Name = strings.TrimSpace(name.(string))
	}
	if carrierType, ok := updates["carrier_type"]; ok {
		carrier.CarrierType = carrierType.(string)
	}
	if phone, ok := updates["contact_phone"]; ok {
		carrier.ContactPhone = phone.(string)
	}
	if email, ok := updates["contact_email"]; ok {
		carrier.ContactEmail = email.(string)
	}
	if website, ok := updates["website"]; ok {
		carrier.Website = website.(string)
	}
	if tmpl, ok := updates["tracking_url_template"]; ok {
		carrier.TrackingURLTemplate = tmpl.(string)
	}
	if config, ok := updates["shipping_fee_config"]; ok {
		carrier.ShippingFeeConfig = config.(string)
	}
	if isActive, ok := updates["is_active"]; ok {
		carrier.IsActive = isActive.(bool)
	}
	if desc, ok := updates["description"]; ok {
		carrier.Description = desc.(string)
	}

	if err := s.repo.Update(carrier); err != nil {
		return nil, err
	}

	return s.repo.GetByID(id)
}

func (s *CarrierService) Delete(id uint) error {
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("carrier not found")
		}
		return err
	}
	return s.repo.Delete(id)
}
