package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

// AuditLogRepository defines the interface for audit log persistence
type AuditLogRepository interface {
	Create(log *models.AuditLog) error
	ListByRecord(tableName string, recordID int64, limit int) ([]*models.AuditLog, error)
}

type auditLogRepository struct {
	db *gorm.DB
}

// NewAuditLogRepository creates a new audit log repository
func NewAuditLogRepository(db *gorm.DB) AuditLogRepository {
	return &auditLogRepository{db: db}
}

func (r *auditLogRepository) Create(log *models.AuditLog) error {
	return r.db.Create(log).Error
}

func (r *auditLogRepository) ListByRecord(tableName string, recordID int64, limit int) ([]*models.AuditLog, error) {
	if limit <= 0 {
		limit = 50
	}
	var logs []*models.AuditLog
	err := r.db.
		Where("table_name = ? AND record_id = ?", tableName, recordID).
		Order("created_at DESC").
		Limit(limit).
		Find(&logs).Error
	if err != nil {
		return nil, err
	}
	return logs, nil
}
