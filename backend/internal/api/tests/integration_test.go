package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/api/routes"
	"github.com/VyVy-ERP/warehouse-backend/internal/config"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/testutils"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func setupTestApp(t *testing.T) (*gin.Engine, *gorm.DB, func()) {
	gin.SetMode(gin.TestMode)
	db, cleanup := testutils.SetupTestDB()
	
	cfg := &config.Config{
		JWT: config.JWTConfig{
			Secret:              "test_secret",
			ExpiryHours:         24,
			RefreshExpiryHours: 168,
		},
	}

	router := gin.New()
	routes.SetupRoutes(router, db, cfg)

	return router, db, func() {
		cleanup()
	}
}

func createTestUser(t *testing.T, db *gorm.DB, email, password string) *models.User {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	assert.NoError(t, err)
	
	isActive := true
	user := &models.User{
		Username:     "testuser",
		Email:        email,
		PasswordHash: string(hashedPassword),
		Role:         "admin",
		IsActive:     &isActive,
	}
	err = db.Create(user).Error
	assert.NoError(t, err)
	return user
}

func login(t *testing.T, r *gin.Engine, email, password string) string {
	loginBody := map[string]string{
		"email":    email,
		"password": password,
	}
	w := performRequest(r, "POST", "/api/v1/auth/login", loginBody, nil)
	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	
	data := resp["data"].(map[string]interface{})
	return data["access_token"].(string)
}

