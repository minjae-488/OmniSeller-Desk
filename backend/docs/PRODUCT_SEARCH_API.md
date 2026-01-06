# 상품 검색 및 필터링 API

## 개요
상품 검색, 필터링, 정렬, 페이지네이션 기능을 제공하는 API 엔드포인트입니다.

## 엔드포인트

### `GET /products/search`

사용자의 상품을 검색하고 필터링합니다.

#### 인증
- **필수**: Bearer Token (JWT)

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|---------|------|------|------|--------|
| `search` | string | 아니오 | 상품명 또는 설명에서 검색할 키워드 | - |
| `category` | string | 아니오 | 카테고리 필터 | - |
| `minPrice` | number | 아니오 | 최소 가격 (0 이상) | - |
| `maxPrice` | number | 아니오 | 최대 가격 (0 이상) | - |
| `stockFilter` | string | 아니오 | 재고 필터: `inStock`, `outOfStock`, `all` | `all` |
| `sortBy` | string | 아니오 | 정렬 기준: `name`, `price`, `stock`, `createdAt` | `createdAt` |
| `sortOrder` | string | 아니오 | 정렬 순서: `asc`, `desc` | `desc` |
| `page` | number | 아니오 | 페이지 번호 (1부터 시작) | `1` |
| `limit` | number | 아니오 | 페이지당 항목 수 (1 이상) | `10` |

#### 응답

**성공 (200 OK)**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "상품명",
      "description": "상품 설명",
      "price": 1000,
      "stock": 10,
      "category": "Electronics",
      "imageUrl": "https://example.com/image.jpg",
      "userId": "user-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  },
  "message": "success"
}
```

**에러 (400 Bad Request)**

```json
{
  "status": 400,
  "message": "Validation error message"
}
```

**에러 (401 Unauthorized)**

```json
{
  "status": 401,
  "message": "Unauthorized"
}
```

## 사용 예시

### 1. 기본 검색
상품명 또는 설명에 "iPhone"이 포함된 상품 검색:

```bash
GET /products/search?search=iPhone
```

### 2. 카테고리 필터
Electronics 카테고리의 상품만 조회:

```bash
GET /products/search?category=Electronics
```

### 3. 가격 범위 필터
1000원 이상 5000원 이하의 상품 조회:

```bash
GET /products/search?minPrice=1000&maxPrice=5000
```

### 4. 재고 필터
재고가 있는 상품만 조회:

```bash
GET /products/search?stockFilter=inStock
```

### 5. 정렬
가격 오름차순으로 정렬:

```bash
GET /products/search?sortBy=price&sortOrder=asc
```

### 6. 페이지네이션
2페이지 조회 (페이지당 20개):

```bash
GET /products/search?page=2&limit=20
```

### 7. 복합 필터
Electronics 카테고리에서 "phone"을 검색하고, 1000-2000원 범위, 재고 있음, 가격 내림차순, 2페이지:

```bash
GET /products/search?search=phone&category=Electronics&minPrice=1000&maxPrice=2000&stockFilter=inStock&sortBy=price&sortOrder=desc&page=2&limit=20
```

## 프론트엔드 사용 예시

```typescript
import { productAPI, SearchProductParams } from '@/lib/api';

// 기본 검색
const searchProducts = async () => {
  const params: SearchProductParams = {
    search: 'iPhone',
    category: 'Electronics',
    minPrice: 1000,
    maxPrice: 2000,
    stockFilter: 'inStock',
    sortBy: 'price',
    sortOrder: 'asc',
    page: 1,
    limit: 20,
  };

  try {
    const response = await productAPI.search(params);
    console.log('Products:', response.data);
    console.log('Total:', response.meta.total);
    console.log('Pages:', response.meta.totalPages);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

## 구현 세부사항

### 검색 로직
- 검색어는 상품명(`name`)과 설명(`description`) 필드에서 대소문자 구분 없이 검색됩니다.
- PostgreSQL의 `ILIKE` 연산자를 사용하여 부분 일치 검색을 수행합니다.

### 필터링
- 모든 필터는 AND 조건으로 결합됩니다.
- 재고 필터:
  - `inStock`: `stock > 0`
  - `outOfStock`: `stock <= 0`
  - `all`: 필터 적용 안 함

### 정렬
- 기본 정렬: 생성일 내림차순 (`createdAt DESC`)
- 지원되는 정렬 필드: `name`, `price`, `stock`, `createdAt`

### 페이지네이션
- 기본값: 페이지 1, 페이지당 10개
- `totalPages`는 `Math.ceil(total / limit)`로 계산됩니다.

### 성능 최적화
- 데이터 조회와 총 개수 조회를 `Promise.all()`로 병렬 처리하여 응답 시간을 단축합니다.

## 테스트
TDD 방식으로 개발되었으며, 다음 시나리오를 포함한 9개의 테스트가 모두 통과합니다:

1. ✅ 상품명으로 검색
2. ✅ 카테고리로 필터링
3. ✅ 가격 범위로 필터링
4. ✅ 재고 있음 필터링
5. ✅ 재고 없음 필터링
6. ✅ 가격 오름차순 정렬
7. ✅ 페이지네이션
8. ✅ 복합 필터 조합
9. ✅ 기본 페이지네이션 값 사용

테스트 실행:
```bash
npm test -- product.service.search.test.ts
```

## 변경 이력

### 2026-01-06
- 초기 구현
- 검색, 필터링, 정렬, 페이지네이션 기능 추가
- TDD 기반 9개 테스트 작성 및 통과
