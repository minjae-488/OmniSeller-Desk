import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/interfaces/auth.interface';
import { productService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { SearchProductDto } from './dtos/search-product.dto';

export class ProductController {
    // 모든 상품 조회
    public getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;
            const products = await productService.findAll(userId);

            res.status(200).json({
                data: products,
                message: 'success',
            });
        } catch (error) {
            next(error);
        }
    };

    // 특정 상품 조회
    public getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const product = await productService.findOne(id, userId);

            res.status(200).json({
                data: product,
                message: 'success',
            });
        } catch (error) {
            next(error);
        }
    };

    // 상품 생성
    public create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;
            const productData: CreateProductDto = req.body;
            const product = await productService.create(userId, productData);

            res.status(201).json({
                data: product,
                message: 'created',
            });
        } catch (error) {
            next(error);
        }
    };

    // 상품 수정
    public update = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const productData: UpdateProductDto = req.body;
            const product = await productService.update(id, userId, productData);

            res.status(200).json({
                data: product,
                message: 'updated',
            });
        } catch (error) {
            next(error);
        }
    };

    // 상품 삭제
    public delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            await productService.delete(id, userId);

            res.status(200).json({
                message: 'deleted',
            });
        } catch (error) {
            next(error);
        }
    };

    // 상품 검색 및 필터링
    public search = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;
            const searchDto: SearchProductDto = req.query;
            const result = await productService.searchProducts(userId, searchDto);

            res.status(200).json({
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
                message: 'success',
            });
        } catch (error) {
            next(error);
        }
    };
}
