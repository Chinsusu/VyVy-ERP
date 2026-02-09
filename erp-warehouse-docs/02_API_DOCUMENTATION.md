# API DOCUMENTATION - ERP WAREHOUSE MODULE

## Base URL
```
Development: http://localhost:8080/api/v1
Production: https://erp.company.com/api/v1
```

## Authentication
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## I. MASTER DATA APIs

### 1. Materials (Nguyên Liệu)

#### GET /materials
Lấy danh sách nguyên liệu có phân trang và filter

**Query Parameters:**
```
?page=1
&limit=50
&search=citric              # Tìm theo code hoặc name
&material_type=raw_material # raw_material, packaging, fragrance
&category=ACI               # ACI, ACT, EMU, MOI, OIL
&supplier_id=123
&is_active=true
&min_stock_alert=true       # Chỉ lấy hàng tồn < min_stock_level
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "code": "ACI_Citric",
        "trading_name": "CITRIC ACID",
        "inci_name": "Citric acid",
        "material_type": "raw_material",
        "category": "ACI",
        "unit": "KG",
        "supplier": {
          "id": 5,
          "name": "Nguyễn Bá"
        },
        "standard_cost": 85000.00,
        "min_stock_level": 5.0,
        "current_stock": 2.1,
        "stock_status": "Low Stock",
        "requires_qc": true,
        "shelf_life_days": 730,
        "is_active": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total_items": 150,
      "total_pages": 3
    }
  }
}
```

---

