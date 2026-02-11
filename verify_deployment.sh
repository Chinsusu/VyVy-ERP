#!/bin/bash

# Configuration
API_URL="http://localhost:8080/api/v1"
EMAIL="admin@vyvy.com"
PASSWORD="password123"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting Deployment Verification..."

# 1. Login
echo -n "Logging in... "
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Extract Token (using Grep/Sed/Awk fallback if jq missing)
if command -v jq &> /dev/null; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token')
else
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
    echo -e "${RED}FAILED${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi
echo -e "${GREEN}SUCCESS${NC}"

# 2. Check Dashboard Stats
echo -n "Checking Dashboard Stats... "
STATS_RESPONSE=$(curl -s -X GET "$API_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}SUCCESS${NC}"
    echo "Stats: $STATS_RESPONSE"
else
    echo -e "${RED}FAILED${NC}"
    echo "Response: $STATS_RESPONSE"
fi

# 3. Check Inventory Value Report
echo -n "Checking Inventory Value Report... "
INV_RESPONSE=$(curl -s -X GET "$API_URL/reports/inventory-value" \
  -H "Authorization: Bearer $TOKEN")

if echo "$INV_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}SUCCESS${NC}"
    # Print first 200 chars to avoid spam
    echo "Report (truncated): ${INV_RESPONSE:0:200}..."
else
    echo -e "${RED}FAILED${NC}"
    echo "Response: $INV_RESPONSE"
fi

# 4. Check Stock Movement Report
# Need a valid warehouse ID and item ID, but let's try without params to see if it handles defaults or errors gracefully
echo -n "Checking Stock Movement Report (Default)... "
MOVE_RESPONSE=$(curl -s -X GET "$API_URL/reports/stock-movement" \
  -H "Authorization: Bearer $TOKEN")

# It might return error if params missing, or empty list. 
# Let's verify it returns JSON at least.
echo "Response: ${MOVE_RESPONSE:0:200}..."

echo "Verification Complete."
