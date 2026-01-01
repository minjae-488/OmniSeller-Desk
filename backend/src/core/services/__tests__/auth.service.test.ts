import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService, TokenPayload } from '../auth.service';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../config/config.service', () => ({
    config: {
        jwtSecret: 'test-secret-key',
        get: jest.fn((key: string) => {
            if (key === 'JWT_EXPIRES_IN') return '1d';
            return undefined;
        }),
    },
}));

describe('AuthService (Core)', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('hashPassword', () => {
        it('should hash password with bcrypt', async () => {
            // Arrange
            const password = 'MyPassword123!';
            const hashedPassword = '$2a$10$hashedPasswordExample';

            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            // Act
            const result = await authService.hashPassword(password);

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(result).toBe(hashedPassword);
        });

        it('should use saltRounds of 10', async () => {
            // Arrange
            const password = 'TestPassword';
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

            // Act
            await authService.hashPassword(password);

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
        });

        it('should return different hashes for same password (due to salt)', async () => {
            // Arrange
            const password = 'SamePassword';
            const hash1 = '$2a$10$hash1';
            const hash2 = '$2a$10$hash2';

            (bcrypt.hash as jest.Mock)
                .mockResolvedValueOnce(hash1)
                .mockResolvedValueOnce(hash2);

            // Act
            const result1 = await authService.hashPassword(password);
            const result2 = await authService.hashPassword(password);

            // Assert
            expect(result1).not.toBe(result2);
        });
    });

    describe('comparePassword', () => {
        it('should return true when passwords match', async () => {
            // Arrange
            const plainPassword = 'MyPassword123!';
            const hashedPassword = '$2a$10$hashedPasswordExample';

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            // Act
            const result = await authService.comparePassword(plainPassword, hashedPassword);

            // Assert
            expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
            expect(result).toBe(true);
        });

        it('should return false when passwords do not match', async () => {
            // Arrange
            const plainPassword = 'WrongPassword';
            const hashedPassword = '$2a$10$hashedPasswordExample';

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act
            const result = await authService.comparePassword(plainPassword, hashedPassword);

            // Assert
            expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
            expect(result).toBe(false);
        });
    });

    describe('generateToken', () => {
        it('should generate JWT token with correct payload', () => {
            // Arrange
            const payload: TokenPayload = {
                userId: 'user-123',
                role: 'USER',
            };
            const expectedToken = 'jwt.token.here';

            (jwt.sign as jest.Mock).mockReturnValue(expectedToken);

            // Act
            const result = authService.generateToken(payload);

            // Assert
            expect(jwt.sign).toHaveBeenCalledWith(
                payload,
                'test-secret-key',
                { expiresIn: '1d' },
            );
            expect(result).toBe(expectedToken);
        });

        it('should use JWT secret from config', () => {
            // Arrange
            const payload: TokenPayload = {
                userId: 'user-456',
                role: 'ADMIN',
            };

            (jwt.sign as jest.Mock).mockReturnValue('token');

            // Act
            authService.generateToken(payload);

            // Assert
            expect(jwt.sign).toHaveBeenCalledWith(
                expect.any(Object),
                'test-secret-key',
                expect.any(Object),
            );
        });

        it('should set expiration time from config', () => {
            // Arrange
            const payload: TokenPayload = {
                userId: 'user-789',
                role: 'USER',
            };

            (jwt.sign as jest.Mock).mockReturnValue('token');

            // Act
            authService.generateToken(payload);

            // Assert
            expect(jwt.sign).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(String),
                { expiresIn: '1d' },
            );
        });
    });

    describe('verifyToken', () => {
        it('should successfully verify valid token', () => {
            // Arrange
            const token = 'valid.jwt.token';
            const decodedPayload = {
                userId: 'user-123',
                role: 'USER',
                iat: 1234567890,
                exp: 1234567890,
            };

            (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

            // Act
            const result = authService.verifyToken(token);

            // Assert
            expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');
            expect(result).toEqual(decodedPayload);
        });

        it('should throw error when token is invalid', () => {
            // Arrange
            const token = 'invalid.token';

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('jwt malformed');
            });

            // Act & Assert
            expect(() => authService.verifyToken(token)).toThrow('Invalid Token');
            expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');
        });

        it('should throw error when token is expired', () => {
            // Arrange
            const token = 'expired.token';

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('jwt expired');
            });

            // Act & Assert
            expect(() => authService.verifyToken(token)).toThrow('Invalid Token');
        });

        it('should throw error when signature is invalid', () => {
            // Arrange
            const token = 'tampered.token';

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('invalid signature');
            });

            // Act & Assert
            expect(() => authService.verifyToken(token)).toThrow('Invalid Token');
        });

        it('should use JWT secret from config for verification', () => {
            // Arrange
            const token = 'some.token';

            (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-123', role: 'USER' });

            // Act
            authService.verifyToken(token);

            // Assert
            expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');
        });
    });
});
