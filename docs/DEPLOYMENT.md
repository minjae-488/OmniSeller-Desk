# 배포 가이드 (Deployment Guide)

OmniSeller-Desk 프로젝트의 배포 가이드입니다.

## 📋 목차

- [배포 아키텍처](#배포-아키텍처)
- [백엔드 배포 (Railway)](#백엔드-배포-railway)
- [프론트엔드 배포 (GitHub Pages)](#프론트엔드-배포-github-pages)
- [환경변수 설정](#환경변수-설정)
- [배포 확인](#배포-확인)
- [트러블슈팅](#트러블슈팅)

---

## 🏗️ 배포 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│                  minjae-488/OmniSeller-Desk             │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             │ (push to main)             │ (push to main)
             │                            │
             ▼                            ▼
    ┌────────────────┐          ┌──────────────────┐
    │   Railway      │          │  GitHub Actions  │
    │   (Backend)    │◄─────────│  (Frontend CI)   │
    │                │          │                  │
    │ PostgreSQL DB  │          │  Build & Deploy  │
    └────────────────┘          └──────────────────┘
             │                            │
             │ API Endpoint               │ Static Files
             │                            │
             ▼                            ▼
    https://web-production-    https://minjae-488.github.io/
    90967.up.railway.app       OmniSeller-Desk/
```

---

## 🚀 백엔드 배포 (Railway)

### 1. Railway 프로젝트 생성

1. [Railway](https://railway.app) 접속 및 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. `minjae-488/OmniSeller-Desk` 저장소 선택

### 2. 서비스 설정

#### Root Directory 설정
- **Settings** → **Root Directory**: `backend`

#### 환경변수 설정
**Variables** 탭에서 다음 환경변수 추가:

```env
# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 서버 설정
PORT=4000
NODE_ENV=production
```

> **⚠️ 중요**: `JWT_SECRET`은 반드시 안전한 랜덤 문자열로 변경하세요!

#### PostgreSQL 데이터베이스 추가
1. Railway 프로젝트에서 **"+ New"** 클릭
2. **"Database"** → **"Add PostgreSQL"** 선택
3. 자동으로 `DATABASE_URL` 환경변수가 생성됩니다
4. 백엔드 서비스에서 이 변수를 참조하도록 설정

### 3. 배포 설정 파일

프로젝트 루트에 `railway.json` 파일이 이미 생성되어 있습니다:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4. 자동 배포

- `main` 브랜치에 푸시하면 자동으로 Railway가 배포를 시작합니다
- **Deployments** 탭에서 배포 상태를 확인할 수 있습니다
- **Logs** 탭에서 실시간 로그를 확인할 수 있습니다

### 5. 배포 URL

배포 완료 후 다음 URL에서 API에 접근할 수 있습니다:
- **Production URL**: `https://web-production-90967.up.railway.app`
- **Health Check**: `https://web-production-90967.up.railway.app/`

---

## 🌐 프론트엔드 배포 (GitHub Pages)

### 1. GitHub Pages 설정

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source**: GitHub Actions 선택
3. 자동으로 `.github/workflows/deploy-frontend.yml` 워크플로우가 실행됩니다

### 2. 배포 워크플로우

`.github/workflows/deploy-frontend.yml` 파일이 자동 배포를 담당합니다:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: ["main"]
    paths:
      - 'frontend/**'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Build with Next.js
        run: npm run build
        env:
          NODE_ENV: production
          NEXT_PUBLIC_API_URL: https://web-production-90967.up.railway.app
```

### 3. Next.js 정적 Export 설정

`frontend/next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/OmniSeller-Desk',
  images: {
    unoptimized: true,
  },
};
```

### 4. 자동 배포

- `frontend/` 디렉토리의 변경사항을 `main` 브랜치에 푸시하면 자동 배포
- **Actions** 탭에서 배포 상태 확인 가능

### 5. 배포 URL

- **Production URL**: `https://minjae-488.github.io/OmniSeller-Desk/`

---

## 🔐 환경변수 설정

### 백엔드 (Railway)

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 URL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT 토큰 서명 키 | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT 토큰 만료 시간 | `7d` |
| `PORT` | 서버 포트 | `4000` |
| `NODE_ENV` | 실행 환경 | `production` |

### 프론트엔드 (GitHub Actions)

| 변수명 | 설명 | 설정 위치 |
|--------|------|----------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | `.github/workflows/deploy-frontend.yml` |

**로컬 개발 환경** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## ✅ 배포 확인

### 백엔드 확인

1. **Health Check**:
   ```bash
   curl https://web-production-90967.up.railway.app/
   ```
   
   예상 응답:
   ```json
   {
     "message": "OmniSeller Desk API Server is running! 🚀",
     "timestamp": "2025-01-30T04:35:37.882Z"
   }
   ```

2. **회원가입 테스트**:
   ```bash
   curl -X POST https://web-production-90967.up.railway.app/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test1234!",
       "name": "Test User"
     }'
   ```

### 프론트엔드 확인

1. 브라우저에서 `https://minjae-488.github.io/OmniSeller-Desk/` 접속
2. 로그인/회원가입 페이지 확인
3. 개발자 도구 → Network 탭에서 API 요청 확인

---

## 🔧 트러블슈팅

### Railway 배포 실패

#### 1. Prisma 스키마 오류
**증상**: `Prisma schema validation - Error code: P1012`

**해결**:
- Prisma 버전을 5.x로 다운그레이드 (이미 적용됨)
- `backend/package.json`:
  ```json
  {
    "dependencies": {
      "@prisma/client": "^5.22.0"
    },
    "devDependencies": {
      "prisma": "^5.22.0"
    }
  }
  ```

#### 2. TypeScript 경로 별칭 오류
**증상**: `Cannot find module '@/utils/logger'`

**해결**:
- `tsc-alias`를 사용하여 빌드 시 경로 변환 (이미 적용됨)
- `backend/package.json`:
  ```json
  {
    "scripts": {
      "build": "tsc && tsc-alias"
    },
    "devDependencies": {
      "tsc-alias": "^1.8.16"
    }
  }
  ```

#### 3. DATABASE_URL 연결 실패
**증상**: `Can't reach database server`

**해결**:
1. Railway PostgreSQL 서비스가 실행 중인지 확인
2. `DATABASE_URL` 환경변수가 올바른지 확인
3. Railway 내부 네트워크 주소 사용: `postgres.railway.internal`

### GitHub Pages 배포 실패

#### 1. 404 에러
**증상**: 페이지 접속 시 404 오류

**해결**:
- `frontend/public/.nojekyll` 파일 존재 확인
- `basePath` 설정 확인: `/OmniSeller-Desk`

#### 2. API 연결 실패
**증상**: 로그인/회원가입 실패

**해결**:
1. 브라우저 개발자 도구 → Console 확인
2. CORS 오류 확인
3. `NEXT_PUBLIC_API_URL`이 올바른지 확인
4. Railway 백엔드가 실행 중인지 확인

---

## 📝 배포 체크리스트

### 백엔드 배포 전

- [ ] `DATABASE_URL` 환경변수 설정
- [ ] `JWT_SECRET` 안전한 값으로 변경
- [ ] PostgreSQL 데이터베이스 생성
- [ ] Root Directory를 `backend`로 설정

### 프론트엔드 배포 전

- [ ] `NEXT_PUBLIC_API_URL`을 Railway URL로 설정
- [ ] `basePath` 설정 확인
- [ ] `.nojekyll` 파일 존재 확인

### 배포 후

- [ ] 백엔드 Health Check 확인
- [ ] 프론트엔드 페이지 접속 확인
- [ ] 회원가입/로그인 기능 테스트
- [ ] 상품 관리 기능 테스트

---

## 🔄 업데이트 방법

### 코드 변경 후 배포

1. 변경사항 커밋:
   ```bash
   git add .
   git commit -m "feat: 새로운 기능 추가"
   ```

2. `main` 브랜치에 푸시:
   ```bash
   git push origin main
   ```

3. 자동 배포 확인:
   - **Railway**: Deployments 탭
   - **GitHub Pages**: Actions 탭

---

## 📞 지원

배포 관련 문제가 발생하면:
1. Railway Logs 확인
2. GitHub Actions 로그 확인
3. 이 문서의 트러블슈팅 섹션 참조

---

**마지막 업데이트**: 2025-01-30  
**배포 상태**: ✅ 프로덕션 운영 중
