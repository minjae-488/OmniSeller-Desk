import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { prisma } from '../../core/services/prisma.service';
import { authService as authHelper } from '../../core/services/auth.service';
import { HttpException } from '../../core/exceptions/http.exception';
import { User } from '@prisma/client';

export interface LoginResponse {
    user: Omit<User, 'password'>;
    token: string;
}

export class AuthService {
    public async register(userData: RegisterDto): Promise<User> {
        const findUser = await prisma.user.findUnique({ where: { email: userData.email } });
        if (findUser) throw new HttpException(409, `Email ${userData.email} already exists`);

        const hashedPassword = await authHelper.hashPassword(userData.password);

        // User 생성
        const createUserData = await prisma.user.create({
            data: {
                email: userData.email,
                name: userData.name,
                password: hashedPassword,
                // role은 default값 사용
            },
        });

        return createUserData;
    }

    public async login(loginData: LoginDto): Promise<LoginResponse> {
        // 사용자 찾기
        const user = await prisma.user.findUnique({ where: { email: loginData.email } });
        if (!user) throw new HttpException(401, 'Invalid email or password');

        // 비밀번호 검증
        const isPasswordValid = await authHelper.comparePassword(loginData.password, user.password);
        if (!isPasswordValid) throw new HttpException(401, 'Invalid email or password');

        // JWT 토큰 생성
        const token = authHelper.generateToken({
            userId: user.id,
            role: user.role,
        });

        // 비밀번호 제외하고 반환
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    }
}

export const authService = new AuthService();
