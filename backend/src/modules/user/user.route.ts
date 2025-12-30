import { Router } from 'express';
import { UserController } from './user.controller';
import { Routes } from '../../core/interfaces/routes.interface';
import { authMiddleware, roleMiddleware } from '../../core/middlewares/auth.middleware';

export class UserRoute implements Routes {
    public path = '/users';
    public router = Router();
    public userController = new UserController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // 인증된 사용자 정보 조회 (모든 인증된 사용자)
        this.router.get(`${this.path}/me`, authMiddleware, this.userController.getMe);

        // 관리자 전용 엔드포인트 (ADMIN 역할만 접근 가능)
        this.router.get(
            `${this.path}/admin`,
            authMiddleware,
            roleMiddleware('ADMIN'),
            this.userController.adminOnly
        );
    }
}
