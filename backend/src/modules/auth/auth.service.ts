import { RegisterDto } from './dtos/register.dto';
import { prisma } from '../../core/services/prisma.service';
import { authService as authHelper } from '../../core/services/auth.service';
import { HttpException } from '../../core/exceptions/http.exception';
import { User } from '@prisma/client';

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
}

export const authService = new AuthService();
