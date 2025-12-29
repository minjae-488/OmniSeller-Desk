# OmniSeller Desk - Product Requirements Document (PRD)

## 📋 프로젝트 개요

### 프로젝트 명
**OmniSeller Desk** (내부용 위탁판매 통합 운영·분석 대시보드)

### 비전
국내/해외 소싱 상품을 AI 기반으로 상품화하고, 멀티채널(쿠팡, 스마트스토어)에 등록·운영하며, 주문·매출·마진을 분석하고 트렌드/키워드 분석까지 한 웹 대시보드에서 통합 관리하여 반복 업무를 최대한 자동화한다.

### 목표
- **업무 효율화**: 수작업 반복 작업을 자동화하여 운영 시간 80% 단축
- **수익성 극대화**: 마진 중심의 상품 관리로 실질 수익 증대
- **리스크 최소화**: AI 기반 리스크 검수로 법적/플랫폼 제재 사전 방지
- **데이터 기반 의사결정**: 트렌드 분석 및 성과 데이터로 전략적 상품 기획

---

## 🎯 운영 범위 (1차 확정)

### 판매 채널
| 채널 | 연동 상태 | 비고 |
|------|----------|------|
| 쿠팡 | 실제 연동 | API 연동 필수 |
| 스마트스토어 | 실제 연동 | API 연동 필수 |

### 소싱 채널
| 소싱처 | 연동 상태 | 구현 범위 |
|--------|----------|-----------|
| 도매꾹 (국내) | **실제 연동** | 자동 수집, 후보 생성, 재고/가격 동기화 |
| 1688 (해외) | **데모/Mock** | UI/흐름/점수화/상품화 연결만 구현, 실제 API는 추후 |

### 물류/배송 모델
**기본 모델**: 완전 위탁 (재고 0) 중심

**해외 소싱 케이스별 분기**:
- **사입형 (내가 받는 수입)**: 내 통관부호(PCCC) 사용
- **고객 직배송**: 고객 통관부호 필요
- **시스템 대응**: 상품/주문에 배송모델 필드를 두고 자동 분기 처리

---

## 🏗️ 시스템 아키텍처

### 기술 스택 (권장)
```
Frontend: Next.js 14+ (App Router), TypeScript, TailwindCSS, Zustand
Backend: Node.js + Express (또는 NestJS), TypeScript
Database: PostgreSQL (상품/주문/사용자), Redis (캐시/세션)
AI/ML: OpenAI API (GPT-4 for 리스팅), Python (트렌드 분석)
External APIs: 쿠팡 API, 스마트스토어 API, 도매꾹 API, Google Trends
Deployment: Docker, AWS/GCP (선택)
```

### 데이터 모델 핵심 엔티티
```
User (사용자)
Product (상품 마스터)
SourcingCandidate (소싱 후보)
ChannelProduct (채널별 상품 매핑)
Order (통합 주문)
MarginProfile (마진 프로필)
Keyword (트렌드 키워드)
RiskAlert (리스크 알림)
```

---

## 🎨 핵심 기능 모듈

### A. 상품 마스터 (PIM) + 소싱 관리

#### 기능 설명
상품의 기본 정보(스펙, 옵션, 구성, 이미지, 공급처, 리드타임)를 통합 관리하고, 소싱처 상품을 내부 SKU로 표준화하여 채널 상품과 매핑한다.

#### 주요 기능
- **상품 마스터 CRUD**
  - 상품명, 카테고리, 브랜드, 모델명
  - 옵션 관리 (색상, 사이즈 등)
  - 이미지 관리 (원천 이미지 URL + 로컬 저장)
  - 공급처 정보 (도매꾹/1688 상품 ID 연결)
  - 리드타임 (발주 → 출고 예상 일수)

- **채널 매핑 관리**
  - 1개 마스터 상품 → N개 채널 상품 (쿠팡, 스마트스토어)
  - 채널별 상품 ID, 등록 상태, 가격, 재고 동기화

- **배송 모델 설정**
  - 국내 위탁 / 수입 사입 / 해외 직배송 구분
  - PCCC 필요 여부 자동 판단

#### 데이터 스키마 (예시)
```typescript
interface Product {
  id: string;
  sku: string; // 내부 SKU
  name: string;
  category: string;
  brand?: string;
  model?: string;
  options: ProductOption[];
  images: string[];
  supplierId: string; // 도매꾹/1688 상품 ID
  supplierType: 'domegook' | '1688';
  leadTimeDays: number;
  shippingModel: 'domestic_consignment' | 'import_purchase' | 'overseas_direct';
  costPrice: number; // 원가
  channelMappings: ChannelMapping[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChannelMapping {
  channel: 'coupang' | 'smartstore';
  channelProductId: string;
  status: 'draft' | 'active' | 'suspended';
  price: number;
  stock: number;
}
```

