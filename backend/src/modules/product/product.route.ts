import { Router } from 'express';
import { ProductController } from './product.controller';
import { Routes } from '../../core/interfaces/routes.interface';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { validationMiddleware } from '../../core/middlewares/validation.middleware';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

export class ProductRoute implements Routes {
    public path = '/products';
    public router = Router();
    public productController = new ProductController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // 모든 라우트에 인증 필요
        this.router.get(`${this.path}`, authMiddleware, this.productController.getAll);
        this.router.get(`${this.path}/:id`, authMiddleware, this.productController.getOne);
        this.router.post(
            `${this.path}`,
            authMiddleware,
            validationMiddleware(CreateProductDto),
            this.productController.create
        );
        this.router.put(
            `${this.path}/:id`,
            authMiddleware,
            validationMiddleware(UpdateProductDto),
            this.productController.update
        );
        this.router.delete(`${this.path}/:id`, authMiddleware, this.productController.delete);
    }
}
