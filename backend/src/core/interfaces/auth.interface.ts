import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export interface UserPayload {
    userId: string;
    role: string;
    iat?: number;
    exp?: number;
}
