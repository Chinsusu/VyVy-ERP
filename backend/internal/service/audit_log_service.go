package service

import (
	"encoding/json"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
)

// AuditLogService defines the interface for audit logging
type AuditLogService interface {
	Log(tableName, action string, recordID, userID int64, username string, oldValues, newValues interface{}) error
	GetHistory(tableName string, recordID int64) ([]*models.AuditLog, error)
}

type auditLogService struct {
	repo repository.AuditLogRepository
}

// NewAuditLogService creates a new audit log service
func NewAuditLogService(repo repository.AuditLogRepository) AuditLogService {
	return &auditLogService{repo: repo}
}

// Log records an audit entry, computing changed_fields by comparing old vs new JSON
func (s *auditLogService) Log(tableName, action string, recordID, userID int64, username string, oldValues, newValues interface{}) error {
	entry := &models.AuditLog{
		EntityTable: tableName,
		RecordID:    recordID,
		Action:      action,
		Username:    username,
	}

	if userID > 0 {
		entry.UserID = &userID
	}

	// Serialize old/new values
	oldMap, _ := toJSONMap(oldValues)
	newMap, _ := toJSONMap(newValues)

	entry.OldValues = oldMap
	entry.NewValues = newMap

	// Compute changed fields (for UPDATE)
	if action == "UPDATE" && oldMap != nil && newMap != nil {
		entry.ChangedFields = computeChangedFields(oldMap, newMap)
	}

	return s.repo.Create(entry)
}

// GetHistory returns the audit trail for a record
func (s *auditLogService) GetHistory(tableName string, recordID int64) ([]*models.AuditLog, error) {
	return s.repo.ListByRecord(tableName, recordID, 100)
}

// toJSONMap converts any struct to a JSONMap via JSON marshal/unmarshal
func toJSONMap(v interface{}) (models.JSONMap, error) {
	if v == nil {
		return nil, nil
	}
	b, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	var m models.JSONMap
	if err := json.Unmarshal(b, &m); err != nil {
		return nil, err
	}
	return m, nil
}

// computeChangedFields returns the list of field keys where old != new
func computeChangedFields(old, new models.JSONMap) models.StringSlice {
	var changed []string
	for k, newVal := range new {
		oldVal, exists := old[k]
		if !exists {
			changed = append(changed, k)
			continue
		}
		// Compare via JSON representation
		oldJSON, _ := json.Marshal(oldVal)
		newJSON, _ := json.Marshal(newVal)
		if string(oldJSON) != string(newJSON) {
			changed = append(changed, k)
		}
	}
	return changed
}
