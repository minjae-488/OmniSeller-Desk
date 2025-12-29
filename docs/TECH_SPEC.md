# OmniSeller Desk - 기술 명세서

## 📋 문서 정보
**프로젝트명**: OmniSeller Desk  
**버전**: 1.0  
**작성일**: 2025-12-29

---

## 🎯 기술 스택

### 프론트엔드
- **프레임워크**: Next.js 14 + React 18 + TypeScript
- **UI**: TailwindCSS + shadcn/ui + Framer Motion
- **상태관리**: Zustand + TanStack Query
- **폼**: React Hook Form + Zod

### 백엔드
- **런타임**: Node.js 20 + Express + TypeScript
- **ORM**: TypeORM + PostgreSQL
- **캐시**: Redis
- **인증**: JWT + bcrypt
- **AI**: OpenAI GPT-4

### 외부 API
- 쿠팡, 스마트스토어, 도매꾹, 1688, Google Trends

---

## 🏗️ 시스템 아키텍처

```
클라이언트 (Next.js)
    ↓
API Gateway (Nginx)
    ↓
애플리케이션 (Express)
    ↓
데이터베이스 (PostgreSQL + Redis)
    ↓
외부 서비스
```

---

## 💻 프론트엔드 구조

```
frontend/
├── app/
│   ├── (auth)/login
│   └── (dashboard)/
│       ├── products
│       ├── sourcing
│       ├── orders
│       └── profit
├── components/
│   ├── ui/
│   ├── layout/
│   └── products/
├── lib/
├── hooks/
└── stores/
```

---

## 🔧 백엔드 구조

```
backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── entities/
│   ├── middlewares/
│   └── routes/
└── tests/
```

---

## 🗄️ 데이터베이스

### 주요 테이블
- users (사용자)
- products (상품 마스터)
- channel_mappings (채널 매핑)
- sourcing_candidates (소싱 후보)
- orders (주문)
- keywords (키워드)

---

## 🔌 API 연동

1. **쿠팡**: HMAC 인증
2. **스마트스토어**: OAuth 2.0
3. **도매꾹**: API Key
4. **OpenAI**: GPT-4 리스팅 생성
5. **Google Trends**: 키워드 분석

---

## 🐳 배포

Docker Compose로 통합 배포:
- PostgreSQL
- Redis
- Backend
- Frontend
- Nginx

---

## 🔒 보안

- JWT 인증
- bcrypt 해싱
- Rate Limiting
- CORS
- Input Validation (Zod)

---

## 📦 환경 변수

```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
OPENAI_API_KEY=...
COUPANG_ACCESS_KEY=...
```

---

**상세 내용은 TECH_SPEC_DETAIL.md 참조**
