import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/http.exception';
import logger from '@/utils/logger';

export const errorMiddleware = (
    error: HttpException,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';

    logger.error(
        `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}, Stack:: ${error.stack}`
    );

    res.status(status).json({
        status: 'error',
        statusCode: status,
        message,
    });
};
