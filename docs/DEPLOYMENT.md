# OmniSeller Desk - 배포 전략

## 📋 배포 아키텍처

### 전체 구조
```
GitHub Repository
    ↓
GitHub Actions (CI/CD)
    ↓
├─ Frontend → GitHub Pages (정적 사이트)
└─ Backend → Vercel/Railway/Render (API 서버)
```

---

## 🎯 배포 전략

### 프론트엔드 (GitHub Pages)
- **호스팅**: GitHub Pages
- **빌드**: Next.js Static Export
- **도메인**: `https://<username>.github.io/OmniSeller-Desk`
- **자동 배포**: GitHub Actions

### 백엔드 (클라우드 서비스)
- **옵션 1**: Vercel (추천 - Next.js와 통합 우수)
- **옵션 2**: Railway (PostgreSQL 포함)
- **옵션 3**: Render (무료 티어 제공)
- **데이터베이스**: 각 서비스의 관리형 PostgreSQL

---

## 🔧 프론트엔드 설정

### Next.js Static Export 설정

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static HTML Export
  basePath: process.env.NODE_ENV === 'production' ? '/OmniSeller-Desk' : '',
  images: {
    unoptimized: true,  // GitHub Pages는 이미지 최적화 미지원
  },
  trailingSlash: true,  // GitHub Pages 호환성
}

module.exports = nextConfig
```

### package.json 스크립트

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export",
    "deploy": "npm run export && touch out/.nojekyll"
  }
}
```

---

## 🚀 GitHub Actions 워크플로우

### 프론트엔드 배포 (.github/workflows/deploy-frontend.yml)

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy-frontend.yml'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build
        working-directory: ./frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./frontend/out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 백엔드 CI/CD (.github/workflows/deploy-backend.yml)

```yaml
name: Deploy Backend

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run tests
        working-directory: ./backend
        run: npm test

      - name: Run linter
        working-directory: ./backend
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Vercel 배포 예시
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./backend
          vercel-args: '--prod'

      # 또는 Railway 배포
      # - name: Deploy to Railway
      #   uses: bervProject/railway-deploy@main
      #   with:
      #     railway_token: ${{ secrets.RAILWAY_TOKEN }}
      #     service: omniseller-backend
```

---

## 🔐 GitHub Secrets 설정

### 필수 Secrets

Repository Settings → Secrets and variables → Actions에서 설정:

```
API_URL                    # 백엔드 API URL (예: https://api.omniseller.com)
VERCEL_TOKEN              # Vercel 배포 토큰
VERCEL_ORG_ID             # Vercel Organization ID
VERCEL_PROJECT_ID         # Vercel Project ID

# 또는 Railway 사용 시
RAILWAY_TOKEN             # Railway 배포 토큰

# 백엔드 환경 변수 (Vercel/Railway 대시보드에서 설정)
DATABASE_URL
REDIS_URL
JWT_SECRET
OPENAI_API_KEY
COUPANG_ACCESS_KEY
COUPANG_SECRET_KEY
SMARTSTORE_CLIENT_ID
SMARTSTORE_CLIENT_SECRET
DOMEGOOK_API_KEY
```

---

## 📦 백엔드 배포 옵션 비교

### 옵션 1: Vercel (추천)

**장점**:
- Next.js와 완벽한 통합
- 자동 HTTPS
- 글로벌 CDN
- 무료 티어 (Hobby Plan)
- 간단한 배포

**단점**:
- Serverless 함수 (10초 제한)
- PostgreSQL 별도 필요 (Vercel Postgres 또는 외부)

**설정**:
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 옵션 2: Railway

**장점**:
- PostgreSQL 포함
- Redis 포함
- 간단한 배포
- 무료 티어 ($5 크레딧/월)
- 긴 실행 시간 지원

**단점**:
- 무료 티어 제한적
- 커스텀 도메인 설정 필요

**설정**:
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### 옵션 3: Render

**장점**:
- 완전 무료 티어
- PostgreSQL 포함
- 자동 HTTPS
- Docker 지원

