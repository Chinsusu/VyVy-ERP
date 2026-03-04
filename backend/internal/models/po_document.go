package models

import "time"

// PODocument represents an uploaded document for a purchase order
type PODocument struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	POID         uint      `json:"po_id" gorm:"column:po_id;not null;index"`
	FileName     string    `json:"file_name" gorm:"not null"`     // stored name on disk
	OriginalName string    `json:"original_name" gorm:"not null"` // user's original filename
	FileSize     int64     `json:"file_size" gorm:"not null"`
	MimeType     string    `json:"mime_type" gorm:"not null"`
	UploadedBy   *uint     `json:"uploaded_by"`
	UploadedByUser *User   `json:"uploaded_by_user,omitempty" gorm:"foreignKey:UploadedBy"`
	CreatedAt    time.Time `json:"created_at"`
}

func (PODocument) TableName() string { return "po_documents" }
