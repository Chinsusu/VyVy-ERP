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

type DeliveryOrderService interface {
	CreateDeliveryOrder(req *dto.CreateDeliveryOrderRequest, userID uint) (*models.SafeDeliveryOrder, error)
	GetDeliveryOrderByID(id uint) (*models.SafeDeliveryOrder, error)
	ListDeliveryOrders(filter *dto.DeliveryOrderFilterRequest) ([]*models.SafeDeliveryOrder, int64, error)
	UpdateDeliveryOrder(id uint, req *dto.UpdateDeliveryOrderRequest, userID uint) (*models.SafeDeliveryOrder, error)
	ShipDeliveryOrder(id uint, req *dto.ShipDeliveryOrderRequest, userID uint) (*models.SafeDeliveryOrder, error)
	CancelDeliveryOrder(id uint, userID uint) (*models.SafeDeliveryOrder, error)
}

type deliveryOrderService struct {
	db                  *gorm.DB
	doRepo              repository.DeliveryOrderRepository
	warehouseRepo       repository.WarehouseRepository
	finishedProductRepo repository.FinishedProductRepository
	stockRepo           repository.StockBalanceRepository
	reservationRepo     repository.StockReservationRepository
}

func NewDeliveryOrderService(
	db *gorm.DB,
	doRepo repository.DeliveryOrderRepository,
	warehouseRepo repository.WarehouseRepository,
	finishedProductRepo repository.FinishedProductRepository,
	stockRepo repository.StockBalanceRepository,
	reservationRepo repository.StockReservationRepository,
) DeliveryOrderService {
	return &deliveryOrderService{
		db:                  db,
		doRepo:              doRepo,
		warehouseRepo:       warehouseRepo,
		finishedProductRepo: finishedProductRepo,
		stockRepo:           stockRepo,
		reservationRepo:     reservationRepo,
	}
}

func (s *deliveryOrderService) CreateDeliveryOrder(req *dto.CreateDeliveryOrderRequest, userID uint) (*models.SafeDeliveryOrder, error) {
	// 1. Validate warehouse
	_, err := s.warehouseRepo.GetByID(req.WarehouseID)
	if err != nil {
		return nil, errors.New("warehouse not found")
	}

	// 2. Map date
	deliveryDate, err := time.Parse("2006-01-02", req.DeliveryDate)
	if err != nil {
		return nil, errors.New("invalid delivery date format, use YYYY-MM-DD")
	}

	// 3. Generate DO number: DO-YYYY-XXXXXX
	year := time.Now().Format("2006")
	var count int64
	s.db.Model(&models.DeliveryOrder{}).Where("do_number LIKE ?", "DO-"+year+"-%").Count(&count)
	doNumber := fmt.Sprintf("DO-%s-%06d", year, count+1)

	// 4. Create DO model
	do := &models.DeliveryOrder{
		DONumber:        doNumber,
		WarehouseID:     req.WarehouseID,
		CustomerName:    req.CustomerName,
		CustomerAddress: req.CustomerAddress,
		DeliveryDate:    deliveryDate,
		ShippingMethod:  req.ShippingMethod,
		SalesChannelID:  req.SalesChannelID,
		Notes:           req.Notes,
		Status:          "draft",
		CreatedBy:       &userID,
		UpdatedBy:       &userID,
	}

	// 5. Create Items
	items := make([]models.DeliveryOrderItem, len(req.Items))
	for i, itemReq := range req.Items {
		// Validate product
		_, err := s.finishedProductRepo.GetByID(itemReq.FinishedProductID)
		if err != nil {
			return nil, fmt.Errorf("finished product %d not found", itemReq.FinishedProductID)
		}

		items[i] = models.DeliveryOrderItem{
			FinishedProductID: itemReq.FinishedProductID,
			WarehouseLocationID: itemReq.WarehouseLocationID,
			BatchNumber:       itemReq.BatchNumber,
			LotNumber:         itemReq.LotNumber,
			Quantity:          itemReq.Quantity,
			Notes:             itemReq.Notes,
			CreatedBy:         &userID,
			UpdatedBy:         &userID,
		}
	}
	do.Items = items

	// 6. Save in DB
	if err := s.doRepo.Create(do); err != nil {
		return nil, err
	}

	return s.GetDeliveryOrderByID(do.ID)
}

