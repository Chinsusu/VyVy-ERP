package handlers

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/dto"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DeliveryOrderHandler struct {
	doService service.DeliveryOrderService
}

func NewDeliveryOrderHandler(doService service.DeliveryOrderService) *DeliveryOrderHandler {
	return &DeliveryOrderHandler{doService: doService}
}

func (h *DeliveryOrderHandler) Create(c *gin.Context) {
	var req dto.CreateDeliveryOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_PAYLOAD", err.Error()))
		return
	}

	val, _ := c.Get("user_id")
	userID := val.(int64)
	do, err := h.doService.CreateDeliveryOrder(&req, uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("CREATE_FAILED", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessMessageResponse("Delivery order created successfully", do))
}

func (h *DeliveryOrderHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid ID format"))
		return
	}

	do, err := h.doService.GetDeliveryOrderByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", "Delivery order not found"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(do))
}

func (h *DeliveryOrderHandler) List(c *gin.Context) {
	var filter dto.DeliveryOrderFilterRequest
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_FILTER", err.Error()))
		return
	}

	dos, total, err := h.doService.ListDeliveryOrders(&filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("LIST_FAILED", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(gin.H{
		"items": dos,
		"total": total,
		"offset": filter.Offset,
		"limit":  filter.Limit,
	}))
}

func (h *DeliveryOrderHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid ID format"))
		return
	}

	var req dto.UpdateDeliveryOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_PAYLOAD", err.Error()))
		return
	}

	val, _ := c.Get("user_id")
	userID := val.(int64)
	do, err := h.doService.UpdateDeliveryOrder(uint(id), &req, uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("UPDATE_FAILED", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Delivery order updated successfully", do))
}

func (h *DeliveryOrderHandler) Ship(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid ID format"))
		return
	}

	var req dto.ShipDeliveryOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_PAYLOAD", err.Error()))
		return
	}

	val, _ := c.Get("user_id")
	userID := val.(int64)
	do, err := h.doService.ShipDeliveryOrder(uint(id), &req, uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("SHIP_FAILED", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Delivery order shipped successfully", do))
}

func (h *DeliveryOrderHandler) Cancel(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid ID format"))
		return
	}

	val, _ := c.Get("user_id")
	userID := val.(int64)
	do, err := h.doService.CancelDeliveryOrder(uint(id), uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("CANCEL_FAILED", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Delivery order cancelled successfully", do))
}
