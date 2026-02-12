#!/bin/bash
set -e

API="http://localhost:8080/api/v1"
PASS=0
FAIL=0

ok() { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $1: $2"; FAIL=$((FAIL+1)); }

check_success() {
    local label="$1"
    local response="$2"
    # Accept both {"success":true,...} and {"data":...,"total":...} formats
    if echo "$response" | python3 -c "
import sys,json
d=json.load(sys.stdin)
ok = d.get('success',False) or ('data' in d and 'total' in d) or ('data' in d and isinstance(d.get('data'), dict) and 'items' in d.get('data',{}))
assert ok
" 2>/dev/null; then
        ok "$label"
    else
        fail "$label" "$(echo $response | head -c 100)"
    fi
}

check_status() {
    local label="$1"
    local code="$2"
    local expected="$3"
    if [ "$code" = "$expected" ]; then
        ok "$label (HTTP $code)"
    else
        fail "$label" "Expected HTTP $expected, got $code"
    fi
}

echo "==========================================="
echo "  VyVy-ERP End-to-End Test Suite"
echo "==========================================="
echo ""

# 1. AUTH
echo "--- 1. AUTHENTICATION ---"
TOKEN=$(curl -s "$API/auth/login" -X POST -H "Content-Type: application/json" -d '{"email":"admin@vyvy.com","password":"password123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null)
if [ -n "$TOKEN" ] && [ "$TOKEN" != "FAILED" ]; then
    ok "Admin Login"
else
    fail "Admin Login" "Could not get token"
    echo "Cannot continue without token."
    exit 1
fi

# 2. DASHBOARD
echo ""
echo "--- 2. DASHBOARD ---"
R=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/dashboard/stats")
check_success "Dashboard Stats" "$R"
echo "      $(echo $R | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(f'POs={d[\"total_purchase_orders\"]}, GRNs={d[\"pending_grns\"]}, MRs={d[\"total_material_requests\"]}, DOs={d[\"total_delivery_orders\"]}, inv_value={d[\"inventory_value\"]}')" 2>/dev/null)"

# 3. ALERTS (new feature)
echo ""
echo "--- 3. ALERTS ---"
R=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/alerts/summary")
check_success "Alert Summary" "$R"
echo "      $(echo $R | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(f'low_stock={d[\"low_stock_count\"]}, expiring={d[\"expiring_soon_count\"]}, total={d[\"total_alerts\"]}')" 2>/dev/null)"

R=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/alerts/low-stock")
check_success "Low Stock Alerts" "$R"

R=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/alerts/expiring-soon?days=90")
check_success "Expiring Soon Alerts" "$R"

# 4. REPORTS (with fixed transaction types)
echo ""
echo "--- 4. REPORTS ---"
R=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/reports/stock-movement?start_date=2025-01-01T00:00:00Z&end_date=2027-01-01T00:00:00Z")
check_success "Stock Movement Report" "$R"
echo "      $(echo $R | python3 -c "import sys,json; rows=json.load(sys.stdin)['data']; print(f'rows={len(rows)}')" 2>/dev/null)"

R=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/reports/inventory-value")
check_success "Inventory Value Report" "$R"

R=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/reports/low-stock")
check_success "Low Stock Report" "$R"

R=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/reports/expiring-soon")
check_success "Expiring Soon Report" "$R"

# 5. CSV EXPORT
echo ""
echo "--- 5. CSV EXPORT ---"
CSV_RESP=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$API/reports/stock-movement?export=csv&start_date=2025-01-01T00:00:00Z&end_date=2027-01-01T00:00:00Z")
CSV_CODE=$(echo "$CSV_RESP" | tail -1)
check_status "Stock Movement CSV Export" "$CSV_CODE" "200"

CSV_RESP=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$API/reports/inventory-value?export=csv")
CSV_CODE=$(echo "$CSV_RESP" | tail -1)
check_status "Inventory Value CSV Export" "$CSV_CODE" "200"

CSV_RESP=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$API/reports/low-stock?export=csv")
CSV_CODE=$(echo "$CSV_RESP" | tail -1)
check_status "Low Stock CSV Export" "$CSV_CODE" "200"

CSV_RESP=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$API/reports/expiring-soon?export=csv")
CSV_CODE=$(echo "$CSV_RESP" | tail -1)
check_status "Expiring Soon CSV Export" "$CSV_CODE" "200"

# 6-12. LIST ENDPOINTS
echo ""
echo "--- 6. LIST ENDPOINTS ---"
for EP in "materials" "warehouses" "suppliers" "material-requests" "material-issue-notes" "delivery-orders" "purchase-orders" "grns" "inventory/adjustments" "inventory/transfers"; do
    R=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/$EP")
    LABEL="List $(echo $EP | sed 's/\// /g')"
    # Any 200 response with data is ok
    if echo "$R" | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'data' in d or 'success' in d" 2>/dev/null; then
        ok "$LABEL"
    else
        fail "$LABEL" "$(echo $R | head -c 100)"
    fi
