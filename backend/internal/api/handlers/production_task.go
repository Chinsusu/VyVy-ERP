package handlers

import (
	"net/http"
	"strconv"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// ProductionTaskHandler handles production task HTTP requests
type ProductionTaskHandler struct {
	service service.ProductionTaskService
}

// NewProductionTaskHandler creates a new production task handler
func NewProductionTaskHandler(svc service.ProductionTaskService) *ProductionTaskHandler {
	return &ProductionTaskHandler{service: svc}
}

// CreateTaskRequest represents the request body for creating a task
type CreateTaskRequest struct {
	Category     string `json:"category"`
	TaskName     string `json:"task_name" binding:"required"`
	Description  string `json:"description"`
	AssignedTo   *int64 `json:"assigned_to"`
	PlannedStart string `json:"planned_start"`
	PlannedEnd   string `json:"planned_end"`
	ActualStart  string `json:"actual_start"`
	ActualEnd    string `json:"actual_end"`
	Status       string `json:"status"`
	Progress     int    `json:"progress_percent"`
	SortOrder    int    `json:"sort_order"`
	Notes        string `json:"notes"`
}

// UpdateTaskRequest represents the request body for updating a task
type UpdateTaskRequest struct {
	Category     string `json:"category"`
	TaskName     string `json:"task_name"`
	Description  string `json:"description"`
	AssignedTo   *int64 `json:"assigned_to"`
	PlannedStart string `json:"planned_start"`
	PlannedEnd   string `json:"planned_end"`
	ActualStart  string `json:"actual_start"`
	ActualEnd    string `json:"actual_end"`
	Status       string `json:"status"`
	Progress     int    `json:"progress_percent"`
	SortOrder    int    `json:"sort_order"`
	Notes        string `json:"notes"`
}

// List returns all tasks for a material request
// GET /api/v1/material-requests/:id/tasks
func (h *ProductionTaskHandler) List(c *gin.Context) {
	mrIDStr := c.Param("id")
	mrID, err := strconv.ParseUint(mrIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	tasks, err := h.service.ListTasks(uint(mrID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(tasks))
}

// Create adds a new task to a material request
// POST /api/v1/material-requests/:id/tasks
func (h *ProductionTaskHandler) Create(c *gin.Context) {
	mrIDStr := c.Param("id")
	mrID, err := strconv.ParseUint(mrIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid material request ID"))
		return
	}

	var req CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	userID, _ := c.Get("userID")
	uid := userID.(int64)

	task := &models.ProductionTask{
		MaterialRequestID: uint(mrID),
		Category:          req.Category,
		TaskName:          req.TaskName,
		Description:       req.Description,
		AssignedTo:        req.AssignedTo,
		Status:            req.Status,
		ProgressPercent:   req.Progress,
		SortOrder:         req.SortOrder,
		Notes:             req.Notes,
		CreatedBy:         &uid,
		UpdatedBy:         &uid,
	}

	if task.Category == "" {
		task.Category = "other"
	}
	if task.Status == "" {
		task.Status = "pending"
	}

	if req.PlannedStart != "" {
		task.PlannedStart = &req.PlannedStart
	}
	if req.PlannedEnd != "" {
		task.PlannedEnd = &req.PlannedEnd
	}
	if req.ActualStart != "" {
		task.ActualStart = &req.ActualStart
	}
	if req.ActualEnd != "" {
		task.ActualEnd = &req.ActualEnd
	}

	result, err := h.service.CreateTask(task)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("CREATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(result))
}

// Update modifies an existing task
// PUT /api/v1/material-requests/:id/tasks/:taskId
func (h *ProductionTaskHandler) Update(c *gin.Context) {
	taskIDStr := c.Param("taskId")
	taskID, err := strconv.ParseInt(taskIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid task ID"))
		return
	}

	var req UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("VALIDATION_ERROR", err.Error()))
		return
	}

	userID, _ := c.Get("userID")
	uid := userID.(int64)

	updates := &models.ProductionTask{
		Category:        req.Category,
		TaskName:        req.TaskName,
		Description:     req.Description,
		AssignedTo:      req.AssignedTo,
		Status:          req.Status,
		ProgressPercent: req.Progress,
		SortOrder:       req.SortOrder,
		Notes:           req.Notes,
		UpdatedBy:       &uid,
	}

	if req.PlannedStart != "" {
		updates.PlannedStart = &req.PlannedStart
	}
	if req.PlannedEnd != "" {
		updates.PlannedEnd = &req.PlannedEnd
	}
	if req.ActualStart != "" {
		updates.ActualStart = &req.ActualStart
	}
	if req.ActualEnd != "" {
		updates.ActualEnd = &req.ActualEnd
	}

	result, err := h.service.UpdateTask(taskID, updates)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("UPDATE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(result))
}

// Delete removes a task
// DELETE /api/v1/material-requests/:id/tasks/:taskId
func (h *ProductionTaskHandler) Delete(c *gin.Context) {
	taskIDStr := c.Param("taskId")
	taskID, err := strconv.ParseInt(taskIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid task ID"))
		return
	}

	if err := h.service.DeleteTask(taskID); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(nil))
}
