import { Response, NextFunction } from 'express';
import { AuthRequest, UserPayload } from '../interfaces/auth.interface';
import { HttpException } from '../exceptions/http.exception';
import { authService } from '../../core/services/auth.service';

/**
 * JWT 인증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하고 검증합니다.
 */
export const authMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
        // Authorization 헤더 확인
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new HttpException(401, 'Authorization header is missing');
        }

        // Bearer 토큰 형식 확인
        const [bearer, token] = authHeader.split(' ');

        if (bearer !== 'Bearer' || !token) {
            throw new HttpException(401, 'Invalid token format. Use: Bearer <token>');
        }

        // 토큰 검증
        const decoded = authService.verifyToken(token) as UserPayload;

        // 검증된 사용자 정보를 request에 추가
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error instanceof HttpException) {
            next(error);
        } else {
            // JWT 검증 실패 (만료, 유효하지 않은 토큰 등)
            next(new HttpException(401, 'Invalid or expired token'));
        }
    }
};

/**
 * 역할 기반 접근 제어 미들웨어
 * 특정 역할을 가진 사용자만 접근할 수 있도록 제한합니다.
 */
export const roleMiddleware = (...allowedRoles: string[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new HttpException(401, 'Authentication required');
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new HttpException(403, 'Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