#### GET /materials/:id
Lấy chi tiết 1 nguyên liệu

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "ACI_Citric",
    "trading_name": "CITRIC ACID",
    "inci_name": "Citric acid",
    "material_type": "raw_material",
    "category": "ACI",
    "sub_category": "Acid",
    "unit": "KG",
    "supplier": {
      "id": 5,
      "code": "SUP-001",
      "name": "Nguyễn Bá",
      "phone": "0912345678"
    },
    "standard_cost": 85000.00,
    "last_purchase_price": 82000.00,
    "min_stock_level": 5.0,
    "max_stock_level": 50.0,
    "reorder_point": 10.0,
    "reorder_quantity": 20.0,
    "requires_qc": true,
    "shelf_life_days": 730,
    "storage_conditions": "Bảo quản nơi khô ráo, thoáng mát",
    "hazardous": false,
    "is_active": true,
    "notes": null,
    "stock_summary": {
      "total_available": 2.1,
      "total_reserved": 0.5,
      "total_quantity": 2.6,
      "warehouses": [
        {
          "warehouse_id": 1,
          "warehouse_name": "Kho Chính",
          "available": 2.1,
          "reserved": 0.5
        }
      ]
    },
    "created_at": "2025-01-15T10:30:00Z",
    "created_by": {
      "id": 1,
      "name": "Admin"
    }
  }
}
```

---

#### POST /materials
Tạo nguyên liệu mới

**Request Body:**
```json
{
  "code": "ACI_Ascorbic",
  "trading_name": "VITAMIN C ASCORBIC ACID",
  "inci_name": "Ascorbic Acid",
  "material_type": "raw_material",
  "category": "ACI",
  "sub_category": "Vitamin",
  "unit": "KG",
  "supplier_id": 5,
  "standard_cost": 450000.00,
  "min_stock_level": 2.0,
  "max_stock_level": 20.0,
  "reorder_point": 5.0,
  "reorder_quantity": 10.0,
  "requires_qc": true,
  "shelf_life_days": 365,
  "storage_conditions": "Bảo quản nơi khô, tránh ánh sáng",
  "hazardous": false,
  "notes": ""
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material created successfully",
  "data": {
    "id": 152,
    "code": "ACI_Ascorbic",
    "...": "..."
  }
}
```

---

#### PUT /materials/:id
Cập nhật thông tin nguyên liệu

**Request Body:** (Giống POST, chỉ update các field có giá trị)

---

#### DELETE /materials/:id
Xóa nguyên liệu (soft delete)

**Response:**
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

---

### 2. Finished Products (Thành Phẩm)

#### GET /finished-products
Tương tự materials

#### GET /finished-products/:id
#### POST /finished-products
#### PUT /finished-products/:id
#### DELETE /finished-products/:id

---

### 3. Warehouses (Kho)

#### GET /warehouses
#### GET /warehouses/:id
#### POST /warehouses
#### PUT /warehouses/:id

---

### 4. Warehouse Locations (Vị Trí Kho)

#### GET /warehouses/:warehouseId/locations
Lấy danh sách vị trí trong 1 kho

**Query Parameters:**
```
?location_type=bin          # zone, rack, bin
&is_available=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "A-01-05",
      "name": "Zone A - Rack 01 - Bin 05",
      "location_type": "bin",
      "zone": "A",
      "rack": "01",
      "bin": "05",
      "max_capacity": 500.0,
      "current_usage": 245.3,
      "usage_percent": 49.06,
      "is_available": true
    }
  ]
}
```

---

### 5. Suppliers (Nhà Cung Cấp)

#### GET /suppliers
#### GET /suppliers/:id
#### POST /suppliers
#### PUT /suppliers/:id

---

## II. PURCHASE FLOW APIs

### 1. Purchase Orders (Đơn Đặt Hàng)

#### GET /purchase-orders
Lấy danh sách PO

**Query Parameters:**
```
?page=1
&limit=20
&po_number=PO-2025
&supplier_id=5
&status=approved            # draft, approved, sent, partial_received, received, cancelled
&from_date=2025-01-01
&to_date=2025-12-31
```

---

#### GET /purchase-orders/:id
Chi tiết 1 PO

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "po_number": "PO-2025-000123",
    "po_date": "2025-02-01",
    "supplier": {
      "id": 5,
      "code": "SUP-001",
      "name": "Nguyễn Bá",
      "phone": "0912345678",
      "email": "contact@nguyenba.com"
    },
    "expected_delivery_date": "2025-02-15",
    "delivery_warehouse": {
      "id": 1,
      "code": "WH-MAIN",
      "name": "Kho Chính"
    },
    "delivery_address": "123 Đường ABC, Quận 1, TP.HCM",
    "items": [
      {
        "id": 456,
        "line_number": 1,
        "material": {
          "id": 1,
          "code": "ACI_Citric",
          "trading_name": "CITRIC ACID",
          "unit": "KG"
        },
        "ordered_quantity": 50.0,
        "received_quantity": 0.0,
        "pending_quantity": 50.0,
        "unit_price": 85000.00,
        "discount_percent": 5.0,
        "tax_percent": 10.0,
        "line_total": 4440250.00,
        "notes": ""
      }
    ],
    "subtotal": 4250000.00,
    "tax_amount": 425000.00,
    "discount_amount": 212500.00,
    "total_amount": 4462500.00,
    "currency": "VND",
    "status": "approved",
    "approved_by": {
      "id": 2,
      "name": "Manager"
    },
    "approved_at": "2025-02-01T14:30:00Z",
    "notes": "Giao hàng buổi sáng",
    "created_at": "2025-02-01T10:00:00Z",
    "created_by": {
      "id": 3,
      "name": "Procurement Staff"
    }
  }
}
```

---

#### POST /purchase-orders
Tạo PO mới

**Request Body:**
```json
{
  "po_date": "2025-02-09",
  "supplier_id": 5,
  "expected_delivery_date": "2025-02-20",
  "delivery_warehouse_id": 1,
  "delivery_address": "123 Đường ABC, Quận 1, TP.HCM",
  "items": [
    {
      "material_id": 1,
      "ordered_quantity": 50.0,
      "unit": "KG",
      "unit_price": 85000.00,
      "discount_percent": 5.0,
      "tax_percent": 10.0,
      "notes": ""
    },
    {
      "material_id": 15,
      "ordered_quantity": 20.0,
      "unit": "KG",
      "unit_price": 120000.00,
      "discount_percent": 0,
      "tax_percent": 10.0,
      "notes": ""
    }
  ],
  "notes": "Giao buổi sáng",
  "internal_notes": "Urgent order"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase order created successfully",
  "data": {
    "id": 124,
    "po_number": "PO-2025-000124",
    "status": "draft",
    "...": "..."
  }
}
```

