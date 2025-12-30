# Authentication API

## 개요

JWT 기반 인증 시스템을 사용합니다. 보호된 엔드포인트에 접근하려면 `Authorization` 헤더에 Bearer 토큰을 포함해야 합니다.

## 인증 플로우

1. **회원가입**: `POST /auth/register`
2. **로그인**: `POST /auth/login` → JWT 토큰 발급
3. **보호된 리소스 접근**: `Authorization: Bearer <token>` 헤더 포함

---

## 엔드포인트

### 1. 회원가입

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**응답 (201 Created)**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "USER",
    "createdAt": "2025-12-30T...",
    "updatedAt": "2025-12-30T..."
  },
  "message": "register"
}
```

---

### 2. 로그인

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답 (200 OK)**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "role": "USER",
      "createdAt": "2025-12-30T...",
      "updatedAt": "2025-12-30T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "login"
}
```

---

### 3. 내 정보 조회 (인증 필요)

```http
GET /users/me
Authorization: Bearer <your-jwt-token>
```

**응답 (200 OK)**
```json
{
  "data": {
    "userId": "uuid",
    "role": "USER"
  },
  "message": "success"
}
```

---

### 4. 관리자 전용 엔드포인트 (ADMIN 역할 필요)

```http
GET /users/admin
Authorization: Bearer <admin-jwt-token>
```

**응답 (200 OK)**
```json
{
  "data": {
    "message": "This is an admin-only endpoint",
    "user": {
      "userId": "uuid",
      "role": "ADMIN"
    }
  },
  "message": "success"
}
```

---

## 에러 응답

### 인증 실패

```json
{
  "status": 401,
  "message": "Authorization header is missing"
}
```

```json
{
  "status": 401,
  "message": "Invalid or expired token"
}
```

### 권한 부족

```json
{
  "status": 403,
  "message": "Insufficient permissions"
}
```

---

## 미들웨어 사용법

### authMiddleware

모든 인증된 사용자가 접근할 수 있는 라우트에 적용:

```typescript
import { authMiddleware } from './core/middlewares/auth.middleware';

router.get('/protected', authMiddleware, controller.method);
```

### roleMiddleware

특정 역할만 접근할 수 있는 라우트에 적용:

```typescript
import { authMiddleware, roleMiddleware } from './core/middlewares/auth.middleware';

router.get(
  '/admin-only',
  authMiddleware,
  roleMiddleware('ADMIN'),
  controller.adminMethod
);
```

---

## 토큰 정보

- **알고리즘**: HS256
- **만료 시간**: 환경변수 `JWT_EXPIRES_IN` (기본값: 1d)
- **페이로드**:
  ```json
  {
    "userId": "uuid",
    "role": "USER" | "ADMIN",
    "iat": 1234567890,
    "exp": 1234567890
  }
  ```
