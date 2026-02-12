package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/gin-gonic/gin"
)

type ReconciliationHandler struct {
	service *service.ReconciliationService
}

func NewReconciliationHandler(service *service.ReconciliationService) *ReconciliationHandler {
	return &ReconciliationHandler{service: service}
}

type CreateReconciliationRequest struct {
	CarrierID   uint   `json:"carrier_id" binding:"required"`
	PeriodStart string `json:"period_start"` // YYYY-MM-DD
	PeriodEnd   string `json:"period_end"`   // YYYY-MM-DD
	Notes       string `json:"notes"`
}

func (h *ReconciliationHandler) Create(c *gin.Context) {
	var req CreateReconciliationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recon := &models.ShippingReconciliation{
		CarrierID: req.CarrierID,
		Notes:     req.Notes,
	}

	if req.PeriodStart != "" {
		if t, err := time.Parse("2006-01-02", req.PeriodStart); err == nil {
			recon.PeriodStart = &t
		}
	}
	if req.PeriodEnd != "" {
		if t, err := time.Parse("2006-01-02", req.PeriodEnd); err == nil {
			recon.PeriodEnd = &t
		}
	}

	if userID, exists := c.Get("user_id"); exists {
		uid := userID.(uint)
		recon.CreatedBy = &uid
	}

	if err := h.service.Create(recon); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	created, _ := h.service.GetByID(recon.ID)
	c.JSON(http.StatusCreated, gin.H{"data": created.ToSafe()})
}

func (h *ReconciliationHandler) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	recon, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "reconciliation not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": recon.ToSafe()})
}

func (h *ReconciliationHandler) List(c *gin.Context) {
	filters := map[string]interface{}{}

	if carrierID, err := strconv.Atoi(c.Query("carrier_id")); err == nil {
		filters["carrier_id"] = carrierID
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if offset, err := strconv.Atoi(c.Query("offset")); err == nil {
		filters["offset"] = offset
	}
	if limit, err := strconv.Atoi(c.Query("limit")); err == nil {
		filters["limit"] = limit
	}

	recons, total, err := h.service.List(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	safeRecons := make([]*models.SafeShippingReconciliation, len(recons))
	for i := range recons {
		safeRecons[i] = recons[i].ToSafe()
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  safeRecons,
		"total": total,
	})
}

type AddItemsRequest struct {
	Items []service.AddReconciliationItemInput `json:"items" binding:"required"`
}

func (h *ReconciliationHandler) AddItems(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var req AddItemsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.AddItems(uint(id), req.Items); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, _ := h.service.GetByID(uint(id))
	c.JSON(http.StatusOK, gin.H{"data": updated.ToSafe()})
}

func (h *ReconciliationHandler) Confirm(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	if err := h.service.Confirm(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, _ := h.service.GetByID(uint(id))
	c.JSON(http.StatusOK, gin.H{"data": updated.ToSafe()})
}

func (h *ReconciliationHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "reconciliation deleted successfully"})
}
