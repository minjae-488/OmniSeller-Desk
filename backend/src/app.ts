import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app: Express = express();

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 기본 라우트 (Health Check)
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        message: 'OmniSeller Desk API Server is running! 🚀',
        timestamp: new Date().toISOString(),
    });
});

export default app;
