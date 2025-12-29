# GitHub 설정 가이드 🚀

## ✅ 완료된 작업

- ✅ GitHub Repository 생성: https://github.com/minjae-488/OmniSeller-Desk
- ✅ 로컬 코드 푸시 완료
- ✅ 모든 파일 및 폴더 정상 업로드 확인

---

## 📋 다음 단계: GitHub Pages 활성화

### 1. GitHub Pages 설정

1. **설정 페이지로 이동**
   - 링크: https://github.com/minjae-488/OmniSeller-Desk/settings/pages

2. **Build and deployment 섹션 찾기**
   - "Source" 드롭다운 메뉴 클릭

3. **GitHub Actions 선택**
   - 기본값: `Deploy from a branch`
   - 변경: **`GitHub Actions`** 선택
   - 자동 저장됨 (별도 저장 버튼 없음)

4. **확인**
   - Source가 "GitHub Actions"로 변경되었는지 확인

---

## 🔐 GitHub Secrets 설정

프론트엔드와 백엔드 배포를 위해 필요한 환경변수를 설정합니다.

### 설정 페이지 이동
- 링크: https://github.com/minjae-488/OmniSeller-Desk/settings/secrets/actions

### 프론트엔드용 Secrets

#### `API_URL`
- **설명**: 백엔드 API 엔드포인트 URL
- **값 예시**: `https://omniseller-api.vercel.app/api`
- **설정 시점**: 백엔드 배포 후 (Vercel URL 확인 후)

### 백엔드용 Secrets (Vercel 배포 시)

#### `VERCEL_TOKEN`
- **설명**: Vercel 계정 토큰
- **발급 방법**:
  1. https://vercel.com/account/tokens 접속
  2. "Create Token" 클릭
  3. Token Name: `OmniSeller-Desk-Deploy`
  4. Scope: Full Account
  5. Expiration: No Expiration (또는 원하는 기간)
  6. 생성된 토큰 복사

#### `VERCEL_ORG_ID`
- **설명**: Vercel Organization ID
- **확인 방법**:
  1. Vercel 프로젝트 생성 후
  2. 프로젝트 Settings → General
  3. "Project ID" 섹션에서 확인

#### `VERCEL_PROJECT_ID`
- **설명**: Vercel Project ID
- **확인 방법**:
  1. Vercel 프로젝트 Settings → General
  2. "Project ID" 복사

---

## 📝 Secrets 추가 방법

1. **New repository secret 클릭**
2. **Name**: Secret 이름 입력 (예: `API_URL`)
3. **Secret**: 값 입력
4. **Add secret** 클릭
5. 모든 필요한 Secrets에 대해 반복

---

## 🎯 현재 상태 체크리스트

- [x] GitHub Repository 생성
- [x] 코드 푸시 완료
- [ ] GitHub Pages 활성화 (Source → GitHub Actions)
- [ ] GitHub Secrets 설정
  - [ ] `API_URL` (백엔드 배포 후)
  - [ ] `VERCEL_TOKEN` (Vercel 사용 시)
  - [ ] `VERCEL_ORG_ID` (Vercel 사용 시)
  - [ ] `VERCEL_PROJECT_ID` (Vercel 사용 시)

---

## 💡 참고사항

### GitHub Actions 워크플로우 확인
- 프론트엔드: `.github/workflows/deploy-frontend.yml`
- 백엔드: `.github/workflows/deploy-backend.yml`

### 배포 트리거
- **자동 배포**: `main` 브랜치에 푸시할 때마다 자동 실행
- **수동 배포**: GitHub Actions 탭에서 "Run workflow" 클릭

### 배포 상태 확인
- Actions 탭: https://github.com/minjae-488/OmniSeller-Desk/actions

---

## 🚀 다음 작업

GitHub Pages 설정이 완료되면:

1. **백엔드 프로젝트 생성**
   - Express + TypeScript
   - Prisma ORM
   - JWT 인증

2. **프론트엔드 프로젝트 생성**
   - Next.js 14
   - Tailwind CSS
   - Zustand

3. **로컬 개발 환경 구축**
   - Docker로 PostgreSQL + Redis 실행

---

**작성일**: 2025-12-29  
**상태**: GitHub Repository 푸시 완료 ✅
