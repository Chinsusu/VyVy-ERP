package handlers

import (
	"net/http"
	"strconv"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/gin-gonic/gin"
)

type CarrierHandler struct {
	service *service.CarrierService
}

func NewCarrierHandler(service *service.CarrierService) *CarrierHandler {
	return &CarrierHandler{service: service}
}

type CreateCarrierRequest struct {
	Code               string `json:"code" binding:"required"`
	Name               string `json:"name" binding:"required"`
	CarrierType        string `json:"carrier_type"`
	ContactPhone       string `json:"contact_phone"`
	ContactEmail       string `json:"contact_email"`
	Website            string `json:"website"`
	TrackingURLTemplate string `json:"tracking_url_template"`
	ShippingFeeConfig  string `json:"shipping_fee_config"`
	IsActive           *bool  `json:"is_active"`
	Description        string `json:"description"`
}

type UpdateCarrierRequest struct {
	Name               *string `json:"name"`
	CarrierType        *string `json:"carrier_type"`
	ContactPhone       *string `json:"contact_phone"`
	ContactEmail       *string `json:"contact_email"`
	Website            *string `json:"website"`
	TrackingURLTemplate *string `json:"tracking_url_template"`
	ShippingFeeConfig  *string `json:"shipping_fee_config"`
	IsActive           *bool   `json:"is_active"`
	Description        *string `json:"description"`
}

func (h *CarrierHandler) Create(c *gin.Context) {
	var req CreateCarrierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	carrier := &models.Carrier{
		Code:               req.Code,
		Name:               req.Name,
		CarrierType:        req.CarrierType,
		ContactPhone:       req.ContactPhone,
		ContactEmail:       req.ContactEmail,
		Website:            req.Website,
		TrackingURLTemplate: req.TrackingURLTemplate,
		ShippingFeeConfig:  req.ShippingFeeConfig,
		Description:        req.Description,
	}

	if req.CarrierType == "" {
		carrier.CarrierType = "express"
	}

	if req.IsActive != nil {
		carrier.IsActive = *req.IsActive
	} else {
		carrier.IsActive = true
	}

	if userID, exists := c.Get("user_id"); exists {
		uid := userID.(uint)
		carrier.CreatedBy = &uid
	}

	if err := h.service.Create(carrier); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	created, _ := h.service.GetByID(carrier.ID)
	c.JSON(http.StatusCreated, gin.H{"data": created.ToSafe()})
}

func (h *CarrierHandler) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	carrier, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "carrier not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": carrier.ToSafe()})
}

func (h *CarrierHandler) List(c *gin.Context) {
	filters := map[string]interface{}{}

	if ct := c.Query("carrier_type"); ct != "" {
		filters["carrier_type"] = ct
	}
	if ia := c.Query("is_active"); ia != "" {
		filters["is_active"] = ia == "true"
	}
	if s := c.Query("search"); s != "" {
		filters["search"] = s
	}
	if offset, err := strconv.Atoi(c.Query("offset")); err == nil {
		filters["offset"] = offset
	}
	if limit, err := strconv.Atoi(c.Query("limit")); err == nil {
		filters["limit"] = limit
	}

	carriers, total, err := h.service.List(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	safeCarriers := make([]*models.SafeCarrier, len(carriers))
	for i := range carriers {
		safeCarriers[i] = carriers[i].ToSafe()
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  safeCarriers,
		"total": total,
	})
}

func (h *CarrierHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var req UpdateCarrierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.CarrierType != nil {
		updates["carrier_type"] = *req.CarrierType
	}
	if req.ContactPhone != nil {
		updates["contact_phone"] = *req.ContactPhone
	}
	if req.ContactEmail != nil {
		updates["contact_email"] = *req.ContactEmail
	}
	if req.Website != nil {
		updates["website"] = *req.Website
	}
	if req.TrackingURLTemplate != nil {
		updates["tracking_url_template"] = *req.TrackingURLTemplate
	}
	if req.ShippingFeeConfig != nil {
		updates["shipping_fee_config"] = *req.ShippingFeeConfig
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}

	carrier, err := h.service.Update(uint(id), updates)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": carrier.ToSafe()})
}

func (h *CarrierHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "carrier deleted successfully"})
}
