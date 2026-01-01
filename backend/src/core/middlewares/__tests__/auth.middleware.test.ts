import { Response, NextFunction } from 'express';
import { authMiddleware, roleMiddleware } from '../auth.middleware';
import { AuthRequest } from '../../interfaces/auth.interface';
import { HttpException } from '../../exceptions/http.exception';
import { authService } from '../../services/auth.service';

// Mock dependencies
jest.mock('../../services/auth.service', () => ({
    authService: {
        verifyToken: jest.fn(),
    },
}));

describe('authMiddleware', () => {
    let mockRequest: Partial<AuthRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {
            headers: {},
        };
        mockResponse = {};
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    it('should successfully authenticate with valid Bearer token', () => {
        // Arrange
        const token = 'valid_jwt_token';
        const decodedPayload = {
            userId: 'user-123',
            role: 'USER',
            iat: 1234567890,
            exp: 1234567890,
        };

        mockRequest.headers = {
            authorization: `Bearer ${token}`,
        };

        (authService.verifyToken as jest.Mock).mockReturnValue(decodedPayload);

        // Act
        authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(authService.verifyToken).toHaveBeenCalledWith(token);
        expect(mockRequest.user).toEqual({
            userId: decodedPayload.userId,
            role: decodedPayload.role,
        });
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException when Authorization header is missing', () => {
        // Arrange
        mockRequest.headers = {};

        // Act
        authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
        const error = (mockNext as jest.Mock).mock.calls[0][0];
        expect(error.status).toBe(401);
        expect(error.message).toBe('Authorization header is missing');
        expect(authService.verifyToken).not.toHaveBeenCalled();
    });

    it('should throw HttpException when token format is invalid (missing Bearer)', () => {
        // Arrange
        mockRequest.headers = {
            authorization: 'invalid_token_format',
        };

        // Act
        authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
        const error = (mockNext as jest.Mock).mock.calls[0][0];
        expect(error.status).toBe(401);
        expect(error.message).toBe('Invalid token format. Use: Bearer <token>');
        expect(authService.verifyToken).not.toHaveBeenCalled();
    });

    it('should throw HttpException when token is missing after Bearer', () => {
        // Arrange
        mockRequest.headers = {
            authorization: 'Bearer ',
        };

        // Act
        authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
        const error = (mockNext as jest.Mock).mock.calls[0][0];
        expect(error.status).toBe(401);
        expect(error.message).toBe('Invalid token format. Use: Bearer <token>');
    });

    it('should throw HttpException when token is expired', () => {
        // Arrange
        const token = 'expired_token';
        mockRequest.headers = {
            authorization: `Bearer ${token}`,
        };

        (authService.verifyToken as jest.Mock).mockImplementation(() => {
            throw new Error('jwt expired');
        });

        // Act
        authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(authService.verifyToken).toHaveBeenCalledWith(token);
        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
        const error = (mockNext as jest.Mock).mock.calls[0][0];
        expect(error.status).toBe(401);
        expect(error.message).toBe('Invalid or expired token');
    });

    it('should throw HttpException when token is invalid', () => {
        // Arrange
        const token = 'invalid_token';
        mockRequest.headers = {
            authorization: `Bearer ${token}`,
        };

        (authService.verifyToken as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid Token');
        });

        // Act
        authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(authService.verifyToken).toHaveBeenCalledWith(token);
        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
        const error = (mockNext as jest.Mock).mock.calls[0][0];
        expect(error.status).toBe(401);
        expect(error.message).toBe('Invalid or expired token');
    });

    it('should attach user payload to request object', () => {
        // Arrange
        const token = 'valid_token';
        const decodedPayload = {
            userId: 'user-456',
            role: 'ADMIN',
            iat: 1234567890,
            exp: 1234567890,
        };

        mockRequest.headers = {
            authorization: `Bearer ${token}`,
        };

        (authService.verifyToken as jest.Mock).mockReturnValue(decodedPayload);

        // Act
        authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(mockRequest.user).toBeDefined();
        expect(mockRequest.user?.userId).toBe(decodedPayload.userId);
        expect(mockRequest.user?.role).toBe(decodedPayload.role);
        expect(mockRequest.user).not.toHaveProperty('iat');
        expect(mockRequest.user).not.toHaveProperty('exp');
    });
});

describe('roleMiddleware', () => {
    let mockRequest: Partial<AuthRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {};
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    it('should allow access when user has required role', () => {
        // Arrange
        mockRequest.user = {
            userId: 'user-123',
            role: 'ADMIN',
        };

        const middleware = roleMiddleware('ADMIN', 'SUPER_ADMIN');

        // Act
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should allow access when user has one of multiple allowed roles', () => {
        // Arrange
        mockRequest.user = {
            userId: 'user-123',
            role: 'USER',
        };

        const middleware = roleMiddleware('USER', 'ADMIN');

        // Act
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw HttpException when user does not have required role', () => {
        // Arrange
        mockRequest.user = {
            userId: 'user-123',
            role: 'USER',
        };

        const middleware = roleMiddleware('ADMIN');

        // Act
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
        const error = (mockNext as jest.Mock).mock.calls[0][0];
        expect(error.status).toBe(403);
        expect(error.message).toBe('Insufficient permissions');
    });

    it('should throw HttpException when user is not authenticated', () => {
        // Arrange
        mockRequest.user = undefined;

        const middleware = roleMiddleware('ADMIN');

        // Act
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
        const error = (mockNext as jest.Mock).mock.calls[0][0];
        expect(error.status).toBe(401);
        expect(error.message).toBe('Authentication required');
    });

    it('should handle multiple roles correctly', () => {
        // Arrange
        mockRequest.user = {
            userId: 'user-123',
            role: 'MODERATOR',
        };

        const middleware = roleMiddleware('ADMIN', 'MODERATOR', 'SUPER_ADMIN');

        // Act
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should be case-sensitive for role checking', () => {
        // Arrange
        mockRequest.user = {
            userId: 'user-123',
            role: 'admin', // lowercase
        };

        const middleware = roleMiddleware('ADMIN'); // uppercase

        // Act
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
        const error = (mockNext as jest.Mock).mock.calls[0][0];
        expect(error.status).toBe(403);
    });
});
