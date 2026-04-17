# SPA Parking Backend — Development Notes

## Quick Start

```bash
# 1. Cài NestJS CLI và dependencies
npm install -g @nestjs/cli
npm install

# 2. Tạo file .env
cp .env.example .env
# Chỉnh sửa DB_PASSWORD và các thông số cần thiết

# 3. Tạo database trong PostgreSQL
createdb spa_parking
# hoặc: psql -U postgres -c "CREATE DATABASE spa_parking;"

# 4. Chạy dev server (TypeORM tự tạo bảng)
npm run start:dev
```

## API Base URL
```
http://localhost:3000/api/v1
```

## Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/parking-locations` | Danh sách + filter |
| GET | `/parking-locations/nearby?lat=&lng=&radius=` | Tìm gần GPS |
| GET | `/parking-locations/:id` | Chi tiết + slots |
| POST | `/parking-locations` | Tạo mới |
| PUT | `/parking-locations/:id` | Cập nhật |
| PATCH | `/parking-locations/:id/status` | Đổi trạng thái |
| DELETE | `/parking-locations/:id` | Soft delete |
| GET | `/parking-locations/:id/slots` | Danh sách chỗ |
| POST | `/parking-locations/:id/slots` | Thêm chỗ |

## Dependencies Cần Cài

```bash
npm install @nestjs/typeorm typeorm pg
npm install class-validator class-transformer @nestjs/mapped-types
npm install @nestjs/config
```
