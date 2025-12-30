import { PrismaClient } from '../../generated/prisma/client';
import { config } from '../../config/config.service';
import logger from '../../utils/logger';

export class PrismaService {
    private static instance: PrismaService;
    public readonly client: PrismaClient;

    private constructor() {
        this.client = new PrismaClient({
            datasources: {
                db: {
                    url: config.databaseUrl,
                },
            },
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