#### UI 화면
- **상품 목록 (Products List)**
  - 테이블 뷰: SKU, 상품명, 카테고리, 원가, 판매가, 마진율, 채널 상태
  - 필터: 카테고리, 소싱처, 채널, 배송 모델
  - 정렬: 마진율, 판매량, 등록일
  - 액션: 상세보기, 편집, 채널 등록, 삭제

- **상품 상세/편집 (Product Detail)**
  - 기본 정보 탭
  - 옵션/구성 탭
  - 이미지 관리 탭
  - 채널 매핑 탭
  - 마진 계산기 (실시간)
  - 리스크 점수 표시

---

### B. 소싱 자동화

#### 1) 도매꾹 (실제 연동)

##### 기능 설명
도매꾹 API를 통해 키워드/카테고리 기반으로 상품 후보를 자동 수집하고, 가격/재고 변동을 동기화하며, 후보를 상품 마스터로 초안 생성한다.

##### 주요 기능
- **자동 수집**
  - 키워드 검색 (예: "무선 이어폰")
  - 카테고리 탐색 (예: 전자기기 > 오디오)
  - 수집 조건: 최소 리뷰 수, 최소 평점, 가격 범위

- **후보 관리**
  - 수집된 상품 목록 표시
  - 점수화 (자동): 리뷰 수, 평점, 가격 경쟁력, 예상 마진
  - 필터/정렬: 점수순, 카테고리별, 가격대별

- **동기화**
  - 일 1회 자동 업데이트 (가격, 재고, 품절 여부)
  - 변동 알림 (가격 10% 이상 변동 시)

- **상품화**
  - 후보 선택 → "상품 마스터로 추가" 버튼
  - 기본 정보 자동 입력 (이미지, 스펙, 원가)
  - AI 리스팅 스튜디오로 연결

##### 데이터 스키마
```typescript
interface SourcingCandidate {
  id: string;
  source: 'domegook' | '1688';
  sourceProductId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  url: string;
  score: number; // 0-100 점수
  collectedAt: Date;
  status: 'new' | 'reviewed' | 'added' | 'rejected';
}
```

##### UI 화면
- **소싱 대시보드 (Sourcing > 도매꾹)**
  - 검색 바 (키워드 입력)
  - 필터: 카테고리, 가격대, 평점, 리뷰 수
  - 후보 카드 그리드
    - 썸네일, 상품명, 가격, 평점, 점수
    - 액션: 상세보기, 상품화, 거부
  - 일괄 작업: 선택 상품 일괄 상품화

#### 2) 1688 (데모/Mock)

##### 기능 설명
동일한 UI/흐름을 제공하되, 더미 데이터로 "후보 수집 → 점수화 → 상품화(AI)" 연결만 구현. 실제 API 연동은 추후 진행.

##### 주요 기능
- 도매꾹과 동일한 UI/UX
- Mock 데이터로 후보 리스트 표시
- 상품화 플로우 동작 (실제 저장은 되지만 외부 동기화 없음)
- "데모 모드" 배지 표시

##### UI 화면
- **소싱 대시보드 (Sourcing > 1688)**
  - 상단에 "🚧 데모 모드 - 실제 API 연동 예정" 배너
  - 도매꾹과 동일한 레이아웃
  - Mock 데이터 20-30개 표시

---

### C. 마진 엔진 (수익 계산기) - 내부툴 코어

#### 기능 설명
원가, 판매가, 각종 비용을 입력받아 건당 마진, 마진율, 손익분기 판매가를 계산하고, 채널별 수수료/비용 프로필로 수익성을 비교한다.

#### 주요 기능
- **마진 계산**
  - 입력: 원가, 판매가, 배송비, 포장비, 기타 비용
  - 채널별 수수료 자동 적용 (쿠팡: 10-15%, 스마트스토어: 5-8%)
  - 출력: 건당 마진(원), 마진율(%)

- **손익분기 판매가**
  - 최소 마진율 설정 (예: 20%)
  - 역산하여 최소 판매가 제시

- **시나리오 분석 (선택)**
  - 광고비 반영 (판매가의 5-10%)
  - 반품률 반영 (5-10%)
  - "최악의 경우" vs "평균" vs "최선의 경우" 시뮬레이션

- **채널 비교**
  - 동일 상품을 쿠팡 vs 스마트스토어에 등록 시 예상 수익 비교

