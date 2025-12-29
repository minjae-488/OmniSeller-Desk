# 📋 OmniSeller-Desk MVP 상세 개발 작업 목록

이 문서는 TDD와 SOLID 원칙을 준수하기 위해 세분화된 작업 목록입니다.
각 체크박스는 **하나의 PR(Pull Request) 또는 하나의 커밋** 단위가 될 수 있습니다.

---

## 📅 Phase 1: 백엔드 파운데이션 (Backend Foundation)

### 1-1. 프로젝트 초기화 (Setup)
- [ ] **Express + TypeScript 기본 세팅**
  - `package.json` 초기화 및 의존성 설치 (`express`, `typescript`, `ts-node`, `nodemon`)
  - `tsconfig.json` 설정 (`strict: true`, `path mapping`)
  - `.gitignore`, `.editorconfig` 설정
- [ ] **환경변수 및 설정 관리**
  - `dotenv` 설치
  - `ConfigService` 구현 (환경변수 타입 체크 및 유효성 검사)
- [ ] **로깅 및 에러 핸들링**
  - 전역 에러 처리 미들웨어 (`GlobalExceptionHandler`)
  - 비동기 에러 포착을 위한 유틸리티 (`asyncHandler`)
  - 로거 설정 (`winston` + `morgan`)

### 1-2. 데이터베이스 (Prisma)
- [ ] **DB 환경 구축**
  - `docker-compose.yml` DB 서비스 헬스체크 추가
  - Prisma 초기화 (`prisma init`)
- [ ] **User 모델링**
  - `schema.prisma`에 `User` 모델 정의 (email, password, name, role)
  - 마이그레이션 파일 생성 및 적용
- [ ] **PrismaClient 설정**
  - 싱글톤 패턴으로 `PrismaService` 구현

### 1-3. 인증 (Auth) 모듈 - [TDD]
**목표**: 안전한 회원가입 및 로그인 시스템 구축

#### Utility & Domain
- [ ] **[TDD] 비밀번호 해싱 유틸리티**
  - `PasswordService` 인터페이스 정의
  - `BcryptPasswordService` 구현 (hash, compare)
  - 🔴 테스트: 해싱된 값 비동일성 확인
- [ ] **[TDD] 토큰 관리자**
  - `TokenService` 인터페이스 정의
  - `JwtTokenService` 구현 (sign, verify, decode)
  - 🔴 테스트: 토큰 생성 및 유효성 검증

#### Registration (회원가입)
- [ ] **[TDD] 회원가입 요청 검증**
  - `RegisterDto` 정의 및 Zod 스키마 작성
  - 🔴 테스트: 잘못된 이메일/비번 형식 감지
- [ ] **[TDD] 이메일 중복 체크 로직**
  - `UserService.checkEmailDuplicate(email)`
  - 🔴 테스트: 중복된 이메일 입력 시 예외 발생
- [ ] **[TDD] 사용자 생성 로직**
  - `UserService.createUser(dto)`
  - 🔴 테스트: DB 저장 후 비밀번호 해싱 여부 확인

#### Authentication (로그인)
- [ ] **[TDD] 로그인 요청 검증**
  - `LoginDto` 정의 및 Zod 스키마
- [ ] **[TDD] 사용자 검증 로직**
  - `AuthService.validateUser(email, password)`
  - 🔴 테스트: 비번 불일치 시 `InvalidPasswordException`
- [ ] **[TDD] 인증 미들웨어**
  - `AuthMiddleware` 구현 (Bearer 토큰 파싱)
  - 🔴 테스트: 토큰 없음/만료 시 401 응답

---

## 🎨 Phase 2: 프론트엔드 파운데이션 (Frontend Foundation)

### 2-1. 프로젝트 스캐폴딩
- [ ] **Next.js 14 초기화**
  - App Router, TypeScript, Tailwind CSS
  - 폴더 구조 정립 (`app`, `components`, `lib`, `store`)
- [ ] **스타일 시스템 구축**
  - `colors`, `typography` 등 Tailwind 테마 커스텀
  - `clsx` 또는 `tailwind-merge` 유틸리티 설정

### 2-2. 핵심 컴포넌트 (Atomic)
- [ ] **Button 컴포넌트** (variants: primary, secondary, outline)
- [ ] **InputField 컴포넌트** (label, error message 포함)
- [ ] **Card 컴포넌트** (기본 컨테이너)
- [ ] **Modal 컴포넌트** (Portal 사용)

