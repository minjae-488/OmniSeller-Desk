import dotenv from 'dotenv';
import path from 'path';

// 환경변수 로드 (.env 파일 위치 지정)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export class ConfigService {
    private static instance: ConfigService;
    private readonly envConfig: { [key: string]: string | undefined };

    private constructor() {
        this.envConfig = process.env;
        this.validateInput();
    }

    // 싱글톤 인스턴스 반환
    public static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    // 필수 환경변수 검증
    private validateInput(): void {
        const requiredKeys = [
            'PORT',
            'NODE_ENV',
            'DATABASE_URL',
            'JWT_SECRET',
        ];

        const missingKeys = requiredKeys.filter((key) => !this.envConfig[key]);

        if (missingKeys.length > 0) {
            throw new Error(
                `❌ Missing required environment variables: ${missingKeys.join(', ')}`
            );
        }
    }

    // Getter 메서드들
    public get(key: string): string {
        return this.envConfig[key] || '';
    }

    public getNumber(key: string): number {
        const value = this.get(key);
        return Number(value);
    }

    public get isProduction(): boolean {
        return this.get('NODE_ENV') === 'production';
    }

    public get port(): number {
        return this.getNumber('PORT') || 4000;
    }

    public get databaseUrl(): string {
        return this.get('DATABASE_URL');
    }

    public get jwtSecret(): string {
        return this.get('JWT_SECRET');
    }
}

// 편의를 위해 인스턴스 export
export const config = ConfigService.getInstance();