**단점**:
- 무료 티어는 느림 (콜드 스타트)
- 월 750시간 제한

**설정**:
```yaml
# render.yaml
services:
  - type: web
    name: omniseller-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: omniseller-db
          property: connectionString

databases:
  - name: omniseller-db
    databaseName: omniseller
    user: omniseller
```

---

## 🗄️ 데이터베이스 옵션

### 옵션 1: Vercel Postgres
```bash
# Vercel 대시보드에서 Postgres 추가
# 자동으로 DATABASE_URL 환경 변수 설정됨
```

### 옵션 2: Supabase (무료)
```bash
# 1. Supabase 프로젝트 생성
# 2. Connection String 복사
# 3. 환경 변수에 설정

DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

### 옵션 3: Neon (무료)
```bash
# 1. Neon 프로젝트 생성
# 2. Connection String 복사

DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

---

## 🔄 배포 프로세스

### 1. 초기 설정

```bash
# 1. GitHub Repository 생성
git init
git remote add origin https://github.com/<username>/OmniSeller-Desk.git

# 2. GitHub Pages 활성화
# Repository Settings → Pages → Source: GitHub Actions

# 3. Vercel 프로젝트 생성 (백엔드)
# Vercel 대시보드에서 Import Project

# 4. 환경 변수 설정
# Vercel 대시보드 → Settings → Environment Variables
```

### 2. 로컬 개발

```bash
# 프론트엔드
cd frontend
npm install
npm run dev  # http://localhost:3000

# 백엔드
cd backend
npm install
npm run dev  # http://localhost:3001
```

### 3. 배포

```bash
# main 브랜치에 푸시하면 자동 배포
git add .
git commit -m "feat: 새 기능 추가"
git push origin main

# GitHub Actions가 자동으로:
# 1. 프론트엔드 빌드 → GitHub Pages 배포
# 2. 백엔드 테스트 → Vercel 배포
```

---

## 🌐 도메인 설정 (선택)

### GitHub Pages 커스텀 도메인

```bash
# 1. Repository Settings → Pages → Custom domain
# 2. CNAME 파일 생성
echo "omniseller.yourdomain.com" > frontend/public/CNAME

# 3. DNS 설정 (도메인 제공업체)
# CNAME 레코드 추가:
# omniseller.yourdomain.com → <username>.github.io
```

### Vercel 커스텀 도메인

```bash
# Vercel 대시보드 → Settings → Domains
# 1. 도메인 추가: api.omniseller.com
# 2. DNS 설정 (자동 안내)
```

---

## 📊 모니터링 & 로깅

### Vercel Analytics (무료)

```typescript
// frontend/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Vercel Speed Insights

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 🔍 트러블슈팅

### GitHub Pages 404 에러

```bash
# .nojekyll 파일 추가 (GitHub Actions에서 자동 생성)
touch out/.nojekyll
```

### API CORS 에러

```typescript
// backend/src/app.ts
import cors from 'cors';

app.use(cors({
  origin: [
    'https://<username>.github.io',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### 환경 변수 미적용

```bash
# Vercel: 환경 변수 변경 후 재배포 필요
vercel --prod

# GitHub Actions: Secrets 변경 후 워크플로우 재실행
```

---

## 📝 체크리스트

### 배포 전 확인사항

- [ ] `next.config.js`에 `output: 'export'` 설정
- [ ] `basePath` 설정 (GitHub Pages 사용 시)
- [ ] 환경 변수 모두 설정 (GitHub Secrets, Vercel)
- [ ] CORS 설정 (백엔드)
- [ ] API URL 설정 (프론트엔드)
- [ ] 데이터베이스 마이그레이션 실행
- [ ] `.nojekyll` 파일 생성

### 배포 후 확인사항

- [ ] 프론트엔드 접속 확인
- [ ] API 연결 확인
- [ ] 로그인/회원가입 테스트
- [ ] 주요 기능 동작 확인
- [ ] 모바일 반응형 확인
- [ ] 성능 측정 (Lighthouse)

---

**작성일**: 2025-12-29  
**버전**: 1.0