### 2-3. API 및 상태 관리
- [ ] **API 클라이언트 (Axios)**
  - 인스턴스 생성 및 Interceptor 설정 (토큰 자동 주입)
  - 에러 응답 표준 처리
- [ ] **[TDD] 인증 스토어 (Zustand)**
  - `useAuthStore` (login, logout, setUser)
  - 🔴 테스트: 상태 변경 로직 검증

---

## 📦 Phase 3: 상품 관리 시스템 (Products) - [TDD]

### 3-1. 상품 도메인 설계 (Backend)
- [ ] **상품 모델링**
  - `schema.prisma`에 `Product`, `ProductImage` 모델 정의
- [ ] **[TDD] 상품 유효성 검사**
  - `CreateProductDto` (필수값, 타입 확인)
  - `UpdateProductDto` (Partial 타입)
  - 🔴 테스트: 가격 음수 불가, 필수값 누락 체크
- [ ] **[TDD] 마진 계산기 (Domain Logic)**
  - `MarginCalculator` 클래스
  - 기능: 매입가/판매가/수수료 입력 -> 마진/마진율 반환
  - 🔴 테스트: 계산 정확도, 0으로 나누기 방어

### 3-2. 상품 서비스 (Backend)
- [ ] **[TDD] 상품 생성 서비스**
  - `ProductService.createProduct()`
  - 🔴 테스트: DB 저장 확인, 기본값 설정 확인
- [ ] **[TDD] 상품 목록 조회 (페이지네이션)**
  - `ProductService.getProducts(page, limit, filter)`
  - 🔴 테스트: 페이징 계산, 필터링 로직 확인
- [ ] **[TDD] 상품 소유권 확인**
  - 수정/삭제 시 본인 상품인지 확인하는 로직
  - 🔴 테스트: 타인 상품 수정 시도 시 `ForbiddenException`

### 3-3. 프론트엔드 구현
- [ ] **상품 등록 폼 구현**
  - `React Hook Form` + `Zod` 연동
  - 이미지 업로드 UI
- [ ] **마진율 계산기 컴포넌트**
  - 입력값 변화에 따른 실시간 계산 표시
- [ ] **상품 목록 테이블 (Data Grid)**

---

## 🔌 Phase 4: 마켓 연동 시스템 (Market Integration) - [TDD/SOLID]

### 4-1. 연동 아키텍처 (Backend)
- [ ] **[TDD] Market Adapter 인터페이스**
  - `IMarketAdapter` 정의 (`uploadProduct`, `updateProduct`)
  - `MarketPlatform` Enum 정의 (NAVER, COUPANG)
- [ ] **[TDD] Adapter Factory**
  - `MarketAdapterFactory.getAdapter(platform)`
  - 🔴 테스트: 플랫폼별 올바른 인스턴스 반환 확인

### 4-2. 네이버 스마트스토어 구현
- [ ] **[TDD] 데이터 변환기 (Mapper)**
  - `NaverProductMapper.toExternal(product)`
  - 내부 `Product` -> 네이버 API JSON 포맷 변환
  - 🔴 테스트: 필수 필드 매핑 정확도 확인
- [ ] **[TDD] 네이버 API 클라이언트**
  - `NaverApiClient` (Axios 래퍼)
  - 인증(HMAC 등) 처리 로직
  - 🔴 테스트: Mock Server를 이용한 요청/응답 처리 확인

---

## 🚀 Phase 5: 통합 및 배포

- [ ] **수동 시나리오 점검 (Manual Testing)**
  - 주요 사용자 시나리오(회원가입 → 상품등록 → 마켓전송) 직접 수행
  - ⚠️ **주의**: UI 자동화 테스트(Cypress 등)는 작성하지 않음
- [ ] **Docker 배포 설정** (`Dockerfile` 최적화)
- [ ] **CI/CD 파이프라인** (GitHub Actions)
  - 빌드 및 단위 테스트(Unit Test) 자동화 설정

---
**범례**:
- `[TDD]`: 테스트 코드 작성이 필수인 작업
- `🔴`: Red 단계 (실패하는 테스트 작성)
- `DTO`: Data Transfer Object