#### 계산 로직 (예시)
```typescript
interface MarginInput {
  costPrice: number; // 원가
  sellingPrice: number; // 판매가
  shippingCost: number; // 배송비
  packagingCost: number; // 포장비
  otherCosts: number; // 기타 비용
  channel: 'coupang' | 'smartstore';
  adSpendRate?: number; // 광고비율 (0-1)
  returnRate?: number; // 반품률 (0-1)
}

interface MarginOutput {
  revenue: number; // 매출 (판매가)
  totalCost: number; // 총 비용
  channelFee: number; // 채널 수수료
  netProfit: number; // 순이익
  marginRate: number; // 마진율 (%)
  breakEvenPrice: number; // 손익분기 판매가
}

function calculateMargin(input: MarginInput): MarginOutput {
  const channelFeeRate = input.channel === 'coupang' ? 0.12 : 0.06;
  const channelFee = input.sellingPrice * channelFeeRate;
  
  const adCost = input.adSpendRate 
    ? input.sellingPrice * input.adSpendRate 
    : 0;
  
  const returnCost = input.returnRate 
    ? input.costPrice * input.returnRate 
    : 0;
  
  const totalCost = 
    input.costPrice + 
    input.shippingCost + 
    input.packagingCost + 
    input.otherCosts + 
    channelFee + 
    adCost + 
    returnCost;
  
  const netProfit = input.sellingPrice - totalCost;
  const marginRate = (netProfit / input.sellingPrice) * 100;
  
  // 손익분기 판매가 (마진율 0% 기준)
  const breakEvenPrice = totalCost / (1 - channelFeeRate);
  
  return {
    revenue: input.sellingPrice,
    totalCost,
    channelFee,
    netProfit,
    marginRate,
    breakEvenPrice
  };
}
```

#### UI 화면
- **마진 계산기 (Profit > Calculator)**
  - 입력 폼: 원가, 판매가, 배송비, 포장비, 기타 비용
  - 채널 선택 (쿠팡/스마트스토어)
  - 고급 옵션: 광고비율, 반품률
  - 실시간 계산 결과 표시
    - 순이익 (큰 글씨, 색상: 양수=녹색, 음수=빨강)
    - 마진율 (%)
    - 손익분기 판매가
  - 채널 비교 버튼 → 양쪽 결과 나란히 표시

- **상품별 마진 분석 (Profit > Products)**
  - 전체 상품의 마진율 순위
  - 필터: 채널, 카테고리
  - 차트: 마진율 분포 히스토그램

---

### D. 주문 통합 (OMS) + 위탁 운영 To-do

#### 기능 설명
쿠팡/스마트스토어 주문을 한 화면에서 조회하고, 상태를 표준화하며, 위탁 운영용 자동 작업(발주, 지연 알림)을 생성한다.

#### 주요 기능
- **주문 통합 조회**
  - 쿠팡 + 스마트스토어 주문 통합 테이블
  - 상태 표준화: 신규 / 처리중 / 출고 / 배송중 / 완료 / 취소 / 반품
  - 필터: 채널, 상태, 날짜 범위, 상품명

- **위탁 운영 To-do**
  - **발주 필요 주문 묶기**
    - 신규 주문 중 아직 발주 안 된 건 자동 리스트업
    - 일괄 발주 버튼 (도매꾹/1688로 주문 전송)
  - **리드타임 초과 알림**
    - 주문일 + 리드타임 > 현재일 → 경고 표시
    - 고객 CS 필요 알림
  - **재고 부족 알림**
    - 주문 시점에 소싱처 재고 확인 → 품절 시 즉시 알림

- **주문 상세**
  - 주문 정보 (주문번호, 고객명, 주소, 연락처)
  - 상품 정보 (상품명, 옵션, 수량, 가격)
  - 배송 정보 (송장번호, 배송사, 배송 상태)
  - 통관부호 (PCCC) - 해외 직배송인 경우만 표시
  - 타임라인 (주문 → 발주 → 출고 → 배송 → 완료)

#### 데이터 스키마
```typescript
interface Order {
  id: string;
  channel: 'coupang' | 'smartstore';
  channelOrderId: string;
  productId: string; // 내부 상품 ID
  productName: string;
  options: string;
  quantity: number;
  price: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  pccc?: string; // 통관부호 (해외 직배송만)
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  orderedAt: Date;
  purchasedAt?: Date; // 발주일
  shippedAt?: Date;
  deliveredAt?: Date;
  trackingNumber?: string;
  leadTimeDays: number;
  isDelayed: boolean; // 리드타임 초과 여부
}
```

#### UI 화면
- **주문 목록 (Orders)**
  - 테이블: 주문번호, 채널, 상품명, 수량, 상태, 주문일, 발주일, 지연 여부
  - 필터: 채널, 상태, 날짜
  - 액션: 상세보기, 발주, 송장 입력, 취소

- **To-do 대시보드 (Orders > To-do)**
  - 섹션 1: 발주 필요 (N건)
    - 일괄 발주 버튼
  - 섹션 2: 리드타임 초과 (N건)
    - 고객 CS 필요 알림
  - 섹션 3: 재고 부족 (N건)
    - 대체 상품 찾기 / 취소 안내

---

### E. 매출/성과 대시보드

#### 기능 설명
일/주/월 매출, 주문수, 객단가, 반품/취소율을 집계하고, "남는 상품(마진 기준)" 중심으로 성과를 분석한다.

