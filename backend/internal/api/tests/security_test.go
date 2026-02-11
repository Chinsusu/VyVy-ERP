package tests

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func createTestUserWithRole(t *testing.T, db *gorm.DB, email, password, role string) *models.User {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	assert.NoError(t, err)

	isActive := true
	user := &models.User{
		Username:     "user_" + role,
		Email:        email,
		PasswordHash: string(hashedPassword),
		Role:         role,
		IsActive:     &isActive,
	}
	err = db.Create(user).Error
	assert.NoError(t, err)
	return user
}

func TestUnauthorizedAccess(t *testing.T) {
	router, _, cleanup := setupTestApp(t)
	defer cleanup()

	// Should fail: GET /materials without token
	w := performRequest(router, "GET", "/api/v1/materials", nil, nil)
	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	errObj := resp["error"].(map[string]interface{})
	assert.Equal(t, "MISSING_TOKEN", errObj["code"])
}

func TestRBACAccessControl(t *testing.T) {
	router, db, cleanup := setupTestApp(t)
	defer cleanup()

	// 1. Create a Warehouse Staff user (regular user)
	staffEmail := "staff@example.com"
	password := "password123"
	createTestUserWithRole(t, db, staffEmail, password, "warehouse_staff")
	staffToken := login(t, router, staffEmail, password)
	staffHeader := map[string]string{"Authorization": "Bearer " + staffToken}

	// 2. Try to Delete a Material (Should be Forbidden - require admin)
	w := performRequest(router, "DELETE", "/api/v1/materials/1", nil, staffHeader)
	assert.Equal(t, http.StatusForbidden, w.Code)

	// 3. Try to Approve a PO (Should be Forbidden - require procurement_manager)
	w = performRequest(router, "POST", "/api/v1/purchase-orders/1/approve", nil, staffHeader)
	assert.Equal(t, http.StatusForbidden, w.Code)

	// 4. Create a Procurement Manager user
	mgrEmail := "manager@example.com"
	createTestUserWithRole(t, db, mgrEmail, password, "procurement_manager")
	mgrToken := login(t, router, mgrEmail, password)
	mgrHeader := map[string]string{"Authorization": "Bearer " + mgrToken}

	// 5. Try to Approve a PO (Should NOT be Forbidden - might be 404 if PO doesn't exist, but not 403)
	w = performRequest(router, "POST", "/api/v1/purchase-orders/999/approve", nil, mgrHeader)
	assert.NotEqual(t, http.StatusForbidden, w.Code)
	assert.NotEqual(t, http.StatusUnauthorized, w.Code)
	
	// 6. Try to Delete a Warehouse (Should be Forbidden for manager, require admin)
	w = performRequest(router, "DELETE", "/api/v1/warehouses/1", nil, mgrHeader)
	assert.Equal(t, http.StatusForbidden, w.Code)
}

func TestAdminAccess(t *testing.T) {
	router, db, cleanup := setupTestApp(t)
	defer cleanup()

	// Create an Admin user
	adminEmail := "admin@example.com"
	password := "password123"
	createTestUserWithRole(t, db, adminEmail, password, "admin")
	adminToken := login(t, router, adminEmail, password)
	adminHeader := map[string]string{"Authorization": "Bearer " + adminToken}

	// Try to Delete - Should NOT be Forbidden
	w := performRequest(router, "DELETE", "/api/v1/materials/999", nil, adminHeader)
	assert.NotEqual(t, http.StatusForbidden, w.Code)
}
