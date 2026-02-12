package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"gorm.io/gorm"
)

type ReturnOrderService struct {
	roRepo *repository.ReturnOrderRepository
	doRepo repository.DeliveryOrderRepository
	db     *gorm.DB
}

func NewReturnOrderService(db *gorm.DB, roRepo *repository.ReturnOrderRepository, doRepo repository.DeliveryOrderRepository) *ReturnOrderService {
	return &ReturnOrderService{
		roRepo: roRepo,
		doRepo: doRepo,
		db:     db,
	}
}

func (s *ReturnOrderService) generateReturnNumber() string {
	now := time.Now()
	lastNum, _ := s.roRepo.GetLastReturnNumber()
	seq := 1
	if lastNum != "" {
		// Parse last sequence number
		fmt.Sscanf(lastNum, "RT-%d-%d", new(int), &seq)
		seq++
	}
	return fmt.Sprintf("RT-%s-%03d", now.Format("20060102"), seq)
}

func (s *ReturnOrderService) Create(req dto.CreateReturnOrderRequest, userID uint) (*models.ReturnOrderSafeDTO, error) {
	// Validate DO exists and is shipped/delivered
	do, err := s.doRepo.GetByID(req.DeliveryOrderID)
	if err != nil {
		return nil, errors.New("delivery order not found")
	}
	if do.Status != "shipped" && do.Status != "delivered" {
		return nil, fmt.Errorf("cannot create return for DO with status '%s', must be shipped or delivered", do.Status)
	}

	returnDate := time.Now()
	if req.ReturnDate != "" {
		parsed, err := time.Parse("2006-01-02", req.ReturnDate)
		if err == nil {
			returnDate = parsed
		}
	}

	returnType := "customer_return"
	if req.ReturnType != "" {
		returnType = req.ReturnType
	}

	ro := models.ReturnOrder{
		ReturnNumber:    s.generateReturnNumber(),
		DeliveryOrderID: req.DeliveryOrderID,
		CarrierID:       req.CarrierID,
		ReturnType:      returnType,
		Status:          "pending",
		ReturnDate:      returnDate,
		TrackingNumber:  req.TrackingNumber,
		Reason:          req.Reason,
		Resolution:      req.Resolution,
		Notes:           req.Notes,
		TotalItems:      0,
		CreatedBy:       &userID,
		UpdatedBy:       &userID,
	}

	// Create items
	totalItems := 0
	for _, item := range req.Items {
		roItem := models.ReturnOrderItem{
			DeliveryOrderItemID: item.DeliveryOrderItemID,
			FinishedProductID:   item.FinishedProductID,
			QuantityReturned:    item.QuantityReturned,
			Condition:           "pending_inspection",
			Reason:              item.Reason,
			Notes:               item.Notes,
		}
		ro.Items = append(ro.Items, roItem)
		totalItems += item.QuantityReturned
	}
	ro.TotalItems = totalItems

	if err := s.roRepo.Create(&ro); err != nil {
		return nil, err
	}

	// Reload with preloads
	created, err := s.roRepo.GetByID(ro.ID)
	if err != nil {
		return nil, err
	}
	safe := created.ToSafe()
	return &safe, nil
}

func (s *ReturnOrderService) GetByID(id uint) (*models.ReturnOrderSafeDTO, error) {
	ro, err := s.roRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	safe := ro.ToSafe()
	return &safe, nil
}

func (s *ReturnOrderService) List(filter dto.ReturnOrderFilter) ([]models.ReturnOrderSafeDTO, int64, error) {
	filters := make(map[string]interface{})
	if filter.Status != "" {
		filters["status"] = filter.Status
	}
	if filter.ReturnType != "" {
		filters["return_type"] = filter.ReturnType
	}
	if filter.DeliveryOrderID > 0 {
		filters["delivery_order_id"] = filter.DeliveryOrderID
	}

	ros, total, err := s.roRepo.List(filters, filter.Offset, filter.Limit)
	if err != nil {
		return nil, 0, err
	}

	var safeDTOs []models.ReturnOrderSafeDTO
	for _, ro := range ros {
		safeDTOs = append(safeDTOs, ro.ToSafe())
	}
	return safeDTOs, total, nil
}

func (s *ReturnOrderService) Update(id uint, req dto.UpdateReturnOrderRequest, userID uint) (*models.ReturnOrderSafeDTO, error) {
	ro, err := s.roRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if ro.Status != "pending" {
		return nil, errors.New("can only update return orders in pending status")
	}

	if req.CarrierID != nil {
		ro.CarrierID = req.CarrierID
	}
	if req.ReturnType != nil {
		ro.ReturnType = *req.ReturnType
	}
	if req.TrackingNumber != nil {
		ro.TrackingNumber = *req.TrackingNumber
	}
	if req.Reason != nil {
		ro.Reason = *req.Reason
	}
	if req.Resolution != nil {
		ro.Resolution = *req.Resolution
	}
	if req.RefundAmount != nil {
		ro.RefundAmount = *req.RefundAmount
	}
	if req.Notes != nil {
		ro.Notes = *req.Notes
	}
	ro.UpdatedBy = &userID

	if err := s.roRepo.Update(ro); err != nil {
		return nil, err
	}

	updated, _ := s.roRepo.GetByID(id)
	safe := updated.ToSafe()
	return &safe, nil
}

