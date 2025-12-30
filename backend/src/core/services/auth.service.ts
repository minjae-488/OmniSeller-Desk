import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config.service';

export interface TokenPayload {
    userId: string;
    role: string;
}

export class AuthService {
    private readonly saltRounds = 10;

    /**
     * 비밀번호 해싱
     */
    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    /**
     * 비밀번호 검증
     */
    async comparePassword(plain: string, hashed: string): Promise<boolean> {
        return await bcrypt.compare(plain, hashed);
    }

    /**
     * JWT 토큰 생성
     */
    generateToken(payload: TokenPayload): string {
        const secret = config.jwtSecret;
        const expiresIn = config.get('JWT_EXPIRES_IN') || '1d';

        return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
    }

    /**
     * JWT 토큰 검증
     */
    verifyToken(token: string): string | jwt.JwtPayload {
        const secret = config.jwtSecret;
        try {
            return jwt.verify(token, secret);
        } catch (error) {
            throw new Error('Invalid Token');
        }
    }
}

export const authService = new AuthService();