func performRequest(r http.Handler, method, path string, body interface{}, headers map[string]string) *httptest.ResponseRecorder {
	var jsonBody []byte
	if body != nil {
		jsonBody, _ = json.Marshal(body)
	}

	req, _ := http.NewRequest(method, path, bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestMaterialIntegration(t *testing.T) {
	router, db, cleanup := setupTestApp(t)
	defer cleanup()

	email := "test@example.com"
	password := "password123"
	createTestUser(t, db, email, password)
	token := login(t, router, email, password)
	authHeader := map[string]string{"Authorization": "Bearer " + token}

	// 1. Create Material
	var materialID uint
	t.Run("POST /api/v1/materials - Success", func(t *testing.T) {
		req := map[string]interface{}{
			"code":          "MAT-INT-001",
			"trading_name":  "Integration Test Material",
			"material_type": "raw_material",
			"unit":          "pcs",
		}
		w := performRequest(router, "POST", "/api/v1/materials", req, authHeader)
		require.Equal(t, http.StatusCreated, w.Code, w.Body.String())

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)
		
		data, ok := resp["data"].(map[string]interface{})
		require.True(t, ok, "response data should be a map")
		materialID = uint(data["id"].(float64))
		assert.Equal(t, "MAT-INT-001", data["code"])
	})

	// 2. List Materials
	t.Run("GET /api/v1/materials - Success", func(t *testing.T) {
		w := performRequest(router, "GET", "/api/v1/materials", nil, authHeader)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	// 3. Get Material by ID
	t.Run("GET /api/v1/materials/:id - Success", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/materials/%d", materialID)
		w := performRequest(router, "GET", path, nil, authHeader)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	// 4. Delete Material
	t.Run("DELETE /api/v1/materials/:id - Success", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/materials/%d", materialID)
		w := performRequest(router, "DELETE", path, nil, authHeader)
		assert.Equal(t, http.StatusOK, w.Code)
	})
}

func TestSupplierIntegration(t *testing.T) {
	router, db, cleanup := setupTestApp(t)
	defer cleanup()

	email := "test-supplier@example.com"
	password := "password123"
	createTestUser(t, db, email, password)
	token := login(t, router, email, password)
	authHeader := map[string]string{"Authorization": "Bearer " + token}

	// 1. Create Supplier
	var supplierID uint
	t.Run("POST /api/v1/suppliers - Success", func(t *testing.T) {
		req := map[string]interface{}{
			"code":          "SUP-INT-001",
			"name":          "Integration Test Supplier",
			"contact_person": "IT Person",
			"email":         "it@supplier.com",
		}
		w := performRequest(router, "POST", "/api/v1/suppliers", req, authHeader)
		require.Equal(t, http.StatusCreated, w.Code, w.Body.String())

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		require.NoError(t, err)
		data := resp["data"].(map[string]interface{})
		supplierID = uint(data["id"].(float64))
	})

	// 2. List Suppliers
	t.Run("GET /api/v1/suppliers - Success", func(t *testing.T) {
		w := performRequest(router, "GET", "/api/v1/suppliers", nil, authHeader)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	// 3. Get Supplier by ID
	t.Run("GET /api/v1/suppliers/:id - Success", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/suppliers/%d", supplierID)
		w := performRequest(router, "GET", path, nil, authHeader)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	// 4. Delete Supplier
	t.Run("DELETE /api/v1/suppliers/:id - Success", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/suppliers/%d", supplierID)
		w := performRequest(router, "DELETE", path, nil, authHeader)
		assert.Equal(t, http.StatusOK, w.Code)
	})
}

func TestWarehouseIntegration(t *testing.T) {
	router, db, cleanup := setupTestApp(t)
	defer cleanup()

	email := "test-wh@example.com"
	password := "password123"
	createTestUser(t, db, email, password)
	token := login(t, router, email, password)
	authHeader := map[string]string{"Authorization": "Bearer " + token}

	// 1. Create Warehouse
	var warehouseID uint
	t.Run("POST /api/v1/warehouses - Success", func(t *testing.T) {
		req := map[string]interface{}{
			"code": "WH-INT-001",
			"name": "Integration Test Warehouse",
		}
		w := performRequest(router, "POST", "/api/v1/warehouses", req, authHeader)
		require.Equal(t, http.StatusCreated, w.Code, w.Body.String())

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		data := resp["data"].(map[string]interface{})
		warehouseID = uint(data["id"].(float64))
	})

	// 2. Create Location
	t.Run("POST /api/v1/warehouse-locations - Success", func(t *testing.T) {
		req := map[string]interface{}{
			"warehouse_id": warehouseID,
			"code":         "LOC-INT-001",
			"name":         "Integration Test Location",
		}
		w := performRequest(router, "POST", "/api/v1/warehouse-locations", req, authHeader)
		require.Equal(t, http.StatusCreated, w.Code, w.Body.String())
	})

	// 3. List Locations for Warehouse
	t.Run("GET /api/v1/warehouses/:id/locations - Success", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/warehouses/%d/locations", warehouseID)
		w := performRequest(router, "GET", path, nil, authHeader)
		assert.Equal(t, http.StatusOK, w.Code)
	})
}

func TestPurchaseOrderWorkflowIntegration(t *testing.T) {
	router, db, cleanup := setupTestApp(t)
	defer cleanup()

	email := "procurement@example.com"
	password := "password123"
	_ = createTestUser(t, db, email, password)
	token := login(t, router, email, password)
	authHeader := map[string]string{"Authorization": "Bearer " + token}

	// 1. Setup Prerequisites (Material, Supplier, Warehouse)
	var materialID, supplierID, warehouseID uint
	
	// Create Material
	matReq := map[string]interface{}{"code": "RM-001", "trading_name": "Raw Material 1", "material_type": "raw_material", "unit": "kg"}
	w := performRequest(router, "POST", "/api/v1/materials", matReq, authHeader)
	require.Equal(t, http.StatusCreated, w.Code)
	var matResp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &matResp)
	materialID = uint(matResp["data"].(map[string]interface{})["id"].(float64))

	// Create Supplier
	supReq := map[string]interface{}{"code": "SUP-001", "name": "Main Supplier", "email": "sup@test.com"}
	w = performRequest(router, "POST", "/api/v1/suppliers", supReq, authHeader)
	require.Equal(t, http.StatusCreated, w.Code)
	var supResp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &supResp)
	supplierID = uint(supResp["data"].(map[string]interface{})["id"].(float64))

	// Create Warehouse
	whReq := map[string]interface{}{"code": "WH-001", "name": "Main Warehouse"}
	w = performRequest(router, "POST", "/api/v1/warehouses", whReq, authHeader)
	require.Equal(t, http.StatusCreated, w.Code)
	var whResp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &whResp)
	warehouseID = uint(whResp["data"].(map[string]interface{})["id"].(float64))

	// 2. Create Purchase Order
	var poID uint
	var poItemID uint
	t.Run("Create PO", func(t *testing.T) {
		poReq := map[string]interface{}{
			"po_number":    "PO-INT-001",
			"supplier_id":  supplierID,
			"warehouse_id": warehouseID,
			"order_date":   time.Now().Format("2006-01-02"),
			"items": []map[string]interface{}{
				{
					"material_id": materialID,
					"quantity":    100.0,
					"unit_price":  15.5,
				},
			},
		}
		w := performRequest(router, "POST", "/api/v1/purchase-orders", poReq, authHeader)
		require.Equal(t, http.StatusCreated, w.Code, w.Body.String())
		var poResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &poResp)
		data := poResp["data"].(map[string]interface{})
		poID = uint(data["id"].(float64))
		items := data["items"].([]interface{})
		poItemID = uint(items[0].(map[string]interface{})["id"].(float64))
	})

	// 3. Approve Purchase Order
	t.Run("Approve PO", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/purchase-orders/%d/approve", poID)
		w := performRequest(router, "POST", path, nil, authHeader)
		require.Equal(t, http.StatusOK, w.Code)
	})

	// 4. Create GRN
	var grnID uint
	var grnItemID uint
	t.Run("Create GRN", func(t *testing.T) {
		grnReq := map[string]interface{}{
			"grn_number":        "GRN-INT-001",
			"purchase_order_id": poID,
			"warehouse_id":      warehouseID,
			"receipt_date":      time.Now().Format("2006-01-02"),
			"items": []map[string]interface{}{
				{
					"po_item_id":  poItemID,
					"material_id": materialID,
					"quantity":    100.0,
					"unit_cost":   15.5,
				},
			},
		}
		
		w := performRequest(router, "POST", "/api/v1/grns", grnReq, authHeader)
		require.Equal(t, http.StatusCreated, w.Code, w.Body.String())
		var grnResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &grnResp)
		data := grnResp["data"].(map[string]interface{})
		grnID = uint(data["id"].(float64))
		items := data["items"].([]interface{})
		grnItemID = uint(items[0].(map[string]interface{})["id"].(float64))
	})

	// 5. Update GRN QC
	t.Run("Update GRN QC", func(t *testing.T) {
		qcReq := map[string]interface{}{
			"items": map[string]interface{}{
				fmt.Sprintf("%d", grnItemID): map[string]interface{}{
					"accepted_quantity": 100.0,
					"rejected_quantity": 0.0,
					"qc_status":         "passed",
				},
			},
		}
		path := fmt.Sprintf("/api/v1/grns/%d/qc", grnID)
		w := performRequest(router, "POST", path, qcReq, authHeader)
		require.Equal(t, http.StatusOK, w.Code, w.Body.String())
	})

	// 6. Post GRN
	t.Run("Post GRN", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/grns/%d/post", grnID)
		w := performRequest(router, "POST", path, nil, authHeader)
		require.Equal(t, http.StatusOK, w.Code, w.Body.String())
	})

	// 7. Verify Stock Balance
	t.Run("Verify Stock Balance", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/inventory/balance?warehouse_id=%d&item_id=%d&item_type=material", warehouseID, materialID)
		w := performRequest(router, "GET", path, nil, authHeader)
		require.Equal(t, http.StatusOK, w.Code)
		
		var balResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &balResp)
		data := balResp["data"].([]interface{})
		require.NotEmpty(t, data)
		
		balance := data[0].(map[string]interface{})
		assert.Equal(t, 100.0, balance["quantity"])
	})
}

