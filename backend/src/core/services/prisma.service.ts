import { PrismaClient } from '@prisma/client';
import { config } from '../../config/config.service';
import logger from '../../utils/logger';

export class PrismaService {
    private static instance: PrismaService;
    public readonly client: PrismaClient;

    private constructor() {
        // 런타임 에러 방지를 위해 생성자 옵션을 제거하고 기본값(환경변수 DATABASE_URL) 사용
        this.client = new PrismaClient({
            log: config.isProduction ? ['error'] : ['query', 'info', 'warn', 'error'],
        } as any);
    }

    public static getInstance(): PrismaService {
        if (!PrismaService.instance) {
            PrismaService.instance = new PrismaService();
        }
        return PrismaService.instance;
    }

    async connect() {
        try {
            await this.client.$connect();
            logger.info('✅ Database connected successfully');
        } catch (error) {
            logger.error(`❌ Database connection failed: ${error}`);
            process.exit(1);
        }
    }

    async disconnect() {
        await this.client.$disconnect();
        logger.info('❌ Database disconnected');
    }
}

export const prismaService = PrismaService.getInstance();
export const prisma = prismaService.client;
