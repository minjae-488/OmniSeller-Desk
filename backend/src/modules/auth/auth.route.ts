import { Router } from 'express';
import { AuthController } from './auth.controller';
import { RegisterDto } from './dtos/register.dto';
import { Routes } from '../../core/interfaces/routes.interface';
import { validationMiddleware } from '../../core/middlewares/validation.middleware';

export class AuthRoute implements Routes {
    public path = '/auth';
    public router = Router();
    public authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(RegisterDto), this.authController.register);
    }
}
