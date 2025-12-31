import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 토큰 만료 또는 인증 실패
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 인증 API
export const authAPI = {
    register: async (data: { email: string; password: string; name: string }) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (data: { email: string; password: string }) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
};

// 상품 타입 정의
export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category?: string;
    imageUrl?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
    name: string;
    description?: string;
    price: number;
    stock?: number;
    category?: string;
    imageUrl?: string;
}

export interface UpdateProductData {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category?: string;
    imageUrl?: string;
}

// 상품 API
export const productAPI = {
    getAll: async () => {
        const response = await api.get('/products');
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    create: async (data: CreateProductData) => {
        const response = await api.post('/products', data);
        return response.data;
    },

    update: async (id: string, data: UpdateProductData) => {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};