func (s *deliveryOrderService) GetDeliveryOrderByID(id uint) (*models.SafeDeliveryOrder, error) {
	do, err := s.doRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	return do.ToSafe(), nil
}

func (s *deliveryOrderService) ListDeliveryOrders(filter *dto.DeliveryOrderFilterRequest) ([]*models.SafeDeliveryOrder, int64, error) {
	filters := make(map[string]interface{})
	if filter.WarehouseID > 0 {
		filters["warehouse_id"] = filter.WarehouseID
	}
	if filter.Status != "" {
		filters["status"] = filter.Status
	}
	if filter.DONumber != "" {
		filters["do_number"] = filter.DONumber
	}
	if filter.CustomerName != "" {
		filters["customer_name"] = filter.CustomerName
	}
	if filter.SalesChannelID > 0 {
		filters["sales_channel_id"] = filter.SalesChannelID
	}

	dos, total, err := s.doRepo.List(filters, filter.Offset, filter.Limit)
	if err != nil {
		return nil, 0, err
	}

	safeDOs := make([]*models.SafeDeliveryOrder, len(dos))
	for i, do := range dos {
		safeDOs[i] = do.ToSafe()
	}

	return safeDOs, total, nil
}

func (s *deliveryOrderService) UpdateDeliveryOrder(id uint, req *dto.UpdateDeliveryOrderRequest, userID uint) (*models.SafeDeliveryOrder, error) {
	do, err := s.doRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if do.IsPosted {
		return nil, errors.New("cannot update a posted delivery order")
	}

	// Update fields
	if req.CustomerName != "" {
		do.CustomerName = req.CustomerName
	}
	if req.CustomerAddress != "" {
		do.CustomerAddress = req.CustomerAddress
	}
	if req.DeliveryDate != "" {
		deliveryDate, err := time.Parse("2006-01-02", req.DeliveryDate)
		if err == nil {
			do.DeliveryDate = deliveryDate
		}
	}
	if req.ShippingMethod != "" {
		do.ShippingMethod = req.ShippingMethod
	}
	if req.TrackingNumber != "" {
		do.TrackingNumber = req.TrackingNumber
	}
	if req.Notes != "" {
		do.Notes = req.Notes
	}
	if req.SalesChannelID != nil {
		do.SalesChannelID = req.SalesChannelID
	}

	do.UpdatedBy = &userID

	// If items are provided, replace them
	if len(req.Items) > 0 {
		// Start a transaction to replace items
		err = s.db.Transaction(func(tx *gorm.DB) error {
			// Delete old items
			if err := tx.Where("delivery_order_id = ?", id).Delete(&models.DeliveryOrderItem{}).Error; err != nil {
				return err
			}

			// Add new items
			for _, itemReq := range req.Items {
				item := models.DeliveryOrderItem{
					DeliveryOrderID:   id,
					FinishedProductID: itemReq.FinishedProductID,
					WarehouseLocationID: itemReq.WarehouseLocationID,
					BatchNumber:       itemReq.BatchNumber,
					LotNumber:         itemReq.LotNumber,
					Quantity:          itemReq.Quantity,
					Notes:             itemReq.Notes,
					CreatedBy:         &userID,
					UpdatedBy:         &userID,
				}
				if err := tx.Create(&item).Error; err != nil {
					return err
				}
			}
			return nil
		})
		if err != nil {
			return nil, err
		}
	}

	if err := s.doRepo.Update(do); err != nil {
		return nil, err
	}

	return s.GetDeliveryOrderByID(id)
}

