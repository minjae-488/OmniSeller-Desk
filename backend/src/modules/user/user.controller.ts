import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/interfaces/auth.interface';

export class UserController {
    /**
     * 현재 로그인한 사용자 정보 조회
     */
    public getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            res.status(200).json({
                data: req.user,
                message: 'success',
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * 관리자 전용 엔드포인트 (예시)
     */
    public adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            res.status(200).json({
                data: {
                    message: 'This is an admin-only endpoint',
                    user: req.user,
                },
                message: 'success',
            });
        } catch (error) {
            next(error);
        }
    };
}