#### 주요 기능
- **핵심 지표 (KPI)**
  - 총 매출 (원)
  - 총 주문 수
  - 평균 객단가
  - 순이익 (마진 합계)
  - 평균 마진율
  - 반품/취소율

- **기간별 분석**
  - 일별 / 주별 / 월별 전환
  - 차트: 매출 추이 (라인 차트)
  - 차트: 주문 수 추이 (바 차트)

- **상품별 성과**
  - **"남는 상품" 랭킹** (마진 기준)
    - 순이익 합계 순
    - 마진율 순
  - 판매량 순 (참고용)
  - 테이블: 상품명, 판매량, 매출, 순이익, 마진율

- **채널별 성과**
  - 쿠팡 vs 스마트스토어 비교
  - 매출, 주문 수, 평균 마진율

#### 데이터 집계 로직
```typescript
interface SalesMetrics {
  period: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProfit: number;
  averageMarginRate: number;
  returnRate: number;
  cancelRate: number;
}

interface ProductPerformance {
  productId: string;
  productName: string;
  salesCount: number;
  revenue: number;
  profit: number;
  marginRate: number;
}
```

#### UI 화면
- **성과 대시보드 (Dashboard / Profit > Performance)**
  - 상단: KPI 카드 (6개)
  - 중단: 매출/주문 추이 차트
  - 하단: 상품별 성과 테이블 (Top 10)
  - 우측: 채널별 비교 (파이 차트)

---

### F. 트렌드/키워드 분석

#### 기능 설명
상승 키워드를 발굴하고, 키워드별 관심도를 저장하며, 키워드를 소싱/상품화로 연결한다.

#### 주요 기능
- **키워드 발굴**
  - Google Trends API 연동
  - 카테고리별 상승 키워드 자동 수집
  - 수동 키워드 추가

- **키워드 관리**
  - 키워드 목록 (테이블)
  - 관심도 점수 (0-100)
  - 메모 (상품 아이디어, 소싱 계획)
  - 상태: 모니터링 / 소싱중 / 상품화 완료

- **소싱 연결**
  - 키워드 선택 → "도매꾹에서 검색" 버튼
  - 검색 결과를 소싱 후보로 자동 추가

#### 데이터 스키마
```typescript
interface Keyword {
  id: string;
  keyword: string;
  category: string;
  interestScore: number; // 0-100
  trend: 'rising' | 'stable' | 'falling';
  memo: string;
  status: 'monitoring' | 'sourcing' | 'productized';
  createdAt: Date;
  updatedAt: Date;
}
```

#### UI 화면
- **트렌드 분석 (Trends)**
  - 상단: 카테고리 선택 (전자기기, 패션, 생활용품 등)
  - 중단: 상승 키워드 카드 (Top 10)
    - 키워드, 관심도, 추세 그래프
    - 액션: 저장, 소싱 검색
  - 하단: 저장된 키워드 테이블
    - 필터: 상태, 카테고리
    - 액션: 메모 편집, 소싱 검색, 삭제

---

### G. AI 리스팅 스튜디오 + 리스크 알림 (검수 보조)

#### 기능 설명
AI가 상품명/소개/FAQ 초안을 생성하고, 등록 전 리스크 점수와 경고 알림을 제공하여 법적/플랫폼 제재를 사전 방지한다.

#### 주요 기능

##### 1) AI 리스팅 생성
- **입력**: 상품 기본 정보 (카테고리, 스펙, 이미지, 키워드)
- **출력**:
  - 상품명 (3-5개 후보)
  - 상품 소개 (HTML)
  - 요약 설명 (1-2줄)
  - FAQ (5-10개)
- **스타일 선택**: 전문적 / 친근한 / 감성적

##### 2) 리스크 검수
- **리스크 점수 (0-100)**
  - 0-30: 안전
  - 31-60: 주의
  - 61-100: 위험

- **검수 항목**
  - **과장/민감 표현 경고**
    - "100% 효과", "즉시 치료", "의학적으로 입증" 등
  - **필수 정보 누락 경고**
    - 제조사, 원산지, 인증 정보 등
  - **브랜드/모델명 사용 위험**
    - 근거 불명확한 브랜드명 사용 (예: "애플 호환")
  - **내부 문구 복붙/중복 패턴**
    - 동일 문구 반복 사용 감지

- **경고 알림**
  - 각 항목별 경고 메시지 + 수정 제안
  - "안전하게 다시 쓰기(AI)" 버튼

##### 3) 수동 편집
- AI 생성 결과를 WYSIWYG 에디터로 편집
- 실시간 리스크 재검수

