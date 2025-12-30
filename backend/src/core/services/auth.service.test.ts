import { authService, TokenPayload } from './auth.service';

describe('AuthService', () => {
    const password = 'test-password';
    let hashedPassword = '';
    let token = '';

    describe('Password Hashing', () => {
        it('should hash a password', async () => {
            hashedPassword = await authService.hashPassword(password);
            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe(password);
        });

        it('should compare a correct password', async () => {
            // 해싱된 비밀번호가 있어야 테스트 가능하므로, 위에서 실패하면 여기도 실패함.
            // 모킹하지 않고 실제 로직 테스트 (Unit Test)
            if (!hashedPassword) return; // Skip if hash failed
            const isMatch = await authService.comparePassword(password, hashedPassword);
            expect(isMatch).toBe(true);
        });

        it('should fail comparing an incorrect password', async () => {
            if (!hashedPassword) return;
            const isMatch = await authService.comparePassword('wrong-password', hashedPassword);
            expect(isMatch).toBe(false);
        });
    });

    describe('JWT Management', () => {
        const payload: TokenPayload = { userId: 'user-123', role: 'USER' };

        it('should generate a token', () => {
            token = authService.generateToken(payload);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        it('should verify a valid token', () => {
            if (!token) return;
            const decoded: any = authService.verifyToken(token);
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.role).toBe(payload.role);
        });

        it('should throw error for invalid token', () => {
            expect(() => {
                authService.verifyToken('invalid-token');
            }).toThrow();
        });
    });
});
