# OmniSeller Desk

> 쿠팡 + 스마트스토어 기반 위탁판매 통합 운영·분석 대시보드

[![Deploy Frontend](https://github.com/<username>/OmniSeller-Desk/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/<username>/OmniSeller-Desk/actions/workflows/deploy-frontend.yml)
[![Deploy Backend](https://github.com/<username>/OmniSeller-Desk/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/<username>/OmniSeller-Desk/actions/workflows/deploy-backend.yml)

## 📋 프로젝트 소개

국내/해외 소싱 상품을 AI 기반으로 상품화하고, 멀티채널(쿠팡, 스마트스토어)에 등록·운영하며, 주문·매출·마진을 분석하고 트렌드/키워드 분석까지 한 웹 대시보드에서 통합 관리하는 내부용 툴입니다.

### 주요 기능

- 🛍️ **상품 마스터 관리**: 소싱처 상품을 내부 SKU로 표준화
- 🔍 **소싱 자동화**: 도매꾹 실시간 연동, 1688 데모
- 💰 **마진 엔진**: 채널별 수익성 계산 및 비교
- 📦 **주문 통합**: 쿠팡/스마트스토어 주문 통합 관리
- 📊 **매출 분석**: 마진 중심 성과 대시보드
- 📈 **트렌드 분석**: Google Trends 기반 키워드 발굴
- ✨ **AI 리스팅**: GPT-4 기반 상품명/설명 생성 + 리스크 검수
- 🌐 **통관부호 자동화**: 배송 모델별 PCCC 자동 분기

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 20 LTS
- PostgreSQL 16+
- Redis 7+

### 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/<username>/OmniSeller-Desk.git
cd OmniSeller-Desk

# 2. 프론트엔드 설정
cd frontend
npm install
cp .env.local.example .env.local
# .env.local 파일 수정 (API URL 등)

# 3. 백엔드 설정
cd ../backend
npm install
cp .env.example .env
# .env 파일 수정 (DB 연결 정보, API 키 등)

# 4. 데이터베이스 시작 (Docker)
docker-compose up -d postgres redis

# 5. 데이터베이스 마이그레이션
npm run migration:run

# 6. 개발 서버 시작
# 터미널 1: 백엔드
cd backend
npm run dev  # http://localhost:3001

# 터미널 2: 프론트엔드
cd frontend
npm run dev  # http://localhost:3000
```

## 📁 프로젝트 구조

```
OmniSeller-Desk/
├── frontend/              # Next.js 프론트엔드
│   ├── app/              # Next.js App Router
│   ├── components/       # React 컴포넌트
│   ├── lib/              # 유틸리티
│   ├── hooks/            # 커스텀 훅
│   └── stores/           # Zustand 스토어
├── backend/              # Express 백엔드
│   ├── src/
│   │   ├── controllers/  # 요청 핸들러
│   │   ├── services/     # 비즈니스 로직
│   │   ├── repositories/ # 데이터 접근
│   │   ├── entities/     # TypeORM 엔티티
│   │   └── routes/       # API 라우트
│   └── tests/            # 테스트
├── .github/
│   └── workflows/        # GitHub Actions
├── docs/                 # 문서
│   ├── PRD.md
│   ├── TECH_SPEC.md
│   └── DEPLOYMENT.md
└── docker-compose.yml    # 로컬 개발용
```

## 🛠️ 기술 스택

### 프론트엔드
- **프레임워크**: Next.js 14, React 18, TypeScript
- **UI**: TailwindCSS, shadcn/ui, Framer Motion
- **상태관리**: Zustand, TanStack Query
- **폼**: React Hook Form, Zod

### 백엔드
- **런타임**: Node.js 20, Express, TypeScript
- **데이터베이스**: PostgreSQL, TypeORM
- **캐시**: Redis
- **인증**: JWT, bcrypt
- **AI**: OpenAI GPT-4

### 배포
- **프론트엔드**: GitHub Pages (Static Export)
- **백엔드**: Vercel / Railway / Render
- **CI/CD**: GitHub Actions
- **데이터베이스**: Supabase / Vercel Postgres / Neon

## 📚 문서

- [PRD (제품 요구사항 정의서)](./PRD.md)
- [기술 명세서](./TECH_SPEC.md)
- [기술 명세서 상세](./TECH_SPEC_DETAIL.md)
- [배포 가이드](./DEPLOYMENT.md)

## 🗺️ 로드맵

### MVP 1 (2-3주) ✅ 진행 중
- [x] 프로젝트 초기화
- [ ] 상품 마스터 CRUD
- [ ] 도매꾹 소싱 연동
- [ ] 마진 계산기
- [ ] Home 대시보드

### MVP 2 (2-3주)
- [ ] 주문 통합 (쿠팡/스마트스토어)
- [ ] 위탁 운영 To-do
- [ ] 매출/성과 대시보드

### MVP 3 (2-3주)
- [ ] 트렌드/키워드 분석
- [ ] AI 리스팅 스튜디오
- [ ] 리스크 검수 시스템

### MVP 4 (3-4주)
- [ ] 1688 실제 연동
- [ ] PCCC 자동화 실가동

## 🤝 기여하기

이 프로젝트는 내부용 툴이지만, 개선 제안은 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

This project is licensed under the MIT License.

## 📧 연락처

프로젝트 관련 문의: [이메일 주소]

---

**Made with ❤️ for efficient e-commerce operations**
