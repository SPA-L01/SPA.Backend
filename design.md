# Auth Module — Backend Design

## Overview

Auth module được port từ **tichi-api** và điều chỉnh cho phù hợp với SPA (NestJS + PostgreSQL + TypeORM).

---

## File Structure

```
src/
├── core/
│   └── domain/
│       └── base.entity.ts          # Abstract base với UUID, isActive, soft-delete
├── modules/
│   ├── user/
│   │   ├── entities/user.entity.ts
│   │   ├── enums/role.enum.ts
│   │   ├── dto/create-user.dto.ts
│   │   ├── dto/update-user.dto.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   └── auth/
│       ├── auth.controller.ts
│       ├── auth.module.ts
│       ├── auth.service.ts
│       ├── config/
│       │   ├── jwt.config.ts          # access token 30m
│       │   └── refresh-jwt.config.ts  # refresh token 7d
│       ├── decorators/
│       │   ├── public.decorator.ts    # @Public() bypass JWT guard
│       │   └── roles.decorator.ts     # @Roles(Role.ADMIN)
│       ├── dto/
│       │   └── login.dto.ts
│       ├── guards/
│       │   ├── jwt-auth/jwt-auth.guard.ts      # global guard
│       │   ├── local-auth/local-auth.guard.ts
│       │   ├── refresh-auth/refresh-auth.guard.ts
│       │   └── roles/roles.guard.ts            # global guard
│       ├── strategies/
│       │   ├── jwt.strategy.ts
│       │   ├── local.strategy.ts
│       │   └── refresh.strategy.ts
│       └── types/
│           ├── auth-jwt-payload.type.ts
│           └── current-user.type.ts
```

---

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/login` | Public | Email + password → tokens |
| POST | `/api/v1/auth/register` | Public | Tạo tài khoản mới |
| POST | `/api/v1/auth/refresh` | RefreshToken | Cấp lại access token |
| POST | `/api/v1/auth/logout` | JWT | Xoá refresh token |

---

## Auth Flow

```
Login:
  Client → POST /auth/login {email, password}
         → LocalStrategy.validate() → AuthService.validateUser()
         → AuthService.login() → generateTokens()
         → hash refreshToken với argon2, lưu vào DB
         → trả { id, accessToken, refreshToken }

Protected request:
  Client → Header: Authorization: Bearer <accessToken>
         → JwtAuthGuard (global) → JwtStrategy.validate()
         → AuthService.validateJwtUser() → req.user = CurrentUser

Refresh:
  Client → Header: Authorization: Bearer <refreshToken>
         → POST /auth/refresh
         → RefreshJwtStrategy.validate() → argon2.verify()
         → Cấp tokens mới, cập nhật hash trong DB

Logout:
  Client → POST /auth/logout (JWT)
         → AuthService.signOut() → hashedRefreshToken = null
```

---

## Key Differences vs tichi-api

| | tichi-api | SPA |
|---|---|---|
| User ID type | `number` (auto-increment) | `string` (UUID) |
| Soft delete | `isDeleted: boolean` | `deletedAt: Date` (TypeORM native) |
| Google OAuth | Có | Không (mobile app) |
| Login audit log | Có (UserAuthLog) | Không (phase 1) |

---

## Security

- **Password**: Bcrypt (hash tự động trong `@BeforeInsert`)
- **Refresh token**: Argon2 hash trước khi lưu DB
- **Access token**: JWT HS256, expires 30m
- **Refresh token**: JWT HS256 với secret riêng, expires 7d
- **Global guards**: `JwtAuthGuard` + `RolesGuard` áp dụng cho toàn app
- **@Public()**: Bypass JWT cho các public route (login, register, refresh)

---

## Environment Variables

```env
JWT_SECRET=...
REFRESH_JWT_SECRET=...
```