---

#### PUT /purchase-orders/:id/approve
Phê duyệt PO

**Response:**
```json
{
  "success": true,
  "message": "Purchase order approved successfully",
  "data": {
    "id": 124,
    "status": "approved",
    "approved_by": 2,
    "approved_at": "2025-02-09T10:30:00Z"
  }
}
```

---

#### PUT /purchase-orders/:id/cancel
Hủy PO

---

### 2. Goods Receipt Notes (Phiếu Nhập Kho)

#### GET /goods-receipt-notes
Danh sách GRN

**Query Parameters:**
```
?page=1
&limit=20
&grn_number=GRN-2025
&warehouse_id=1
&supplier_id=5
&po_id=123
&status=pending_qc          # pending_qc, qc_passed, qc_failed, posted, cancelled
&qc_status=pass             # pass, fail, partial, pending
&from_date=2025-01-01
&to_date=2025-12-31
```

---

#### GET /goods-receipt-notes/:id
Chi tiết GRN

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 789,
    "grn_number": "GRN-2025-000789",
    "grn_date": "2025-02-09",
    "grn_type": "from_supplier",
    "purchase_order": {
      "id": 123,
      "po_number": "PO-2025-000123"
    },
    "supplier": {
      "id": 5,
      "name": "Nguyễn Bá"
    },
    "delivery_note_number": "DN-NB-20250209-001",
    "warehouse": {
      "id": 1,
      "code": "WH-MAIN",
      "name": "Kho Chính"
    },
    "items": [
      {
        "id": 1001,
        "line_number": 1,
        "material": {
          "id": 1,
          "code": "ACI_Citric",
          "trading_name": "CITRIC ACID",
          "unit": "KG"
        },
        "po_item_id": 456,
        "ordered_quantity": 50.0,
        "received_quantity": 50.0,
        "accepted_quantity": 48.0,
        "rejected_quantity": 2.0,
        "batch_number": "BATCH-20250209-001",
        "lot_number": "LOT-2025-02",
        "manufacturing_date": "2025-01-15",
        "expiry_date": "2027-01-15",
        "location": {
          "id": 15,
          "code": "A-01-05"
        },
        "qc_result": "pass",
        "qc_notes": "Đạt tiêu chuẩn, 2kg bị ẩm",
        "unit_cost": 82000.00,
        "total_cost": 3936000.00
      }
    ],
    "status": "qc_passed",
    "qc_status": "pass",
    "qc_by": {
      "id": 4,
      "name": "QC Staff"
    },
    "qc_at": "2025-02-09T11:00:00Z",
    "qc_notes": "Chất lượng tốt",
    "is_posted": false,
    "notes": "",
    "created_at": "2025-02-09T09:30:00Z",
    "created_by": {
      "id": 6,
      "name": "Warehouse Staff"
    }
  }
}
```

---

#### POST /goods-receipt-notes
Tạo GRN mới (tiếp nhận hàng)

**Request Body:**
```json
{
  "grn_date": "2025-02-09",
  "grn_type": "from_supplier",
  "po_id": 123,
  "supplier_id": 5,
  "delivery_note_number": "DN-NB-20250209-001",
  "warehouse_id": 1,
  "items": [
    {
      "material_id": 1,
      "po_item_id": 456,
      "received_quantity": 50.0,
      "unit": "KG",
      "batch_number": "BATCH-20250209-001",
      "lot_number": "LOT-2025-02",
      "manufacturing_date": "2025-01-15",
      "expiry_date": "2027-01-15",
      "location_id": 15,
      "unit_cost": 82000.00,
      "notes": ""
    }
  ],
  "notes": "Hàng về đúng hẹn"
}
```

**Response:**
```json
{
  "success": true,
  "message": "GRN created successfully, waiting for QC",
  "data": {
    "id": 790,
    "grn_number": "GRN-2025-000790",
    "status": "pending_qc"
  }
}
```

---

#### PUT /goods-receipt-notes/:id/qc-approve
QC phê duyệt nhập kho

**Request Body:**
```json
{
  "qc_notes": "Chất lượng tốt, đạt tiêu chuẩn",
  "items": [
    {
      "item_id": 1001,
      "qc_result": "pass",
      "accepted_quantity": 48.0,
      "rejected_quantity": 2.0,
      "qc_notes": "2kg bị ẩm"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "QC approved successfully",
  "data": {
    "id": 790,
    "status": "qc_passed",
    "qc_status": "pass"
  }
}
```

---

#### PUT /goods-receipt-notes/:id/post
Posting (nhập kho chính thức)

Sau khi QC pass → Post vào kho → Cập nhật stock_ledger & stock_balance

**Response:**
```json
{
  "success": true,
  "message": "GRN posted successfully, stock updated",
  "data": {
    "id": 790,
    "is_posted": true,
    "posted_at": "2025-02-09T14:00:00Z"
  }
}
```

---

## III. PRODUCTION FLOW APIs

### 1. Material Requests (Yêu Cầu Xuất NVL)

#### GET /material-requests
Danh sách MR

**Query Parameters:**
```
?page=1
&limit=20
&mr_number=MR-2025
&warehouse_id=1
&status=approved            # draft, submitted, approved, picking, picked, issued, cancelled
&requested_by_user_id=3
&department=Production
&from_date=2025-01-01
&to_date=2025-12-31
```

---

#### GET /material-requests/:id
Chi tiết MR

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 555,
    "mr_number": "MR-2025-000555",
    "mr_date": "2025-02-09",
    "requested_by": {
      "id": 3,
      "name": "Production Manager"
    },
    "department": "Production",
    "purpose": "Sản xuất dầu gội Smooth - Batch 20250209",
    "production_order_number": "PO-PROD-2025-0123",
    "warehouse": {
      "id": 1,
      "code": "WH-MAIN",
      "name": "Kho Chính"
    },
    "required_date": "2025-02-10",
    "delivery_location": "Nhà máy sản xuất - Dây chuyền 2",
    "items": [
      {
        "id": 1100,
        "line_number": 1,
        "material": {
          "id": 1,
          "code": "ACI_Citric",
          "trading_name": "CITRIC ACID",
          "unit": "KG"
        },
        "requested_quantity": 5.0,
        "issued_quantity": 0.0,
        "pending_quantity": 5.0,
        "notes": ""
      }
    ],
    "status": "approved",
    "approved_by": {
      "id": 2,
      "name": "Warehouse Manager"
    },
    "approved_at": "2025-02-09T10:00:00Z",
    "is_fulfilled": false,
    "notes": "Cần gấp cho lệnh sản xuất",
    "created_at": "2025-02-09T08:30:00Z"
  }
}
```

---

#### POST /material-requests
Tạo MR mới

**Request Body:**
```json
{
  "mr_date": "2025-02-09",
  "department": "Production",
  "purpose": "Sản xuất dầu gội Smooth",
  "production_order_number": "PO-PROD-2025-0123",
  "warehouse_id": 1,
  "required_date": "2025-02-10",
  "delivery_location": "Nhà máy - Dây chuyền 2",
  "items": [
    {
      "material_id": 1,
      "requested_quantity": 5.0,
      "unit": "KG",
      "notes": ""
    },
    {
      "material_id": 15,
      "requested_quantity": 2.5,
      "unit": "KG",
      "notes": ""
    }
  ],
  "notes": "Cần gấp"
}
```

---

#### PUT /material-requests/:id/approve
Phê duyệt MR

---

#### PUT /material-requests/:id/start-picking
Bắt đầu picking

**Response:**
```json
{
  "success": true,
  "message": "Picking started",
  "data": {
    "id": 555,
    "status": "picking",
    "picking_list": [
      {
        "line_number": 1,
        "material_id": 1,
        "material_code": "ACI_Citric",
        "requested_quantity": 5.0,
        "unit": "KG",
        "suggested_locations": [
          {
            "location_id": 15,
            "location_code": "A-01-05",
            "batch_number": "BATCH-20250209-001",
            "expiry_date": "2027-01-15",
            "available_quantity": 48.0,
            "pick_priority": 1
          }
        ]
      }
    ]
  }
}
```

---

### 2. Material Issue Notes (Phiếu Xuất NVL)

#### GET /material-issue-notes
Danh sách MIN

---

#### GET /material-issue-notes/:id
Chi tiết MIN

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 888,
    "min_number": "MIN-2025-000888",
    "min_date": "2025-02-09",
    "issue_type": "production",
    "material_request": {
      "id": 555,
      "mr_number": "MR-2025-000555"
    },
    "warehouse": {
      "id": 1,
      "code": "WH-MAIN",
      "name": "Kho Chính"
    },
    "items": [
      {
        "id": 2200,
        "line_number": 1,
        "material": {
          "id": 1,
          "code": "ACI_Citric",
          "trading_name": "CITRIC ACID",
          "unit": "KG"
        },
        "mr_item_id": 1100,
        "issue_quantity": 5.0,
        "batch_number": "BATCH-20250209-001",
        "expiry_date": "2027-01-15",
        "location": {
          "id": 15,
          "code": "A-01-05"
        },
        "unit_cost": 82000.00,
        "total_cost": 410000.00,
        "notes": ""
      }
    ],
    "received_by_name": "Nguyễn Văn A",
    "received_by_department": "Production",
    "is_posted": true,
    "posted_at": "2025-02-09T11:00:00Z",
    "notes": "Đã bàn giao đầy đủ",
    "created_at": "2025-02-09T10:45:00Z"
  }
}
```

---

#### POST /material-issue-notes
Tạo MIN (xuất kho thực tế)

**Request Body:**
```json
{
  "min_date": "2025-02-09",
  "issue_type": "production",
  "mr_id": 555,
  "warehouse_id": 1,
  "items": [
    {
      "material_id": 1,
      "mr_item_id": 1100,
      "issue_quantity": 5.0,
      "unit": "KG",
      "batch_number": "BATCH-20250209-001",
      "expiry_date": "2027-01-15",
      "location_id": 15,
      "notes": ""
    }
  ],
  "received_by_name": "Nguyễn Văn A",
  "received_by_department": "Production",
  "notes": ""
}
```

---

#### PUT /material-issue-notes/:id/post
Post MIN (xuất kho chính thức)

---

## IV. SALES FLOW APIs

### 1. Delivery Orders (Phiếu Xuất Kho Thành Phẩm)

#### GET /delivery-orders
Danh sách DO

**Query Parameters:**
```
?page=1
&limit=20
&do_number=DO-2025
&warehouse_id=1
&status=shipped             # draft, picking, packed, shipped, delivered, cancelled
&shipping_method=JNT
&tracking_number=JNT123456
&from_date=2025-01-01
&to_date=2025-12-31
```

---

#### GET /delivery-orders/:id
Chi tiết DO

---

#### POST /delivery-orders
Tạo DO mới

**Request Body:**
```json
{
  "do_date": "2025-02-09",
  "sales_order_number": "SO-2025-001234",
  "customer_name": "Nguyễn Thị B",
  "customer_address": "456 Đường XYZ, Quận 3, TP.HCM",
  "customer_phone": "0987654321",
  "warehouse_id": 1,
  "shipping_method": "JNT",
  "cod_amount": 500000.00,
  "items": [
    {
      "finished_product_id": 10,
      "ordered_quantity": 2.0,
      "unit": "PC",
      "unit_price": 250000.00,
      "notes": ""
    }
  ],
  "notes": "Giao giờ hành chính",
  "internal_notes": "Khách VIP"
}
```

---

#### PUT /delivery-orders/:id/pick
Thực hiện picking

**Request Body:**
```json
{
  "items": [
    {
      "item_id": 3300,
      "picked_quantity": 2.0,
      "batch_number": "BATCH-FG-20250201-005",
      "expiry_date": "2027-02-01",
      "location_id": 25
    }
  ]
}
```

---

#### PUT /delivery-orders/:id/pack
Đóng gói xong

---

#### PUT /delivery-orders/:id/ship
Bàn giao cho shipper

**Request Body:**
```json
{
  "tracking_number": "JNT123456789",
  "estimated_delivery_date": "2025-02-11"
}
```

---

#### PUT /delivery-orders/:id/mark-delivered
Cập nhật đã giao hàng

**Request Body:**
```json
{
  "actual_delivery_date": "2025-02-10"
}
```

---

## V. INVENTORY APIs

### 1. Stock Balance (Tồn Kho)

#### GET /stock-balance
Xem tồn kho hiện tại

**Query Parameters:**
```
?item_type=material         # material, finished_product
&item_id=1
&warehouse_id=1
&location_id=15
&batch_number=BATCH-20250209-001
&min_quantity=0             # Chỉ lấy tồn > 0
&expiring_soon=true         # Sắp hết hạn (< 90 ngày)
&low_stock=true             # Tồn < min_stock_level
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "item_type": "material",
      "item": {
        "id": 1,
        "code": "ACI_Citric",
        "trading_name": "CITRIC ACID",
        "unit": "KG"
      },
      "warehouse": {
        "id": 1,
        "code": "WH-MAIN",
        "name": "Kho Chính"
      },
      "location": {
        "id": 15,
        "code": "A-01-05"
      },
      "batch_number": "BATCH-20250209-001",
      "lot_number": "LOT-2025-02",
      "expiry_date": "2027-01-15",
      "available_quantity": 43.0,
      "reserved_quantity": 5.0,
      "total_quantity": 48.0,
      "valuation_rate": 82000.00,
      "total_value": 3936000.00,
      "last_transaction_date": "2025-02-09",
      "days_to_expiry": 735
    }
  ]
}
```

---

#### GET /stock-balance/summary
Tổng hợp tồn kho theo item

**Query Parameters:**
```
?item_type=material
&warehouse_id=1
&group_by=warehouse         # warehouse, location, batch
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "item_type": "material",
      "item": {
        "id": 1,
        "code": "ACI_Citric",
        "trading_name": "CITRIC ACID",
        "unit": "KG",
        "min_stock_level": 5.0
      },
      "warehouse": {
        "id": 1,
        "name": "Kho Chính"
      },
      "total_available": 43.0,
      "total_reserved": 5.0,
      "total_quantity": 48.0,
      "total_value": 3936000.00,
      "stock_status": "OK",
      "batches": [
        {
          "batch_number": "BATCH-20250209-001",
          "quantity": 48.0,
          "expiry_date": "2027-01-15"
        }
      ]
    }
  ]
}
```

---

### 2. Stock Ledger (Lịch Sử Giao Dịch)

#### GET /stock-ledger
Xem lịch sử nhập xuất

**Query Parameters:**
```
?item_type=material
&item_id=1
&warehouse_id=1
&transaction_type=receipt   # receipt, issue, transfer_in, transfer_out, adjustment
&voucher_type=GRN           # GRN, MIN, DO, Transfer, Adjustment
&voucher_number=GRN-2025-000790
&from_date=2025-01-01
&to_date=2025-12-31
&page=1
&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 5000,
        "posting_date": "2025-02-09",
        "posting_time": "14:00:00",
        "item": {
          "id": 1,
          "code": "ACI_Citric",
          "trading_name": "CITRIC ACID"
        },
        "warehouse": {
          "id": 1,
          "name": "Kho Chính"
        },
        "location": {
          "id": 15,
          "code": "A-01-05"
        },
        "transaction_type": "receipt",
        "voucher_type": "GRN",
        "voucher_number": "GRN-2025-000790",
        "quantity": 48.0,
        "unit": "KG",
        "batch_number": "BATCH-20250209-001",
        "expiry_date": "2027-01-15",
        "valuation_rate": 82000.00,
        "stock_value": 3936000.00,
        "balance_quantity": 48.0,
        "balance_value": 3936000.00
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total_items": 1,
      "total_pages": 1
    }
  }
}
```

---

### 3. Stock Movements Report (Báo Cáo Xuất Nhập Tồn)

#### GET /reports/stock-movements
Báo cáo XNT theo kỳ

**Query Parameters:**
```
?item_type=material
&item_id=1                  # Optional, để trống = tất cả
&warehouse_id=1
&from_date=2025-02-01
&to_date=2025-02-28
&format=json                # json, csv, pdf, excel
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-02-01",
      "to": "2025-02-28"
    },
    "warehouse": {
      "id": 1,
      "name": "Kho Chính"
    },
    "items": [
      {
        "item": {
          "id": 1,
          "code": "ACI_Citric",
          "trading_name": "CITRIC ACID",
          "unit": "KG"
        },
        "opening_quantity": 0.0,
        "opening_value": 0.0,
        "receipt_quantity": 48.0,
        "receipt_value": 3936000.00,
        "issue_quantity": 5.0,
        "issue_value": 410000.00,
        "adjustment_quantity": 0.0,
        "adjustment_value": 0.0,
        "closing_quantity": 43.0,
        "closing_value": 3526000.00
      }
    ],
    "summary": {
      "total_opening_value": 0.0,
      "total_receipt_value": 3936000.00,
      "total_issue_value": 410000.00,
      "total_adjustment_value": 0.0,
      "total_closing_value": 3526000.00
    }
  }
}
```

---

### 4. Expiring Items Alert (Cảnh Báo Hết Hạn)

#### GET /alerts/expiring-items
Danh sách hàng sắp hết hạn

**Query Parameters:**
```
?warehouse_id=1
&days_threshold=90          # < 90 ngày
&item_type=material
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "item": {
        "id": 25,
        "code": "ACT_Vitamin_E",
        "trading_name": "VITAMIN E ACETATE",
        "unit": "KG"
      },
      "warehouse": {
        "id": 1,
        "name": "Kho Chính"
      },
      "location": {
        "id": 20,
        "code": "A-02-03"
      },
      "batch_number": "BATCH-20240801-015",
      "expiry_date": "2025-03-01",
      "quantity": 3.5,
      "value": 2450000.00,
      "days_to_expiry": 20,
      "expiry_status": "0-30 days",
      "alert_level": "critical"
    }
  ]
}
```

---

### 5. Low Stock Alert (Cảnh Báo Tồn Thấp)

#### GET /alerts/low-stock
Danh sách hàng tồn < min

**Query Parameters:**
```
?warehouse_id=1
&item_type=material
```

---

## VI. STOCK ADJUSTMENT APIs

### 1. Stock Adjustments (Điều Chỉnh Tồn Kho)

#### GET /stock-adjustments
#### GET /stock-adjustments/:id
#### POST /stock-adjustments

**Request Body:**
```json
{
  "adjustment_date": "2025-02-09",
  "adjustment_type": "physical_count",
  "warehouse_id": 1,
  "reason": "Kiểm kê định kỳ tháng 2/2025",
  "items": [
    {
      "item_type": "material",
      "item_id": 1,
      "location_id": 15,
      "batch_number": "BATCH-20250209-001",
      "book_quantity": 48.0,
      "physical_quantity": 47.5,
      "unit": "KG",
      "unit_cost": 82000.00,
      "notes": "Thiếu 0.5kg, có thể do bay hơi"
    }
  ],
  "notes": "Kiểm kê theo kế hoạch"
}
```

---

#### PUT /stock-adjustments/:id/approve
Phê duyệt điều chỉnh

---

#### PUT /stock-adjustments/:id/post
Post điều chỉnh (cập nhật tồn kho)

---

## VII. STOCK TRANSFER APIs

### 1. Stock Transfers (Chuyển Kho)

#### GET /stock-transfers
#### GET /stock-transfers/:id
#### POST /stock-transfers

**Request Body:**
```json
{
  "transfer_date": "2025-02-09",
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "items": [
    {
      "item_type": "material",
      "item_id": 1,
      "transfer_quantity": 10.0,
      "unit": "KG",
      "batch_number": "BATCH-20250209-001",
      "expiry_date": "2027-01-15",
      "from_location_id": 15,
      "to_location_id": 35
    }
  ],
  "notes": "Chuyển hàng sang chi nhánh Hà Nội"
}
```

---

#### PUT /stock-transfers/:id/ship
Xác nhận đã chuyển đi

---

#### PUT /stock-transfers/:id/receive
Xác nhận đã nhận ở kho đích

---

## VIII. UTILITIES APIs

### 1. Dashboard Stats

#### GET /dashboard/warehouse-stats
Thống kê tổng quan kho

**Response:**
```json
{
  "success": true,
  "data": {
    "total_materials": 150,
    "total_finished_products": 80,
    "total_warehouses": 3,
    "total_stock_value": 2500000000.00,
    "pending_receipts": 5,
    "pending_issues": 8,
    "low_stock_items": 12,
    "expiring_soon_items": 7,
    "recent_transactions": [
      {
        "voucher_number": "GRN-2025-000790",
        "voucher_type": "GRN",
        "date": "2025-02-09",
        "warehouse": "Kho Chính",
        "value": 3936000.00
      }
    ]
  }
}
```

---

### 2. Search

#### GET /search
Tìm kiếm global

**Query Parameters:**
```
?q=citric                   # Keyword
&entity=materials           # materials, finished_products, purchase_orders, grn, min, do
&limit=10
```

---

## IX. ERROR HANDLING

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Material code already exists",
    "details": {
      "field": "code",
      "value": "ACI_Citric"
    }
  }
}
```

