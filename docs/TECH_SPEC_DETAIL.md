# OmniSeller Desk - 기술 명세서 상세본

이 문서는 TECH_SPEC.md의 상세 버전입니다.

## 📋 목차
1. [프론트엔드 상세](#프론트엔드-상세)
2. [백엔드 상세](#백엔드-상세)
3. [데이터베이스 설계](#데이터베이스-설계)
4. [API 연동 가이드](#api-연동-가이드)
5. [배포 가이드](#배포-가이드)

---

## 프론트엔드 상세

### API 클라이언트 구현

```typescript
// lib/api.ts
import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### Zustand 스토어

```typescript
// stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        set({ user: response.user, token: response.token });
      },
      
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('auth_token');
      },
    }),
    { name: 'auth-storage' }
  )
);
```

### TanStack Query 훅

```typescript
// hooks/use-products.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProducts(filters?: any) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiClient.get('/products', { params: filters }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.post('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

---

## 백엔드 상세

### 계층형 아키텍처

```typescript
// Controller
export class ProductController {
  constructor(private productService: ProductService) {}

  async getProducts(req: Request, res: Response) {
    const products = await this.productService.getProducts(req.query);
    res.json({ success: true, data: products });
  }
}

// Service
export class ProductService {
  constructor(private productRepo: ProductRepository) {}

  async getProducts(filters: any): Promise<Product[]> {
    return this.productRepo.findAll(filters);
  }
}

// Repository
export class ProductRepository {
  async findAll(filters: any): Promise<Product[]> {
    return this.db.getRepository(Product).find(filters);
  }
}
```

### 인증 미들웨어

```typescript
// middlewares/auth.middleware.ts
import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: '인증 필요' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰' });
  }
}
```

---

## 데이터베이스 설계

### Users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  pccc VARCHAR(13),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Products 테이블
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  supplier_type VARCHAR(20),
  cost_price DECIMAL(10, 2),
  selling_price DECIMAL(10, 2),
  images TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
```

### Orders 테이블
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  channel VARCHAR(20),
  channel_order_id VARCHAR(100),
  quantity INT,
  price DECIMAL(10, 2),
  status VARCHAR(20),
  ordered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API 연동 가이드

### 쿠팡 API

```typescript
// services/coupang.service.ts
import crypto from 'crypto';

export class CoupangService {
  private generateHmac(method: string, path: string): string {
    const datetime = new Date().toISOString();
    const message = `${datetime}${method}${path}`;
    return crypto.createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');
  }

  async getOrders() {
    const path = '/v2/providers/affiliate_api_v2/apis/openapi/v1/orders';
    const signature = this.generateHmac('GET', path);
    
    return axios.get(`${this.baseUrl}${path}`, {
      headers: { 'Authorization': signature }
    });
  }
}
```

### 스마트스토어 API

```typescript
// services/smartstore.service.ts
export class SmartstoreService {
  async getAccessToken(): Promise<string> {
    const response = await axios.post('/oauth2/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    });
    return response.data.access_token;
  }

  async getOrders() {
    const token = await this.getAccessToken();
    return axios.get('/external/v1/pay-order/seller/product-orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
```

### OpenAI API

```typescript
// services/ai.service.ts
import OpenAI from 'openai';

export class AIService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateListing(productInfo: any) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: '전문 이커머스 상품 기획자' },
        { role: 'user', content: `상품명과 설명 생성: ${JSON.stringify(productInfo)}` }
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }
}
```

---

## 배포 가이드

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: omniseller
      POSTGRES_USER: omniseller
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://omniseller:${DB_PASSWORD}@postgres:5432/omniseller
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Backend Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 환경 변수

```bash
# .env.example

# 애플리케이션
NODE_ENV=development
PORT=3001

# 데이터베이스
DATABASE_URL=postgresql://omniseller:password@localhost:5432/omniseller
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=1h

# 외부 API
COUPANG_ACCESS_KEY=your-coupang-access-key
COUPANG_SECRET_KEY=your-coupang-secret-key
SMARTSTORE_CLIENT_ID=your-smartstore-client-id
SMARTSTORE_CLIENT_SECRET=your-smartstore-client-secret
DOMEGOOK_API_KEY=your-domegook-api-key
OPENAI_API_KEY=your-openai-api-key

# 프론트엔드
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 개발 워크플로우

### 로컬 환경 설정

```bash
# 1. 저장소 클론
git clone <repo-url>
cd omniseller-desk

# 2. 의존성 설치
cd backend && npm install
cd ../frontend && npm install

# 3. 환경 변수 설정
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 4. 데이터베이스 시작
docker-compose up -d postgres redis

# 5. 마이그레이션 실행
cd backend && npm run migration:run

# 6. 개발 서버 시작
cd backend && npm run dev  # Port 3001
cd frontend && npm run dev # Port 3000
```

### Git 브랜치 전략

- `main`: 프로덕션
- `develop`: 개발
- `feature/*`: 기능 개발
- `bugfix/*`: 버그 수정

---

**작성일**: 2025-12-29  
**버전**: 1.0
