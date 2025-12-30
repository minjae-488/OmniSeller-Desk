import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { stream } from './utils/logger';
import { errorMiddleware } from './core/middlewares/error.middleware';
import { HttpException } from './core/exceptions/http.exception';

const app: Express = express();

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(express.json());
// Morgan 로그를 Winston Stream으로 연결
app.use(morgan('combined', { stream }));

// 기본 라우트 (Health Check)
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        message: 'OmniSeller Desk API Server is running! 🚀',
        timestamp: new Date().toISOString(),
    });
});

// 404 처리 (존재하지 않는 라우트)
app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new HttpException(404, 'Endpoint Not Found'));
});

// 전역 에러 핸들러
app.use(errorMiddleware);

export default app;
