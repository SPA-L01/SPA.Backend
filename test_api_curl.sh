#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"

echo "--- 1. POST: Tạo bãi xe Hồ Gươm ---"
CREATE_RES=$(curl -s -X POST "$BASE_URL/parking-locations" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bãi xe Hồ Gươm",
    "slug": "bai-xe-ho-guom",
    "address": "18 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
    "latitude": 21.0285,
    "longitude": 105.8542,
    "phone": "0912345678",
    "totalSlots": 50,
    "hourlyRate": 5000,
    "dailyRate": 50000,
    "openTime": "06:00",
    "closeTime": "23:00"
  }')
echo $CREATE_RES | json_pp || echo $CREATE_RES
ID=$(echo $CREATE_RES | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

echo -e "\n--- 2. GET: Danh sách bãi xe ---"
curl -s -X GET "$BASE_URL/parking-locations" | json_pp

echo -e "\n--- 3. GET: Chi tiết bãi xe ID: $ID ---"
curl -s -X GET "$BASE_URL/parking-locations/$ID" | json_pp

echo -e "\n--- 4. GET: Tìm kiếm gần đây (GPS 21.02, 105.85) ---"
curl -s -X GET "$BASE_URL/parking-locations/nearby?lat=21.02&lng=105.85&radius=5" | json_pp

echo -e "\n--- 5. PUT: Cập nhật giá gửi xe ---"
curl -s -X PUT "$BASE_URL/parking-locations/$ID" \
  -H "Content-Type: application/json" \
  -d '{"hourlyRate": 7000}' | json_pp

echo -e "\n--- 6. PATCH: Đổi trạng thái sang Maintenance ---"
curl -s -X PATCH "$BASE_URL/parking-locations/$ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "maintenance"}' | json_pp

echo -e "\n--- 7. POST: Thêm 2 chỗ đỗ (A1, A2) ---"
curl -s -X POST "$BASE_URL/parking-locations/$ID/slots" \
  -H "Content-Type: application/json" \
  -d '[
    {"slotNumber": "A1", "vehicleType": "car"},
    {"slotNumber": "A2", "vehicleType": "car"}
  ]' | json_pp

echo -e "\n--- 8. GET: Danh sách Slots ---"
curl -s -X GET "$BASE_URL/parking-locations/$ID/slots" | json_pp

echo -e "\n--- 9. DELETE: Xóa mềm bãi xe ---"
curl -s -X DELETE "$BASE_URL/parking-locations/$ID"
echo "Status: Deleted (No Content)"

echo -e "\n--- 10. GET: Xác nhận sau khi xóa ---"
curl -s -X GET "$BASE_URL/parking-locations" | json_pp
