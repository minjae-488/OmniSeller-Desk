import app from './app';
import { config } from './config/config.service';
import { prismaService } from './core/services/prisma.service';
import logger from './utils/logger';

const PORT = config.port;

// 서버 시작 함수
const startServer = async () => {
  try {
    // Database 연결 시도
    await prismaService.connect();

    // Express 서버 시작
    const server = app.listen(PORT, () => {
      logger.info(`
      ################################################
      🛡️  Server listening on port: ${PORT} 🛡️
      ################################################
      `);
    });

    // Graceful Shutdown 처리
    const shutdown = async () => {
      logger.info('🛑 SIGINT/SIGTERM received. Shutting down server...');

      // 1. 더이상 새로운 요청을 받지 않음
      server.close(async () => {
        logger.info('🔒 HTTP server closed.');

        // 2. DB 연결 해제
        await prismaService.disconnect();

        logger.info('👋 Server shutdown complete.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    logger.error(`❌ Server start failed: ${error}`);
    process.exit(1);
  }
};

startServer();
