package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

// JSONMap is a helper type for JSONB columns
type JSONMap map[string]interface{}

func (j JSONMap) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	b, err := json.Marshal(j)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func (j *JSONMap) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return fmt.Errorf("unsupported type: %T", value)
	}
	return json.Unmarshal(bytes, j)
}

// StringSlice for TEXT[] columns
type StringSlice []string

func (s StringSlice) Value() (driver.Value, error) {
	if s == nil {
		return nil, nil
	}
	b, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func (s *StringSlice) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return fmt.Errorf("unsupported type: %T", value)
	}
	return json.Unmarshal(bytes, s)
}

// AuditLog represents a change history record
type AuditLog struct {
	ID            int64       `gorm:"primaryKey;autoIncrement" json:"id"`
	EntityTable   string      `gorm:"column:table_name;type:varchar(100);not null;index" json:"table_name"`
	RecordID      int64       `gorm:"not null;index" json:"record_id"`
	Action        string      `gorm:"type:varchar(50);not null" json:"action"` // CREATE, UPDATE, DELETE, APPROVE, CANCEL, UPDATE_ORDER_STATUS, etc.
	OldValues     JSONMap     `gorm:"type:jsonb" json:"old_values,omitempty"`
	NewValues     JSONMap     `gorm:"type:jsonb" json:"new_values,omitempty"`
	ChangedFields StringSlice `gorm:"type:jsonb" json:"changed_fields,omitempty"`
	UserID        *int64      `json:"user_id,omitempty"`
	Username      string      `gorm:"type:varchar(100)" json:"username"`
	IPAddress     string      `gorm:"type:varchar(45)" json:"ip_address,omitempty"`
	CreatedAt     time.Time   `json:"created_at"`
}

func (AuditLog) TableName() string {
	return "audit_logs"
}