func TestMaterialRequestWorkflowIntegration(t *testing.T) {
	router, db, cleanup := setupTestApp(t)
	defer cleanup()

	email := "requestor@example.com"
	password := "password123"
	_ = createTestUser(t, db, email, password)
	token := login(t, router, email, password)
	authHeader := map[string]string{"Authorization": "Bearer " + token}

	// 1. Setup Prerequisites (Material, Warehouse, Initial Stock)
	var materialID, warehouseID uint
	
	// Create Material
	matReq := map[string]interface{}{"code": "RM-002", "trading_name": "Raw Material 2", "material_type": "raw_material", "unit": "kg"}
	w := performRequest(router, "POST", "/api/v1/materials", matReq, authHeader)
	require.Equal(t, http.StatusCreated, w.Code)
	var matResp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &matResp)
	materialID = uint(matResp["data"].(map[string]interface{})["id"].(float64))

	// Create Warehouse
	whReq := map[string]interface{}{"code": "WH-002", "name": "Req Warehouse"}
	w = performRequest(router, "POST", "/api/v1/warehouses", whReq, authHeader)
	require.Equal(t, http.StatusCreated, w.Code)
	var whResp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &whResp)
	warehouseID = uint(whResp["data"].(map[string]interface{})["id"].(float64))

	// Direct seed initial stock (1000 units)
	stock := &models.StockBalance{
		ItemType:    "material",
		ItemID:      materialID,
		WarehouseID: warehouseID,
		Quantity:    1000,
	}
	db.Create(stock)

	// 2. Create Material Request
	var mrID uint
	var mrItemID uint
	t.Run("Create MR", func(t *testing.T) {
		mrReq := map[string]interface{}{
			"mr_number":    "MR-INT-001",
			"department":   "IT",
			"warehouse_id": warehouseID,
			"request_date": time.Now().Format("2006-01-02"),
			"items": []map[string]interface{}{
				{
					"material_id":        materialID,
					"requested_quantity": 50.0,
				},
			},
		}
		w := performRequest(router, "POST", "/api/v1/material-requests", mrReq, authHeader)
		require.Equal(t, http.StatusCreated, w.Code, w.Body.String())
		var mrResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &mrResp)
		data := mrResp["data"].(map[string]interface{})
		mrID = uint(data["id"].(float64))
		items := data["items"].([]interface{})
		mrItemID = uint(items[0].(map[string]interface{})["id"].(float64))
	})

	// 3. Approve Material Request (Reserves stock)
	t.Run("Approve MR", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/material-requests/%d/approve", mrID)
		w := performRequest(router, "POST", path, nil, authHeader)
		require.Equal(t, http.StatusOK, w.Code, w.Body.String())
	})

	// 4. Verify Reserved Stock
	t.Run("Verify Reservation", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/inventory/balance?warehouse_id=%d&item_id=%d&item_type=material", warehouseID, materialID)
		w := performRequest(router, "GET", path, nil, authHeader)
		require.Equal(t, http.StatusOK, w.Code)
		
		var balResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &balResp)
		data := balResp["data"].([]interface{})
		balance := data[0].(map[string]interface{})
		assert.Equal(t, 50.0, balance["reserved_quantity"])
		assert.Equal(t, 950.0, balance["available_quantity"])
	})

	// 5. Create Material Issue Note (MIN)
	var minID uint
	t.Run("Create MIN", func(t *testing.T) {
		minReq := map[string]interface{}{
			"min_number":          "MIN-INT-001",
			"material_request_id": mrID,
			"warehouse_id":        warehouseID,
			"issue_date":          time.Now().Format("2006-01-02"),
			"items": []map[string]interface{}{
				{
					"mr_item_id":  mrItemID,
					"material_id": materialID,
					"quantity":    50.0,
				},
			},
		}
		w := performRequest(router, "POST", "/api/v1/material-issue-notes", minReq, authHeader)
		require.Equal(t, http.StatusCreated, w.Code, w.Body.String())
		var minResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &minResp)
		data := minResp["data"].(map[string]interface{})
		minID = uint(data["id"].(float64))
	})

	// 6. Post MIN (Deducts stock)
	t.Run("Post MIN", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/material-issue-notes/%d/post", minID)
		w := performRequest(router, "POST", path, nil, authHeader)
		require.Equal(t, http.StatusOK, w.Code, w.Body.String())
	})

	// 7. Verify Final Stock Balance
	t.Run("Verify Final Balance", func(t *testing.T) {
		path := fmt.Sprintf("/api/v1/inventory/balance?warehouse_id=%d&item_id=%d&item_type=material", warehouseID, materialID)
		w := performRequest(router, "GET", path, nil, authHeader)
		require.Equal(t, http.StatusOK, w.Code)
		
		var balResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &balResp)
		data := balResp["data"].([]interface{})
		balance := data[0].(map[string]interface{})
		assert.Equal(t, 950.0, balance["quantity"])
		assert.Equal(t, 0.0, balance["reserved_quantity"])
	})
}
