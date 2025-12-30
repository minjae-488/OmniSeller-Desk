import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { prisma } from '../../core/services/prisma.service';
import { HttpException } from '../../core/exceptions/http.exception';

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
}

export const productService = new ProductService();