#### AI 프롬프트 예시
```
당신은 전문 이커머스 상품 기획자입니다.
다음 상품 정보를 바탕으로 쿠팡/스마트스토어에 등록할 상품명과 상세 설명을 작성해주세요.

[상품 정보]
- 카테고리: {category}
- 주요 스펙: {specs}
- 타겟 키워드: {keywords}

[요구사항]
1. 상품명: 30자 이내, SEO 최적화, 클릭을 유도하는 문구
2. 상세 설명: 500-1000자, HTML 형식, 구매 욕구를 자극하되 과장 금지
3. FAQ: 고객이 자주 묻는 질문 5개 + 답변

[주의사항]
- 과장 표현 금지 (100% 효과, 즉시 치료 등)
- 근거 없는 브랜드명 사용 금지
- 필수 정보 포함 (제조사, 원산지, 인증)
```

#### 리스크 검수 로직
```typescript
interface RiskCheck {
  score: number; // 0-100
  level: 'safe' | 'warning' | 'danger';
  alerts: RiskAlert[];
}

interface RiskAlert {
  type: 'exaggeration' | 'missing_info' | 'brand_risk' | 'duplicate';
  message: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

function checkRisk(content: string): RiskCheck {
  const alerts: RiskAlert[] = [];
  
  // 과장 표현 체크
  const exaggerationPatterns = [
    /100%/g, /즉시/g, /의학적으로 입증/g, /기적의/g
  ];
  exaggerationPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      alerts.push({
        type: 'exaggeration',
        message: '과장 표현이 감지되었습니다.',
        suggestion: '객관적인 표현으로 수정하세요.',
        severity: 'high'
      });
    }
  });
  
  // 필수 정보 누락 체크
  const requiredKeywords = ['제조사', '원산지', '인증'];
  requiredKeywords.forEach(keyword => {
    if (!content.includes(keyword)) {
      alerts.push({
        type: 'missing_info',
        message: `필수 정보 '${keyword}'가 누락되었습니다.`,
        suggestion: `${keyword} 정보를 추가하세요.`,
        severity: 'medium'
      });
    }
  });
  
  // 리스크 점수 계산
  const score = alerts.reduce((sum, alert) => {
    return sum + (alert.severity === 'high' ? 30 : alert.severity === 'medium' ? 15 : 5);
  }, 0);
  
  const level = score < 31 ? 'safe' : score < 61 ? 'warning' : 'danger';
  
  return { score, level, alerts };
}
```

#### UI 화면
- **리스팅 스튜디오 (Listing Studio)**
  - 좌측: 상품 정보 입력 폼
  - 중앙: AI 생성 결과 (상품명, 설명, FAQ)
  - 우측: 리스크 점수 + 경고 알림
  - 하단: 액션 버튼
    - "AI 생성", "다시 생성", "안전하게 다시 쓰기", "저장", "채널 등록"

---

### H. 통관부호(PCCC) 자동화 (케이스 기반)

#### 기능 설명
상품/주문의 배송 모델에 따라 통관부호(PCCC) 필요 여부를 자동 판단하고, 필요 시 자동 입력 또는 고객 수집을 처리한다.

#### 주요 기능
- **배송 모델별 분기**
  - **국내 위탁 출고**: PCCC 불필요 → 자동 스킵
  - **수입 사입 (내가 수령)**: 내 PCCC 자동 입력
  - **해외 고객 직배송**: 주문마다 고객 PCCC 수집 → 자동 주입

- **PCCC 관리**
  - 내 PCCC 저장 (Settings)
  - 고객 PCCC 수집 플로우
    - 주문 확인 시 PCCC 입력 요청 (SMS/이메일)
    - 입력 완료 시 자동 주입

- **현재 구현 범위 (MVP 1-3)**
  - 필드/화면/상태만 준비 (데모)
  - 실제 해외(1688) 연동 시 활성화

#### 데이터 스키마
```typescript
interface PCCCConfig {
  myPCCC: string; // 내 통관부호
  autoApply: boolean; // 자동 적용 여부
}

interface Order {
  // ... 기존 필드
  pccc?: string; // 통관부호
  pcccRequired: boolean; // PCCC 필요 여부
  pcccCollected: boolean; // PCCC 수집 완료 여부
}
```

#### UI 화면
- **설정 (Settings > PCCC)**
  - 내 통관부호 입력
  - 자동 적용 설정 (수입 사입 시)
  - 고객 PCCC 수집 템플릿 (SMS/이메일)

- **주문 상세 (Orders > Detail)**
  - PCCC 필요 여부 표시
  - PCCC 입력 필드 (해외 직배송만)
  - PCCC 수집 상태 (미수집 / 수집중 / 완료)

---

## 🖥️ 화면 구성 (IA - Information Architecture)

### 메인 네비게이션
```
┌─────────────────────────────────────────┐
│  OmniSeller Desk                    👤  │
├─────────────────────────────────────────┤
│  🏠 Home                                │
│  📦 Products                            │
│  🔍 Sourcing                            │
│  📋 Orders                              │
│  💰 Profit                              │
│  📈 Trends                              │
│  ✨ Listing Studio                      │
│  ⚙️ Settings                            │
└─────────────────────────────────────────┘
```

