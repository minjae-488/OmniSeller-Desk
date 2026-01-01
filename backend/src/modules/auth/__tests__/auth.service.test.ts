import { AuthService } from '../auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { prisma } from '../../../core/services/prisma.service';
import { authService as authHelper } from '../../../core/services/auth.service';
import { HttpException } from '../../../core/exceptions/http.exception';

// Mock dependencies
jest.mock('../../../core/services/prisma.service', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

jest.mock('../../../core/services/auth.service', () => ({
    authService: {
        hashPassword: jest.fn(),
        comparePassword: jest.fn(),
        generateToken: jest.fn(),
    },
}));

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('register', () => {
        const registerDto: RegisterDto = {
            email: 'test@example.com',
            password: 'Password123!',
            name: 'Test User',
        };

        it('should successfully register a new user', async () => {
            // Arrange
            const hashedPassword = 'hashed_password_123';
            const createdUser = {
                id: 'user-123',
                email: registerDto.email,
                name: registerDto.name,
                password: hashedPassword,
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (authHelper.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
            (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

            // Act
            const result = await authService.register(registerDto);

            // Assert
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: registerDto.email },
            });
            expect(authHelper.hashPassword).toHaveBeenCalledWith(registerDto.password);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: registerDto.email,
                    name: registerDto.name,
                    password: hashedPassword,
                },
            });
            expect(result).toEqual(createdUser);
        });

        it('should throw HttpException when email already exists', async () => {
            // Arrange
            const existingUser = {
                id: 'existing-user',
                email: registerDto.email,
                name: 'Existing User',
                password: 'hashed_password',
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

            // Act & Assert
            await expect(authService.register(registerDto)).rejects.toThrow(HttpException);
            await expect(authService.register(registerDto)).rejects.toThrow(
                `Email ${registerDto.email} already exists`,
            );
            expect(authHelper.hashPassword).not.toHaveBeenCalled();
            expect(prisma.user.create).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            email: 'test@example.com',
            password: 'Password123!',
        };

        const mockUser = {
            id: 'user-123',
            email: loginDto.email,
            name: 'Test User',
            password: 'hashed_password_123',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should successfully login with valid credentials', async () => {
            // Arrange
            const token = 'jwt_token_123';

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (authHelper.comparePassword as jest.Mock).mockResolvedValue(true);
            (authHelper.generateToken as jest.Mock).mockReturnValue(token);

            // Act
            const result = await authService.login(loginDto);

            // Assert
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: loginDto.email },
            });
            expect(authHelper.comparePassword).toHaveBeenCalledWith(
                loginDto.password,
                mockUser.password,
            );
            expect(authHelper.generateToken).toHaveBeenCalledWith({
                userId: mockUser.id,
                role: mockUser.role,
            });
            expect(result).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    name: mockUser.name,
                    role: mockUser.role,
                    createdAt: mockUser.createdAt,
                    updatedAt: mockUser.updatedAt,
                },
                token,
            });
            expect(result.user).not.toHaveProperty('password');
        });

        it('should throw HttpException when user does not exist', async () => {
            // Arrange
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(authService.login(loginDto)).rejects.toThrow(HttpException);
            await expect(authService.login(loginDto)).rejects.toThrow('Invalid email or password');
            expect(authHelper.comparePassword).not.toHaveBeenCalled();
            expect(authHelper.generateToken).not.toHaveBeenCalled();
        });

        it('should throw HttpException when password is invalid', async () => {
            // Arrange
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (authHelper.comparePassword as jest.Mock).mockResolvedValue(false);

            // Act & Assert
            await expect(authService.login(loginDto)).rejects.toThrow(HttpException);
            await expect(authService.login(loginDto)).rejects.toThrow('Invalid email or password');
            expect(authHelper.comparePassword).toHaveBeenCalledWith(
                loginDto.password,
                mockUser.password,
            );
            expect(authHelper.generateToken).not.toHaveBeenCalled();
        });

        it('should return token and user without password field', async () => {
            // Arrange
            const token = 'jwt_token_123';

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (authHelper.comparePassword as jest.Mock).mockResolvedValue(true);
            (authHelper.generateToken as jest.Mock).mockReturnValue(token);

            // Act
            const result = await authService.login(loginDto);

            // Assert
            expect(result.user).toBeDefined();
            expect(result.token).toBe(token);
            expect(result.user).not.toHaveProperty('password');
            expect(Object.keys(result.user)).not.toContain('password');
        });
    });
});
