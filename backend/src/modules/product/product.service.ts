import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { SearchProductDto } from './dtos/search-product.dto';
import { prisma } from '../../core/services/prisma.service';
import { HttpException } from '../../core/exceptions/http.exception';
import { Prisma } from '@prisma/client';

export class ProductService {
    // 모든 상품 조회
    public async findAll(userId: string) {
        return await prisma.product.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // 특정 상품 조회
    public async findOne(id: string, userId: string) {
        const product = await prisma.product.findFirst({
            where: { id, userId },
        });

        if (!product) {
            throw new HttpException(404, 'Product not found');
        }

        return product;
    }

    // 상품 생성
    public async create(userId: string, data: CreateProductDto) {
        return await prisma.product.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    // 상품 수정
    public async update(id: string, userId: string, data: UpdateProductDto) {
        // 상품 존재 및 권한 확인
        await this.findOne(id, userId);

        return await prisma.product.update({
            where: { id },
            data,
        });
    }

    // 상품 삭제
    public async delete(id: string, userId: string) {
        // 상품 존재 및 권한 확인
        await this.findOne(id, userId);

        await prisma.product.delete({
            where: { id },
        });
    }

    // 상품 검색 및 필터링
    public async searchProducts(userId: string, searchDto: SearchProductDto) {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            stockFilter,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10,
        } = searchDto;

        // 동적 where 조건 구성
        const where: Prisma.ProductWhereInput = {
            userId,
        };

        // 검색어 필터 (상품명 또는 설명에서 검색)
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // 카테고리 필터
        if (category) {
            where.category = category;
        }

        // 가격 범위 필터
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }

        // 재고 필터
        if (stockFilter === 'inStock') {
            where.stock = { gt: 0 };
        } else if (stockFilter === 'outOfStock') {
            where.stock = { lte: 0 };
        }
        // 'all'인 경우 필터 적용 안 함

        // 정렬 조건
        const orderBy: Prisma.ProductOrderByWithRelationInput = {
            [sortBy]: sortOrder,
        };

        // 페이지네이션 계산
        const skip = (page - 1) * limit;
        const take = limit;

        // 데이터 조회 및 총 개수 조회 (병렬 처리)
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take,
            }),
            prisma.product.count({ where }),
        ]);

        // 총 페이지 수 계산
        const totalPages = Math.ceil(total / limit);

        return {
            data: products,
            total,
            page,
            limit,
            totalPages,
        };
    }
}

export const productService = new ProductService();