### Common Error Codes

```
400 Bad Request
- INVALID_INPUT: Dữ liệu đầu vào không hợp lệ
- MISSING_REQUIRED_FIELD: Thiếu trường bắt buộc
- INVALID_DATE_RANGE: Khoảng ngày không hợp lệ

401 Unauthorized
- UNAUTHORIZED: Chưa đăng nhập
- TOKEN_EXPIRED: Token hết hạn

403 Forbidden
- PERMISSION_DENIED: Không có quyền thực hiện

404 Not Found
- RESOURCE_NOT_FOUND: Không tìm thấy tài nguyên

409 Conflict
- DUPLICATE_CODE: Mã đã tồn tại
- INSUFFICIENT_STOCK: Không đủ hàng trong kho
- ALREADY_POSTED: Phiếu đã được post

422 Unprocessable Entity
- BUSINESS_LOGIC_ERROR: Lỗi nghiệp vụ
- QC_NOT_APPROVED: Chưa QC approve
- STATUS_NOT_ALLOWED: Trạng thái không cho phép

500 Internal Server Error
- INTERNAL_ERROR: Lỗi hệ thống
```

---

## X. PAGINATION & FILTERING

### Standard Pagination

```
?page=1                     # Default: 1
&limit=20                   # Default: 20, Max: 100
```

### Standard Sorting

```
?sort_by=created_at         # Field to sort
&sort_order=desc            # asc or desc
```

### Date Range Filtering

```
?from_date=2025-01-01
&to_date=2025-12-31
```

---

## XI. RATE LIMITING

```
Rate Limit: 1000 requests per hour per API key
Headers:
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 950
  X-RateLimit-Reset: 1707480000
```

---

Tài liệu API này cover toàn bộ workflow nhập xuất kho. Mày cần tao bổ sung thêm endpoint nào không?
