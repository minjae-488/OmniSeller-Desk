# 📋 OmniSeller-Desk MVP 개발 작업 목록

이 문서는 OmniSeller-Desk의 MVP(Minimum Viable Product) 개발을 위한 상세 작업 목록입니다.
모든 백엔드 코어 로직과 비즈니스 로직은 **TDD(Test-Driven Development)** 원칙에 따라 개발되어야 합니다.

---

## 📅 Phase 1: 백엔드 파운데이션 (Backend Foundation)

### 1-1. 프로젝트 초기화 및 설정
- [ ] **Express + TypeScript 프로젝트 생성**
  - `npm init`, 필요한 패키지 설치 (`express`, `typescript`, `ts-node`, `nodemon` 등)
  - `tsconfig.json` 설정 (Strict 모드 활성화)
- [ ] **에러 핸들링 및 로깅 설정**
  - 전역 에러 핸들러 미들웨어 구현
  - `winston` 또는 `morgan` 로거 설정
- [ ] **환경변수 설정**
  - `dotenv` 설정 및 `.env.example` 생성
  - `config` 모듈 구현 (환경변수 유효성 검사 포함)

### 1-2. 데이터베이스 설계 및 설정 (Prisma)
- [ ] **Docker Compose 로컬 DB 실행**
  - PostgreSQL 컨테이너 실행 확인
- [ ] **Prisma 초기화**
  - `prisma init` 실행
- [ ] **스키마 모델링 (`schema.prisma`)**
  - `User` (사용자) 모델 정의
  - `MarketAccount` (마켓 계정 정보) 모델 정의
  - `Product` (상품) 모델 정의
  - `ProductImage` (상품 이미지) 모델 정의
- [ ] **마이그레이션 적용**
  - 초기 DB 마이그레이션 실행

### 1-3. 인증(Auth) 모듈 - 🔴 TDD 적용 필수
- [ ] **비밀번호 암호화 유틸리티** (Service)
  - `bcrypt` 래퍼 함수 (hash, compare)
  - 🧪 테스트 케이스 작성 (해싱 확인, 불일치 확인)
- [ ] **JWT 토큰 생성/검증 유틸리티** (Service/Util)
  - Token 발급, 검증, 만료 처리
  - 🧪 테스트 케이스 작성
- [ ] **회원가입 로직** (Service)
  - 중복 이메일 체크, DB 저장
  - 🧪 테스트 케이스 작성
- [ ] **로그인 로직** (Service)
  - 이메일/비번 검증, 토큰 반환
  - 🧪 테스트 케이스 작성
- [ ] **인증 미들웨어** (Middleware)
  - 헤더에서 토큰 추출 및 검증
  - 🧪 테스트 케이스 작성

---

## 🎨 Phase 2: 프론트엔드 파운데이션 (Frontend Foundation)

### 2-1. 프로젝트 초기화
- [ ] **Next.js 프로젝트 생성**
  - App Router, TypeScript, Tailwind CSS 사용
- [ ] **기본 레이아웃 구성**
  - `layout.tsx` (Root Layout)
  - Sidebar, Header, Main Content 영역 분리
- [ ] **UI 컴포넌트 시스템 구축 (Atomic Design)**
  - `Button`, `Input`, `Card`, `Modal` 등 기본 컴포넌트
  - Tailwind 기반 스타일링

### 2-2. 상태 관리 및 유틸리티 - 🔴 TDD 적용 권장
- [ ] **API 클라이언트 설정**
  - `axios` 또는 `fetch` 래퍼 (인터셉터 설정: 토큰 자동 주입)
- [ ] **인증 상태 관리 (Zustand)**
  - `useAuthStore` 생성 (로그인/로그아웃/유저정보)
  - 🧪 Store 로직 테스트

### 2-3. 인증 UI 구현
- [ ] **로그인 페이지**
  - 폼 디자인, 유효성 검사, API 연동
- [ ] **회원가입 페이지**
  - 폼 디자인, 유효성 검사, API 연동

---

## 📦 Phase 3: 상품 관리 시스템 (Product Management System)

### 3-1. 백엔드 상품 로직 - 🔴 TDD 적용 필수
- [ ] **상품 유효성 검사 로직** (Util)
  - 필수 필드 검사, 가격 검증 (음수 불가 등)
  - 🧪 테스트 작성
- [ ] **마진 계산 로직** (Domain Logic)
  - 매입가, 판매가, 수수료 기반 마진율 계산
  - 🧪 테스트 작성 (다양한 시나리오)
- [ ] **상품 CRUD 서비스** (Service)
  - 생성, 조회(목록/상세), 수정, 삭제
  - 🧪 테스트 작성

### 3-2. 프론트엔드 상품 UI
- [ ] **상품 목록 페이지**
  - 데이터 테이블, 페이지네이션, 필터링
- [ ] **상품 등록/수정 페이지**
  - 복합 폼 (기본정보, 가격, 옵션, 이미지)
  - 이미지 업로드 UI (Drag & Drop)
  - 실시간 마진율 미리보기

---

## 🔌 Phase 4: 마켓 연동 시스템 (Market Integration System)

### 4-1. 연동 아키텍처 (Backend) - 🔴 TDD 적용 필수
- [ ] **Market Adapter 패턴 설계**
  - `IMarketAdapter` 인터페이스 정의 (Strategy Pattern)
  - 🧪 인터페이스 기반 Mock 테스트 작성
- [ ] **표준 상품 데이터 변환기**
  - 내부 `Product` 모델 → 마켓별 JSON 포맷 변환
  - 🧪 변환 로직 테스트

### 4-2. 마켓별 어댑터 구현 (우선순위: 스마트스토어)
- [ ] **네이버 스마트스토어 어댑터**
  - 상품 등록 API 연동
  - 상품 수정 API 연동
- [ ] **쿠팡 어댑터** (추후 구현)

---

## 🚀 Phase 5: 배포 및 마무리

- [ ] **배포 환경 구성**
  - Vercel (Frontend & Backend) 환경변수 주입
- [ ] **CI/CD 파이프라인 점검**
  - 자동 빌드 및 테스트 통과 확인
- [ ] **최종 E2E 테스트**
  - 주요 사용자 시나리오(회원가입 → 상품등록 → 마켓전송) 테스트

---

## 📝 메모
- 모든 API는 RESTful 원칙을 준수하여 설계합니다.
- 백엔드 개발 시 Service Layer에 대한 단위 테스트는 커버리지 **85% 이상**을 유지해야 합니다.
- 커밋 메시지는 Conventional Commits 규약을 따릅니다.
