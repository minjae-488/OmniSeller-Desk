import { NextFunction, Request, Response } from 'express';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { authService } from './auth.service';

export class AuthController {
    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: RegisterDto = req.body;
            const signUpUserData = await authService.register(userData);

            res.status(201).json({ data: signUpUserData, message: 'register' });
        } catch (error) {
            next(error);
        }
    };

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const loginData: LoginDto = req.body;
            const { user, token } = await authService.login(loginData);

            res.status(200).json({ data: { user, token }, message: 'login' });
        } catch (error) {
            next(error);
        }
    };
}