func (s *deliveryOrderService) ShipDeliveryOrder(id uint, req *dto.ShipDeliveryOrderRequest, userID uint) (*models.SafeDeliveryOrder, error) {
	do, err := s.doRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if do.IsPosted {
		return nil, errors.New("delivery order is already shipped")
	}

	if do.Status == "cancelled" {
		return nil, errors.New("cannot ship a cancelled delivery order")
	}

	now := time.Now()
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Update each item and stock
		for i, item := range do.Items {
			// Get stock balance
			var balance models.StockBalance
			query := tx.Where("item_type = ? AND item_id = ? AND warehouse_id = ?", "finished_product", item.FinishedProductID, do.WarehouseID)
			
			if item.WarehouseLocationID != nil {
				query = query.Where("warehouse_location_id = ?", *item.WarehouseLocationID)
			} else {
				query = query.Where("warehouse_location_id IS NULL")
			}
			
			if item.BatchNumber != "" {
				query = query.Where("batch_number = ?", item.BatchNumber)
			}
			
			if err := query.First(&balance).Error; err != nil {
				return fmt.Errorf("insufficient stock for product %d in specified batch/location", item.FinishedProductID)
			}

			if balance.Quantity < item.Quantity {
				return fmt.Errorf("insufficient physical stock for product %d", item.FinishedProductID)
			}

			// Create ledger entry
			// Get previous balance for this product in this warehouse
			var prevBalance float64
			tx.Table("stock_ledger").
				Select("balance_quantity").
				Where("item_type = ? AND item_id = ? AND warehouse_id = ?", "finished_product", item.FinishedProductID, do.WarehouseID).
				Order("created_at DESC, id DESC").
				Limit(1).
				Row().Scan(&prevBalance)
			
			newBalance := prevBalance - item.Quantity

			ledger := models.StockLedger{
				TransactionType:   "issue", // Outward
				TransactionNumber: do.DONumber,
				TransactionDate:   now,
				ItemType:          "finished_product",
				ItemID:            item.FinishedProductID,
				WarehouseID:       do.WarehouseID,
				WarehouseLocationID: item.WarehouseLocationID,
				BatchNumber:       item.BatchNumber,
				LotNumber:         item.LotNumber,
				Quantity:          -item.Quantity,
				UnitCost:          balance.UnitCost,
				TotalCost:         -item.Quantity * balance.UnitCost,
				BalanceQuantity:   newBalance,
				ReferenceType:     "DO",
				ReferenceID:       do.ID,
				CreatedBy:         &userID,
			}
			if err := tx.Create(&ledger).Error; err != nil {
				return err
			}

			// Update stock balance
			balance.Quantity -= item.Quantity
			balance.TotalCost = balance.Quantity * balance.UnitCost
			balance.LastTransactionDate = &now
			if err := tx.Save(&balance).Error; err != nil {
				return err
			}

			// Record cost in item
			do.Items[i].UnitCost = &balance.UnitCost
			if err := tx.Save(&do.Items[i]).Error; err != nil {
				return err
			}
		}

		// 2. Update DO status
		do.Status = "shipped"
		do.IsPosted = true
		do.PostedBy = &userID
		do.PostedAt = &now
		if req.TrackingNumber != "" {
			do.TrackingNumber = req.TrackingNumber
		}
		if req.Notes != "" {
			do.Notes = req.Notes
		}
		
		if err := tx.Save(do).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.GetDeliveryOrderByID(id)
}

func (s *deliveryOrderService) CancelDeliveryOrder(id uint, userID uint) (*models.SafeDeliveryOrder, error) {
	do, err := s.doRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if do.IsPosted {
		return nil, errors.New("cannot cancel a shipped delivery order")
	}

	do.Status = "cancelled"
	do.UpdatedBy = &userID
	if err := s.doRepo.Update(do); err != nil {
		return nil, err
	}

	return s.MapToSafe(do), nil
}

// Helper (simple mapping if needed, but repository already preloads)
func (s *deliveryOrderService) MapToSafe(do *models.DeliveryOrder) *models.SafeDeliveryOrder {
	return do.ToSafe()
}
