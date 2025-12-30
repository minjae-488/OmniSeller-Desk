import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HttpException } from '../exceptions/http.exception';

export function validationMiddleware(type: any, skipMissingProperties = false): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        validate(plainToInstance(type, req.body), { skipMissingProperties }).then((errors: ValidationError[]) => {
            if (errors.length > 0) {
                // Flatten constraints
                const message = errors.map((error: ValidationError) => Object.values(error.constraints || {})).join(', ');
                next(new HttpException(400, message));
            } else {
                // DTO 인스턴스로 변환된 객체를 req.body에 덮어쓸 수도 있음 (선택 사항)
                // req.body = plainToInstance(type, req.body); 
                next();
            }
        });
    };
}
