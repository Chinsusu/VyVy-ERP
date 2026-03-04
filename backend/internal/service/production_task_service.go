package service

import (
	"errors"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
)

// ProductionTaskService defines the interface for production task business logic
type ProductionTaskService interface {
	CreateTask(task *models.ProductionTask) (*models.SafeProductionTask, error)
	UpdateTask(id int64, task *models.ProductionTask) (*models.SafeProductionTask, error)
	DeleteTask(id int64) error
	GetTask(id int64) (*models.SafeProductionTask, error)
	ListTasks(mrID uint) ([]*models.SafeProductionTask, error)
}

type productionTaskService struct {
	repo repository.ProductionTaskRepository
}

// NewProductionTaskService creates a new production task service
func NewProductionTaskService(repo repository.ProductionTaskRepository) ProductionTaskService {
	return &productionTaskService{repo: repo}
}

func (s *productionTaskService) CreateTask(task *models.ProductionTask) (*models.SafeProductionTask, error) {
	if task.TaskName == "" {
		return nil, errors.New("task_name is required")
	}
	if task.MaterialRequestID == 0 {
		return nil, errors.New("material_request_id is required")
	}
	if task.ProgressPercent < 0 || task.ProgressPercent > 100 {
		return nil, errors.New("progress_percent must be between 0 and 100")
	}
	if task.Status == "" {
		task.Status = "pending"
	}

	if err := s.repo.Create(task); err != nil {
		return nil, err
	}

	// Reload with preloaded relationships
	created, err := s.repo.GetByID(task.ID)
	if err != nil {
		return nil, err
	}
	return created.ToSafe(), nil
}

func (s *productionTaskService) UpdateTask(id int64, updates *models.ProductionTask) (*models.SafeProductionTask, error) {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("task not found")
	}

	// Apply updates
	if updates.TaskName != "" {
		existing.TaskName = updates.TaskName
	}
	if updates.Category != "" {
		existing.Category = updates.Category
	}
	if updates.Description != "" {
		existing.Description = updates.Description
	}
	if updates.AssignedTo != nil {
		existing.AssignedTo = updates.AssignedTo
	}
	if updates.PlannedStart != nil {
		existing.PlannedStart = updates.PlannedStart
	}
	if updates.PlannedEnd != nil {
		existing.PlannedEnd = updates.PlannedEnd
	}
	if updates.ActualStart != nil {
		existing.ActualStart = updates.ActualStart
	}
	if updates.ActualEnd != nil {
		existing.ActualEnd = updates.ActualEnd
	}
	if updates.Status != "" {
		existing.Status = updates.Status
	}
	if updates.ProgressPercent >= 0 && updates.ProgressPercent <= 100 {
		existing.ProgressPercent = updates.ProgressPercent
	}
	if updates.SortOrder > 0 {
		existing.SortOrder = updates.SortOrder
	}
	if updates.Notes != "" {
		existing.Notes = updates.Notes
	}
	existing.UpdatedBy = updates.UpdatedBy

	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}

	// Reload
	updated, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	return updated.ToSafe(), nil
}

func (s *productionTaskService) DeleteTask(id int64) error {
	_, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("task not found")
	}
	return s.repo.Delete(id)
}

func (s *productionTaskService) GetTask(id int64) (*models.SafeProductionTask, error) {
	task, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("task not found")
	}
	return task.ToSafe(), nil
}

func (s *productionTaskService) ListTasks(mrID uint) ([]*models.SafeProductionTask, error) {
	tasks, err := s.repo.ListByMaterialRequest(mrID)
	if err != nil {
		return nil, err
	}

	safeTasks := make([]*models.SafeProductionTask, len(tasks))
	for i, t := range tasks {
		safeTasks[i] = t.ToSafe()
	}
	return safeTasks, nil
}