done

# 13. MIN WORKFLOW: Create MR -> Approve -> Create MIN -> Post -> Verify Stock
echo ""
echo "--- 7. MIN WORKFLOW ---"
INITIAL_STOCK=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/reports/inventory-value" | python3 -c "
import sys,json
data=json.load(sys.stdin)['data']
main = [r for r in (data or []) if r['warehouse_name']=='Main Warehouse']
print(main[0]['quantity'] if main else 'N/A')
" 2>/dev/null)
echo "      Initial stock (Main Warehouse): $INITIAL_STOCK"

# Create MR
MR_RESP=$(curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$API/material-requests" -X POST -d '{
    "mr_number": "MR-E2E-001",
    "warehouse_id": 1,
    "department": "Production",
    "request_date": "2026-02-12",
    "required_date": "2026-02-15",
    "purpose": "E2E Testing",
    "notes": "E2E test MR",
    "items": [{"material_id": 1, "requested_quantity": 3, "notes": "test item"}]
}')
check_success "Create Material Request" "$MR_RESP"
MR_ID=$(echo "$MR_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
echo "      MR ID=$MR_ID"

# Approve MR (admin has all permissions)
if [ -n "$MR_ID" ] && [ "$MR_ID" != "None" ]; then
    APPROVE_RESP=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/material-requests/$MR_ID/approve" -X POST)
    check_success "Approve MR" "$APPROVE_RESP"
else
    fail "Approve MR" "No MR ID"
fi

# Get MR details to find item IDs
MR_DETAIL=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/material-requests/$MR_ID")
MR_ITEM_ID=$(echo "$MR_DETAIL" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(d['items'][0]['id'])" 2>/dev/null)
echo "      MR Item ID=$MR_ITEM_ID"

# Create MIN from approved MR
if [ -n "$MR_ID" ] && [ "$MR_ID" != "None" ]; then
    MIN_RESP=$(curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$API/material-issue-notes" -X POST -d "{
        \"material_request_id\": $MR_ID,
        \"warehouse_id\": 1,
        \"issue_date\": \"2026-02-12T00:00:00Z\",
        \"notes\": \"E2E test MIN\",
        \"items\": [{\"material_id\": 1, \"mr_item_id\": $MR_ITEM_ID, \"quantity\": 3}]
    }")
    check_success "Create MIN" "$MIN_RESP"
    MIN_ID=$(echo "$MIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
    echo "      MIN ID=$MIN_ID"
else
    fail "Create MIN" "No MR ID"
fi

# Post MIN
if [ -n "$MIN_ID" ] && [ "$MIN_ID" != "None" ]; then
    POST_RESP=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/material-issue-notes/$MIN_ID/post" -X POST)
    check_success "Post MIN" "$POST_RESP"

    # Verify stock decreased
    FINAL_STOCK=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/reports/inventory-value" | python3 -c "
import sys,json
data=json.load(sys.stdin)['data']
main = [r for r in (data or []) if r['warehouse_name']=='Main Warehouse']
print(main[0]['quantity'] if main else 'N/A')
" 2>/dev/null)
    echo "      Final stock (Main Warehouse): $FINAL_STOCK"
    if python3 -c "assert float('$FINAL_STOCK') < float('$INITIAL_STOCK')" 2>/dev/null; then
        ok "Stock decreased after MIN post ($INITIAL_STOCK → $FINAL_STOCK)"
    else
        fail "Stock verification" "$INITIAL_STOCK → $FINAL_STOCK"
    fi
else
    fail "Post MIN" "No MIN ID"
    fail "Stock verification" "Skipped"
fi

# 14. INVENTORY ADJUSTMENT WORKFLOW
echo ""
echo "--- 8. INVENTORY ADJUSTMENT ---"
ADJ_RESP=$(curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$API/inventory/adjustments" -X POST -d '{
    "warehouse_id": 1,
    "adjustment_date": "2026-02-12",
    "adjustment_type": "count",
    "reason": "E2E cycle count test",
    "items": [{"item_type": "material", "item_id": 1, "quantity_change": 10, "reason": "found extra"}]
}')
check_success "Create Adjustment" "$ADJ_RESP"
ADJ_ID=$(echo "$ADJ_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
echo "      Adjustment ID=$ADJ_ID"

if [ -n "$ADJ_ID" ] && [ "$ADJ_ID" != "None" ]; then
    PA_RESP=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/inventory/adjustments/$ADJ_ID/post" -X POST)
    check_success "Post Adjustment" "$PA_RESP"
fi

# 15. FRONTEND
echo ""
echo "--- 9. FRONTEND ---"
FE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
check_status "Frontend accessible" "$FE_CODE" "200"

echo ""
echo "==========================================="
printf "  RESULTS: %d passed, %d failed\n" $PASS $FAIL
echo "==========================================="