### 화면별 상세 구조

#### 1. Home (대시보드)
**목적**: 오늘의 핵심 지표와 To-do를 한눈에 파악

**레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│  오늘의 요약                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │ 주문 │ │ 매출 │ │ 마진 │ │ 알림 │                   │
│  └──────┘ └──────┘ └──────┘ └──────┘                   │
├─────────────────────────────────────────────────────────┤
│  미처리 To-do                                            │
│  • 발주 필요: 12건                                       │
│  • 리드타임 초과: 3건                                    │
│  • 리스크 경고: 5건                                      │
├─────────────────────────────────────────────────────────┤
│  최근 상품 (5개)                                         │
│  [상품 카드] [상품 카드] [상품 카드] ...                 │
└─────────────────────────────────────────────────────────┘
```

#### 2. Products (상품 마스터)
**목적**: 전체 상품 관리 + 채널 매핑 + 마진 확인

**레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│  [검색] [필터: 카테고리/소싱처/채널] [+ 새 상품]         │
├─────────────────────────────────────────────────────────┤
│  SKU  │ 상품명 │ 카테고리 │ 원가 │ 판매가 │ 마진율 │ 채널│
│  ─────┼────────┼──────────┼──────┼────────┼────────┼────│
│  001  │ 무선..│ 전자기기 │ 10K  │ 20K    │ 35%    │ 쿠팡│
│  002  │ ...   │ ...      │ ...  │ ...    │ ...    │ ... │
└─────────────────────────────────────────────────────────┘
```

**상세 화면**:
- 탭: 기본 정보 / 옵션 / 이미지 / 채널 매핑 / 마진 계산

#### 3. Sourcing (소싱 관리)
**목적**: 도매꾹/1688 후보 수집 + 점수화 + 상품화

**레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│  [탭: 도매꾹 | 1688]                                     │
├─────────────────────────────────────────────────────────┤
│  [검색 키워드] [필터: 카테고리/가격/평점] [수집 시작]    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ 후보 1   │ │ 후보 2   │ │ 후보 3   │                │
│  │ 점수: 85 │ │ 점수: 72 │ │ 점수: 68 │                │
│  │ [상품화] │ │ [상품화] │ │ [거부]   │                │
│  └──────────┘ └──────────┘ └──────────┘                │
└─────────────────────────────────────────────────────────┘
```

#### 4. Orders (주문 통합)
**목적**: 쿠팡+스스 주문 통합 조회 + 위탁 To-do

**레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│  [필터: 채널/상태/날짜] [To-do 보기]                     │
├─────────────────────────────────────────────────────────┤
│  주문번호 │ 채널 │ 상품명 │ 수량 │ 상태 │ 주문일 │ 지연 │
│  ─────────┼──────┼────────┼──────┼──────┼────────┼──────│
│  C-001    │ 쿠팡 │ 무선.. │ 1    │ 신규 │ 12/29  │ -    │
│  S-002    │ 스스 │ ...    │ 2    │ 출고 │ 12/28  │ ⚠️   │
└─────────────────────────────────────────────────────────┘
```

**To-do 화면**:
- 섹션: 발주 필요 / 리드타임 초과 / 재고 부족

#### 5. Profit (마진 분석)
**목적**: 마진 계산 + 상품별 수익성 분석

**레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│  [탭: 계산기 | 상품별 분석 | 채널 비교]                  │
├─────────────────────────────────────────────────────────┤
│  [계산기 탭]                                             │
│  원가: [입력]  판매가: [입력]  배송비: [입력]           │
│  채널: [쿠팡 ▼]  광고비율: [5%]  반품률: [5%]           │
│  ────────────────────────────────────────────────────   │
│  순이익: ₩8,500 (마진율: 42.5%)                         │
│  손익분기 판매가: ₩12,000                               │
└─────────────────────────────────────────────────────────┘
```

#### 6. Trends (트렌드 분석)
**목적**: 상승 키워드 발굴 + 소싱 연결

**레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│  [카테고리 선택: 전자기기 ▼]                             │
├─────────────────────────────────────────────────────────┤
│  상승 키워드 (Top 10)                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ 무선충전 │ │ 갤럭시탭 │ │ 블루투스 │                │
│  │ 📈 92    │ │ 📈 88    │ │ 📈 85    │                │
│  │ [저장]   │ │ [저장]   │ │ [저장]   │                │
│  └──────────┘ └──────────┘ └──────────┘                │
├─────────────────────────────────────────────────────────┤
│  저장된 키워드                                           │
│  키워드 │ 관심도 │ 상태 │ 메모 │ 액션                   │
└─────────────────────────────────────────────────────────┘
```

#### 7. Listing Studio (AI 리스팅)
**목적**: AI 생성 + 리스크 검수 + 채널 등록

