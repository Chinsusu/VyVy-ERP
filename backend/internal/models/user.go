package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	Username     string     `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Email        string     `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PasswordHash string     `gorm:"size:255;not null" json:"-"` // Never expose password hash in JSON
	FullName     string     `gorm:"size:255" json:"full_name"`
	Role         string     `gorm:"size:50;not null;default:'warehouse_staff'" json:"role"`
	IsActive     *bool      `gorm:"default:true" json:"is_active"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
	CreatedBy    *int64     `json:"created_by,omitempty"`
	UpdatedAt    time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	UpdatedBy    *int64     `json:"updated_by,omitempty"`
}

// TableName specifies the table name for GORM
func (User) TableName() string {
	return "users"
}

// HashPassword hashes the given password using bcrypt
func (u *User) HashPassword(password string) error {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hashedBytes)
	return nil
}

// CheckPassword compares the given password with the stored hash
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}

// SafeUser returns user info without sensitive fields
type SafeUser struct {
	ID          int64      `json:"id"`
	Username    string     `json:"username"`
	Email       string     `json:"email"`
	FullName    string     `json:"full_name"`
	Role        string     `json:"role"`
	IsActive    *bool      `json:"is_active"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

// ToSafeUser converts User to SafeUser (removing sensitive data)
func (u *User) ToSafeUser() SafeUser {
	return SafeUser{
		ID:          u.ID,
		Username:    u.Username,
		Email:       u.Email,
		FullName:    u.FullName,
		Role:        u.Role,
		IsActive:    u.IsActive,
		LastLoginAt: u.LastLoginAt,
		CreatedAt:   u.CreatedAt,
	}
}