func (s *ReturnOrderService) Delete(id uint) error {
	ro, err := s.roRepo.GetByID(id)
	if err != nil {
		return err
	}
	if ro.Status != "pending" && ro.Status != "cancelled" {
		return errors.New("can only delete return orders in pending or cancelled status")
	}
	return s.roRepo.Delete(id)
}

func (s *ReturnOrderService) Approve(id uint, userID uint) (*models.ReturnOrderSafeDTO, error) {
	ro, err := s.roRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if ro.Status != "pending" {
		return nil, fmt.Errorf("cannot approve return order with status '%s'", ro.Status)
	}

	ro.Status = "approved"
	ro.UpdatedBy = &userID
	if err := s.roRepo.Update(ro); err != nil {
		return nil, err
	}

	updated, _ := s.roRepo.GetByID(id)
	safe := updated.ToSafe()
	return &safe, nil
}

func (s *ReturnOrderService) Receive(id uint, userID uint) (*models.ReturnOrderSafeDTO, error) {
	ro, err := s.roRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if ro.Status != "approved" {
		return nil, fmt.Errorf("cannot receive return order with status '%s', must be approved", ro.Status)
	}

	ro.Status = "receiving"
	ro.UpdatedBy = &userID
	if err := s.roRepo.Update(ro); err != nil {
		return nil, err
	}

	updated, _ := s.roRepo.GetByID(id)
	safe := updated.ToSafe()
	return &safe, nil
}

func (s *ReturnOrderService) InspectItem(roID, itemID uint, req dto.InspectItemRequest, userID uint) (*models.ReturnOrderSafeDTO, error) {
	ro, err := s.roRepo.GetByID(roID)
	if err != nil {
		return nil, err
	}
	if ro.Status != "receiving" && ro.Status != "inspecting" {
		return nil, fmt.Errorf("cannot inspect items with status '%s', must be receiving or inspecting", ro.Status)
	}

	item, err := s.roRepo.GetItemByID(itemID)
	if err != nil {
		return nil, errors.New("return order item not found")
	}
	if item.ReturnOrderID != roID {
		return nil, errors.New("item does not belong to this return order")
	}

	// Validate quantities
	if req.QuantityRestocked+req.QuantityScrapped > item.QuantityReturned {
		return nil, fmt.Errorf("restocked (%d) + scrapped (%d) cannot exceed returned (%d)",
			req.QuantityRestocked, req.QuantityScrapped, item.QuantityReturned)
	}

	item.Condition = req.Condition
	item.QuantityRestocked = req.QuantityRestocked
	item.QuantityScrapped = req.QuantityScrapped
	item.WarehouseID = req.WarehouseID
	item.Notes = req.Notes

	if err := s.roRepo.UpdateItem(item); err != nil {
		return nil, err
	}

	// Update RO status to inspecting if not already
	if ro.Status == "receiving" {
		ro.Status = "inspecting"
		ro.UpdatedBy = &userID
		s.roRepo.Update(ro)
	}

	updated, _ := s.roRepo.GetByID(roID)
	safe := updated.ToSafe()
	return &safe, nil
}

func (s *ReturnOrderService) Complete(id uint, userID uint) (*models.ReturnOrderSafeDTO, error) {
	ro, err := s.roRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if ro.Status != "inspecting" && ro.Status != "receiving" {
		return nil, fmt.Errorf("cannot complete return order with status '%s'", ro.Status)
	}

	// Check all items have been inspected
	for _, item := range ro.Items {
		if item.Condition == "pending_inspection" {
			return nil, errors.New("all items must be inspected before completing the return order")
		}
	}

	// Calculate totals
	totalRestocked := 0
	totalScrapped := 0
	for _, item := range ro.Items {
		totalRestocked += item.QuantityRestocked
		totalScrapped += item.QuantityScrapped
	}

	ro.Status = "completed"
	ro.TotalRestocked = totalRestocked
	ro.TotalScrapped = totalScrapped
	ro.UpdatedBy = &userID

	if err := s.roRepo.Update(ro); err != nil {
		return nil, err
	}

	updated, _ := s.roRepo.GetByID(id)
	safe := updated.ToSafe()
	return &safe, nil
}

func (s *ReturnOrderService) Cancel(id uint, userID uint) (*models.ReturnOrderSafeDTO, error) {
	ro, err := s.roRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if ro.Status == "completed" || ro.Status == "cancelled" {
		return nil, fmt.Errorf("cannot cancel return order with status '%s'", ro.Status)
	}

	ro.Status = "cancelled"
	ro.UpdatedBy = &userID
	if err := s.roRepo.Update(ro); err != nil {
		return nil, err
	}

	updated, _ := s.roRepo.GetByID(id)
	safe := updated.ToSafe()
	return &safe, nil
}