**레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│  [좌측: 상품 정보 입력]  [중앙: AI 생성 결과]  [우측: 리스크]│
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ 카테고리   │  │ 상품명:    │  │ 리스크 점수│        │
│  │ 스펙       │  │ [AI 생성]  │  │ 🟢 안전    │        │
│  │ 키워드     │  │            │  │ 15/100     │        │
│  │ [AI 생성]  │  │ 상세 설명: │  │            │        │
│  │            │  │ [AI 생성]  │  │ ⚠️ 경고:   │        │
│  │            │  │            │  │ • 과장표현 │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│  [다시 생성] [안전하게 다시 쓰기] [저장] [채널 등록]     │
└─────────────────────────────────────────────────────────┘
```

#### 8. Settings (설정)
**목적**: 채널 연동 + 수수료 설정 + PCCC 관리

**레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│  [탭: 채널 연동 | 수수료/비용 | PCCC | 알림 규칙]        │
├─────────────────────────────────────────────────────────┤
│  [채널 연동 탭]                                          │
│  쿠팡: [연동됨 ✓] [재연동]                              │
│  스마트스토어: [연동됨 ✓] [재연동]                       │
│  도매꾹: [연동됨 ✓] [재연동]                            │
│  1688: [데모 모드] [연동 예정]                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 MVP 로드맵

### MVP 1: 상품 마스터 + 도매꾹 소싱 + 마진 엔진 + Home 요약
**목표**: 핵심 상품 관리 + 소싱 자동화 + 수익성 계산 기반 구축

**기능**:
- ✅ 상품 마스터 CRUD
- ✅ 도매꾹 API 연동 (실제)
- ✅ 소싱 후보 수집 + 점수화
- ✅ 마진 계산기 (채널별)
- ✅ Home 대시보드 (오늘의 요약)

**기간**: 2-3주

**검증 지표**:
- 상품 10개 이상 등록
- 도매꾹 후보 50개 이상 수집
- 마진 계산 정확도 100%

---

### MVP 2: 주문 통합 + 위탁 To-do + 매출/성과 대시보드
**목표**: 주문 운영 자동화 + 성과 분석

**기능**:
- ✅ 쿠팡/스마트스토어 주문 API 연동
- ✅ 주문 통합 조회 + 상태 표준화
- ✅ 위탁 To-do (발주, 지연 알림)
- ✅ 매출/성과 대시보드 (일/주/월)
- ✅ 상품별 수익성 랭킹

**기간**: 2-3주

**검증 지표**:
- 주문 100건 이상 처리
- To-do 자동 생성 정확도 95%
- 대시보드 로딩 시간 < 2초

---

### MVP 3: 트렌드/키워드 + AI 리스팅 + 리스크 알림
**목표**: AI 기반 상품화 + 리스크 관리

**기능**:
- ✅ Google Trends 연동
- ✅ 키워드 발굴 + 소싱 연결
- ✅ AI 리스팅 생성 (GPT-4)
- ✅ 리스크 검수 + 경고 알림
- ✅ "안전하게 다시 쓰기" 기능

**기간**: 2-3주

**검증 지표**:
- 키워드 30개 이상 저장
- AI 리스팅 생성 성공률 90%
- 리스크 검수 정확도 85%

---

### MVP 4: 1688 실제 연동 + PCCC 플로우 실가동
**목표**: 해외 소싱 실제 운영 + 통관 자동화

**기능**:
- ✅ 1688 API 연동 (실제)
- ✅ 해외 소싱 후보 수집 + 동기화
- ✅ PCCC 자동화 (케이스별 분기)
- ✅ 고객 PCCC 수집 플로우

**기간**: 3-4주

**검증 지표**:
- 1688 후보 50개 이상 수집
- PCCC 자동 적용 정확도 100%
- 고객 PCCC 수집률 95%

---

## 📊 성공 지표 (KPI)

### 운영 효율
- **업무 시간 단축**: 80% 이상 (수작업 대비)
- **주문 처리 속도**: 평균 < 5분/건
- **발주 자동화율**: 90% 이상

### 수익성
- **평균 마진율**: 30% 이상
- **손실 상품 비율**: < 5%
- **채널별 수익성 차이**: 명확히 파악

### 리스크 관리
- **리스크 검수 정확도**: 85% 이상
- **플랫폼 제재 건수**: 0건
- **반품/취소율**: < 10%

### 사용자 만족도
- **시스템 응답 시간**: < 2초
- **버그 발생률**: < 1%/월
- **기능 활용도**: 80% 이상

---

## 🔒 보안 및 규정 준수

### 데이터 보안
- **개인정보 암호화**: 고객 정보, 통관부호 등
- **API 키 관리**: 환경 변수로 분리, 암호화 저장
- **접근 제어**: 역할 기반 권한 관리 (RBAC)

### 플랫폼 정책 준수
- **쿠팡/스마트스토어 API 이용 약관** 준수
- **상품 등록 가이드라인** 자동 검수
- **개인정보 처리방침** 명시

### 법적 규정
- **전자상거래법** 준수 (필수 정보 표시)
- **통관법** 준수 (PCCC 관리)
- **소비자 보호법** 준수 (반품/환불 정책)

---

## 🛠️ 기술 요구사항

### 성능
- **페이지 로딩 시간**: < 2초
- **API 응답 시간**: < 500ms
- **동시 사용자**: 10명 이상 지원

### 확장성
- **모듈화 설계**: 기능별 독립 모듈
- **API 기반 아키텍처**: 마이크로서비스 전환 가능
- **데이터베이스 확장**: 샤딩/레플리케이션 지원

### 안정성
- **에러 핸들링**: 모든 API 호출에 에러 처리
- **로깅**: 주요 이벤트 로그 기록
- **백업**: 일 1회 자동 백업

### 호환성
- **브라우저**: Chrome, Edge, Safari 최신 버전
- **디바이스**: 데스크톱 우선, 태블릿 지원

---

## 📝 부록

### A. 용어 정리
- **PIM (Product Information Management)**: 상품 정보 관리
- **OMS (Order Management System)**: 주문 관리 시스템
- **SKU (Stock Keeping Unit)**: 재고 관리 단위
- **PCCC (Personal Customs Clearance Code)**: 개인통관고유부호
- **마진율**: (순이익 / 판매가) × 100
- **리드타임**: 발주 후 출고까지 소요 시간

### B. API 연동 목록
| API | 용도 | 우선순위 |
|-----|------|----------|
| 쿠팡 파트너스 API | 상품 등록, 주문 조회 | 필수 |
| 스마트스토어 API | 상품 등록, 주문 조회 | 필수 |
| 도매꾹 API | 상품 검색, 재고/가격 동기화 | 필수 |
| 1688 API | 상품 검색 (MVP 4) | 추후 |
| Google Trends API | 키워드 트렌드 분석 | 중요 |
| OpenAI API | AI 리스팅 생성 | 중요 |

### C. 데이터베이스 스키마 (간략)
```sql
-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  pccc VARCHAR(13), -- 개인통관고유부호
  created_at TIMESTAMP DEFAULT NOW()
);

