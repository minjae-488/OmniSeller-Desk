# 🚀 백엔드 배포 가이드 (Railway)

## 📋 사전 준비

1. **Railway 계정 생성**
   - https://railway.app 접속
   - GitHub 계정으로 로그인

2. **GitHub 저장소 연결**
   - Railway 대시보드에서 "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - `OmniSeller-Desk` 저장소 선택

---

## 🗄️ PostgreSQL 데이터베이스 추가

1. **프로젝트에서 "New" 클릭**
2. **"Database" → "Add PostgreSQL" 선택**
3. **자동으로 `DATABASE_URL` 환경변수 생성됨**

---

## ⚙️ 환경변수 설정

Railway 프로젝트 설정에서 다음 환경변수를 추가하세요:

### 필수 환경변수

```bash
# 서버 설정
PORT=4000
NODE_ENV=production

# 데이터베이스 (자동 생성됨)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT 보안
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 환경변수 설정 방법

1. Railway 프로젝트 대시보드 열기
2. 서비스 선택 → "Variables" 탭
3. 위의 환경변수들을 하나씩 추가
4. `DATABASE_URL`은 PostgreSQL 서비스와 자동 연결됨

---

## 📦 배포 설정

### 1. Root Directory 설정

Railway 프로젝트 설정에서:
- **Settings** → **Root Directory** → `backend` 입력

### 2. Build Command (자동 감지됨)

```bash
npm ci && npx prisma generate && npm run build
```

### 3. Start Command (자동 감지됨)

```bash
npx prisma migrate deploy && npm start
```

---

## 🚀 배포 실행

1. **자동 배포**
   - `main` 브랜치에 푸시하면 자동으로 배포됨
   - Railway가 자동으로 빌드 및 배포 진행

2. **수동 배포**
   - Railway 대시보드에서 "Deploy" 버튼 클릭

3. **배포 로그 확인**
   - "Deployments" 탭에서 실시간 로그 확인

---

## 🔗 배포 URL 확인

1. **Railway 대시보드**에서 "Settings" 탭
2. **"Generate Domain"** 클릭
3. 생성된 URL 복사 (예: `https://omniseller-desk-production.up.railway.app`)

---

## 🧪 배포 테스트

### Health Check

```bash
curl https://your-app.up.railway.app
```

**예상 응답:**
```json
{
  "message": "OmniSeller Desk API Server is running! 🚀",
  "timestamp": "2025-12-31T..."
}
```

### 회원가입 테스트

```bash
curl -X POST https://your-app.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

---

## 🔧 프론트엔드 연결

배포된 백엔드 URL을 프론트엔드에 연결:

### 1. 프론트엔드 환경변수 업데이트

`frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
```

### 2. GitHub Pages 배포 시

`.github/workflows/deploy-frontend.yml`에 환경변수 추가:

```yaml
- name: Build with Next.js
  run: npm run build
  env:
    NODE_ENV: production
    NEXT_PUBLIC_API_URL: https://your-app.up.railway.app
```

---

## 🐛 트러블슈팅

### 1. 빌드 실패

**증상**: `prisma generate` 실패
**해결**: 
- `package.json`의 `postinstall` 스크립트 확인
- Railway 로그에서 정확한 에러 메시지 확인

### 2. 데이터베이스 연결 실패

**증상**: `Can't reach database server`
**해결**:
- PostgreSQL 서비스가 실행 중인지 확인
- `DATABASE_URL` 환경변수가 올바른지 확인

### 3. 마이그레이션 실패

**증상**: `prisma migrate deploy` 실패
**해결**:
```bash
# Railway CLI 설치
npm i -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 연결
railway link

# 마이그레이션 수동 실행
railway run npx prisma migrate deploy
```

---

## 📊 모니터링

### Railway 대시보드

- **Metrics**: CPU, 메모리, 네트워크 사용량
- **Logs**: 실시간 애플리케이션 로그
- **Deployments**: 배포 히스토리

### 로그 확인

```bash
# Railway CLI로 로그 확인
railway logs
```

---

## 💰 비용

- **무료 티어**: $5 크레딧/월 (취미 프로젝트 충분)
- **Hobby Plan**: $5/월 (더 많은 리소스)
- **Pro Plan**: $20/월 (프로덕션 환경)

---

## 🔄 CI/CD 자동화

Railway는 GitHub와 자동 연동되어:
- `main` 브랜치 푸시 시 자동 배포
- PR 생성 시 Preview 환경 자동 생성
- 배포 실패 시 자동 롤백

---

## 📝 체크리스트

배포 전 확인사항:

- [ ] Railway 계정 생성
- [ ] GitHub 저장소 연결
- [ ] PostgreSQL 데이터베이스 추가
- [ ] 환경변수 설정 (PORT, NODE_ENV, JWT_SECRET 등)
- [ ] Root Directory를 `backend`로 설정
- [ ] 도메인 생성
- [ ] Health Check 테스트
- [ ] 프론트엔드 API URL 업데이트

---

## 🎉 완료!

백엔드가 성공적으로 배포되었습니다!

**다음 단계**:
1. 프론트엔드 환경변수 업데이트
2. GitHub Pages 재배포
3. 전체 플로우 테스트 (회원가입 → 로그인 → 상품 관리)
