$issues = @(
    @{
        title = "[Setup] Express + TypeScript 프로젝트 초기화"
        body = @"
## 1. 배경 (Background)
안정적이고 타입 안전성이 보장되는 백엔드 개발 환경을 구축하기 위해 Express와 TypeScript 기반의 프로젝트 구조를 수립해야 합니다.

## 2. 작업 내용 (Scope of Work)
- npm 프로젝트 초기화 및 `package.json` 구성
- 핵심 의존성 설치 (`express`, `typescript`, `ts-node`, `nodemon` 등)
- `tsconfig.json` 설정 (Strict Mode 활성화, Path Mapping 등)
- `.gitignore` 및 `.editorconfig` 설정

## 3. 인수 조건 (Acceptance Criteria)
- [ ] `npm run dev` 명령어로 서버가 에러 없이 실행되어야 한다.
- [ ] TypeScript 컴파일 설정이 올바르게 동작해야 한다.
- [ ] Git 저장소에 node_modules 등 불필요한 파일이 제외되어야 한다.
"@
    },
    @{
        title = "[Setup] 환경변수 및 설정 관리 (ConfigService)"
        body = @"
## 1. 배경 (Background)
개발, 테스트, 운영 환경별로 상이한 설정을 안전하고 체계적으로 관리하기 위해 중앙화된 설정 관리 모듈이 필요합니다.

## 2. 작업 내용 (Scope of Work)
- `dotenv` 패키지 설치 및 설정
- `ConfigService` 클래스 구현
- 필수 환경변수(PORT, DB_URL 등) 유효성 검사 로직 구현

## 3. 인수 조건 (Acceptance Criteria)
- [ ] `.env` 파일에서 환경변수를 올바르게 로드해야 한다.
- [ ] 필수 환경변수 누락 시 서버 시작이 차단되고 에러가 출력되어야 한다.
- [ ] `process.env` 접근을 캡슐화하여 타입 안전성을 보장해야 한다.
"@
    },
    @{
        title = "[Setup] 로깅 및 전역 에러 핸들링"
        body = @"
## 1. 배경 (Background)
시스템 운영 중 발생하는 오류를 일관된 형식으로 처리하고, 효과적인 디버깅을 위해 체계적인 로깅 시스템이 필요합니다.

## 2. 작업 내용 (Scope of Work)
- 전역 에러 핸들러 미들웨어 (`GlobalExceptionHandler`) 구현
- 비동기 함수 에러 포착을 위한 `asyncHandler` 유틸리티 구현
- `winston` 기반의 구조화된 로거 설정 (Console 및 File 출력)
- HTTP 요청 로깅을 위한 `morgan` 설정

## 3. 인수 조건 (Acceptance Criteria)
- [ ] 예기치 않은 오류 발생 시 서버가 죽지 않고 표준 에러 응답(JSON)을 반환해야 한다.
- [ ] 모든 API 요청과 에러 흐름이 로그에 기록되어야 한다.
"@
    },
    @{
        title = "[DB] 데이터베이스 환경 구축 (PostgreSQL + Prisma)"
        body = @"
## 1. 배경 (Background)
데이터의 영구 저장을 위해 관계형 데이터베이스(RDBMS) 환경을 구축하고, ORM을 통해 생산성을 높여야 합니다.

## 2. 작업 내용 (Scope of Work)
- `docker-compose.yml`에 PostgreSQL 서비스 구성 및 헬스체크 추가
- Prisma ORM 초기화 (`prisma init`)
- DB 연결 정보 설정

## 3. 인수 조건 (Acceptance Criteria)
- [ ] Docker로 PostgreSQL 컨테이너가 정상 실행되어야 한다.
- [ ] `prisma studio` 등을 통해 DB 접속이 확인되어야 한다.
"@
    },
    @{
        title = "[DB] 사용자(User) 모델링 및 마이그레이션"
        body = @"
## 1. 배경 (Background)
서비스 사용자를 식별하고 관리하기 위해 사용자 데이터 모델을 정의해야 합니다.

## 2. 작업 내용 (Scope of Work)
- `schema.prisma`에 `User` 모델 정의
  - 필드: id, email, password, name, role, createdAt, updatedAt
- Prisma 마이그레이션 파일 생성 및 적용

## 3. 인수 조건 (Acceptance Criteria)
- [ ] 마이그레이션이 에러 없이 DB에 적용되어야 한다.
- [ ] 데이터베이스에 `User` 테이블이 생성되어야 한다.
"@
    },
    @{
        title = "[DB] Prisma Client 서비스 구현"
        body = @"
## 1. 배경 (Background)
데이터베이스 연결을 효율적으로 관리하기 위해 싱글톤 패턴 기반의 DB 클라이언트 서비스가 필요합니다.

## 2. 작업 내용 (Scope of Work)
- `PrismaService` 클래스 구현 (Singleton Pattern)
- 어플리케이션 종료 시 연결 해제 처리 (Graceful Shutdown)

## 3. 인수 조건 (Acceptance Criteria)
- [ ] 앱 전역에서 하나의 Prisma 인스턴스만 사용되어야 한다.
- [ ] DB 연결 및 해제가 안정적으로 수행되어야 한다.
"@
    },
    @{
        title = "[Auth] 비밀번호 해싱 유틸리티 구현 [TDD]"
        body = @"
## 1. 배경 (Background)
사용자의 비밀번호는 보안을 위해 절대로 평문으로 저장되어서는 안 되며, 강력한 단방향 암호화를 적용해야 합니다.

## 2. 작업 내용 (Scope of Work)
- `PasswordService` 인터페이스 정의
- `BcryptPasswordService` 구현 (`bcrypt` 라이브러리 활용)
- **TDD 적용**: 테스트 코드 먼저 작성

## 3. 인수 조건 (Acceptance Criteria)
- [ ] **[Test]** 동일한 평문 비밀번호라도 해싱할 때마다 다른 값이 생성되어야 한다 (Salt 적용).
- [ ] **[Test]** 저장된 해시값과 평문 비밀번호의 일치 여부를 정확히 검증해야 한다.
"@
    },
    @{
        title = "[Auth] JWT 토큰 관리자 구현 [TDD]"
        body = @"
## 1. 배경 (Background)
Stateless한 인증 시스템 구축을 위해 JWT(Json Web Token) 발급 및 검증 메커니즘이 필요합니다.

## 2. 작업 내용 (Scope of Work)
- `TokenService` 인터페이스 정의
- `JwtTokenService` 구현 (Access Token 발급, 검증, 디코딩)
- **TDD 적용**: 테스트 코드 먼저 작성

## 3. 인수 조건 (Acceptance Criteria)
- [ ] **[Test]** 유효한 Payload로 토큰이 정상 발급되어야 한다.
- [ ] **[Test]** 만료된 토큰이나 변조된 토큰은 검증에 실패해야 한다.
"@
    },
    @{
        title = "[Auth] 회원가입 기능 구현 [TDD]"
        body = @"
## 1. 배경 (Background)
신규 사용자가 서비스에 등록할 수 있는 기능입니다.

## 2. 작업 내용 (Scope of Work)
- `RegisterDto` 정의 및 유효성 검사 (Zod)
- 이메일 중복 체크 로직
- 사용자 생성 서비스 로직 (`UserService.createUser`)
- **TDD 적용**: 테스트 코드 먼저 작성

## 3. 인수 조건 (Acceptance Criteria)
- [ ] **[Test]** 중복된 이메일로 가입 시도 시 적절한 예외가 발생해야 한다.
- [ ] **[Test]** 정상 가입 시 비밀번호는 반드시 암호화되어 저장되어야 한다.
"@
    },
    @{
        title = "[Auth] 로그인 기능 구현 [TDD]"
        body = @"
## 1. 배경 (Background)
등록된 사용자가 이메일과 비밀번호를 통해 인증 토큰을 발급받을 수 있어야 합니다.

## 2. 작업 내용 (Scope of Work)
- `LoginDto` 정의 및 유효성 검사
- 사용자 인증 로직 (`AuthService.validateUser`)
- 토큰 발급 및 응답 로직
- **TDD 적용**: 테스트 코드 먼저 작성

## 3. 인수 조건 (Acceptance Criteria)
- [ ] **[Test]** 존재하지 않는 이메일이나 틀린 비밀번호 입력 시 인증 실패 처리되어야 한다.
- [ ] **[Test]** 인증 성공 시 유효한 Access Token이 반환되어야 한다.
"@
    },
    @{
        title = "[Auth] 인증 미들웨어 구현 [TDD]"
        body = @"
## 1. 배경 (Background)
보호된 API 엔드포인트에 접근할 때 요청의 인증 헤더를 검사하여 사용자 신원을 확인해야 합니다.

## 2. 작업 내용 (Scope of Work)
- `AuthMiddleware` 구현
- Authorization 헤더 파싱 (Bearer Token)
- 토큰 검증 및 `req.user` 주입
- **TDD 적용**: 테스트 코드 먼저 작성

## 3. 인수 조건 (Acceptance Criteria)
- [ ] **[Test]** 헤더에 토큰이 없거나 유효하지 않은 경우 401 Unauthorized 응답을 해야 한다.
- [ ] **[Test]** 유효한 토큰인 경우 다음 미들웨어로 제어가 넘어가야 한다.
"@
    }
)

foreach ($issue in $issues) {
    Write-Host "Creating issue: $($issue.title)..."
    gh issue create --title $issue.title --body $issue.body
    Start-Sleep -Seconds 2
}
Write-Host "All Phase 1 issues created successfully!"