-- 상품 마스터
CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  supplier_id VARCHAR(100), -- 도매꾹/1688 상품 ID
  supplier_type VARCHAR(20), -- 'domegook' | '1688'
  cost_price DECIMAL(10, 2),
  lead_time_days INT,
  shipping_model VARCHAR(50), -- 배송 모델
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 소싱 후보
CREATE TABLE sourcing_candidates (
  id UUID PRIMARY KEY,
  source VARCHAR(20), -- 'domegook' | '1688'
  source_product_id VARCHAR(100),
  name VARCHAR(255),
  price DECIMAL(10, 2),
  score INT, -- 0-100
  status VARCHAR(20), -- 'new' | 'reviewed' | 'added' | 'rejected'
  collected_at TIMESTAMP DEFAULT NOW()
);

-- 주문
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  channel VARCHAR(20), -- 'coupang' | 'smartstore'
  channel_order_id VARCHAR(100),
  product_id UUID REFERENCES products(id),
  quantity INT,
  price DECIMAL(10, 2),
  status VARCHAR(20), -- 'new' | 'processing' | 'shipped' | ...
  pccc VARCHAR(13), -- 통관부호 (필요 시)
  ordered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 키워드
CREATE TABLE keywords (
  id UUID PRIMARY KEY,
  keyword VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  interest_score INT, -- 0-100
  trend VARCHAR(20), -- 'rising' | 'stable' | 'falling'
  status VARCHAR(20), -- 'monitoring' | 'sourcing' | 'productized'
  memo TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### D. 참고 자료
- [쿠팡 파트너스 API 문서](https://developers.coupangcorp.com/)
- [네이버 스마트스토어 API 문서](https://developers.naver.com/products/commerce/)
- [도매꾹 API 문서](https://www.domegook.com/api)
- [Google Trends API](https://trends.google.com/trends/)
- [OpenAI API 문서](https://platform.openai.com/docs/)

---

## ✅ 다음 단계

1. **기술 스택 확정** (Frontend/Backend/Database)
2. **개발 환경 설정** (Git, Docker, CI/CD)
3. **MVP 1 개발 시작**
   - 상품 마스터 DB 설계
   - 도매꾹 API 연동 테스트
   - 마진 계산 로직 구현
4. **디자인 시스템 구축** (UI/UX)
5. **테스트 계획 수립** (단위/통합/E2E)

---

**문서 버전**: 1.0  
**작성일**: 2025-12-29  
**작성자**: OmniSeller Desk Team  
**상태**: 초안 (Draft)
