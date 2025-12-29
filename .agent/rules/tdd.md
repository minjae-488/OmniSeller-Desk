# Test-Driven Development (TDD) 규칙

##  개요

이 프로젝트는 **UI를 제외한 모든 코어 로직**에 대해 TDD(Test-Driven Development) 방식을 따릅니다.

---

##  적용 범위

###  TDD 적용 대상
- **백엔드 비즈니스 로직**
  - Service Layer (예: `auth.service.ts`, `product.service.ts`)
  - Utility Functions (예: `validation.util.ts`, `encryption.util.ts`)
  - Domain Logic (예: `margin-calculator.ts`, `score-calculator.ts`)
  - Middleware (예: `auth.middleware.ts`, `validation.middleware.ts`)
  
- **프론트엔드 비즈니스 로직**
  - State Management Logic (Zustand stores)
  - Utility Functions
  - Data Transformation Logic
  - Validation Logic

###  TDD 제외 대상
- **UI 컴포넌트** (React/Next.js 컴포넌트)
- **페이지 라우팅**
- **스타일링 (CSS/Tailwind)**
- **단순 설정 파일**

---

##  TDD 개발 프로세스

### Red-Green-Refactor 사이클

```
1.  RED: 실패하는 테스트 작성
   
2.  GREEN: 테스트를 통과하는 최소한의 코드 작성
   
3.  REFACTOR: 코드 개선 및 리팩토링
   
   (반복)
```

---

##  테스트 파일 구조

### 백엔드
```
backend/
 src/
    services/
       auth.service.ts
       auth.service.test.ts
    utils/
       validation.util.ts
       validation.util.test.ts
    middleware/
        auth.middleware.ts
        auth.middleware.test.ts
```

---

##  테스트 프레임워크

### 백엔드 (Node.js)
- **테스트 러너**: Jest
- **Assertion**: Jest built-in
- **Mocking**: Jest mocks

### 프론트엔드 (Next.js)
- **테스트 러너**: Jest + React Testing Library
- **Assertion**: Jest + @testing-library/jest-dom

---

##  테스트 커버리지 목표

### 최소 커버리지 요구사항
- **코어 비즈니스 로직**: 90% 이상
- **Service Layer**: 85% 이상
- **Utility Functions**: 95% 이상
- **Middleware**: 80% 이상

---

##  체크리스트

새로운 기능을 구현할 때:

- [ ] 테스트 파일 먼저 생성 (`*.test.ts`)
- [ ] 실패하는 테스트 작성 (Red)
- [ ] 테스트 실행  실패 확인
- [ ] 최소 구현으로 테스트 통과 (Green)
- [ ] 테스트 실행  성공 확인
- [ ] 코드 리팩토링 (Refactor)
- [ ] 엣지 케이스 테스트 추가
- [ ] 커버리지 확인

---

##  금지 사항

1. **테스트 없이 코어 로직 구현**
2. **구현 후 테스트 작성** (이것은 TDD가 아닙니다!)
3. **테스트를 통과시키기 위해 테스트 수정**
4. **의미 없는 테스트 작성** (커버리지만 채우는 테스트)

---

**작성일**: 2025-12-29  
**적용 범위**: 모든 코어 비즈니스 로직 (UI 제외)
