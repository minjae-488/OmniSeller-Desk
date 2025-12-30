import winston from 'winston';
import { config } from '../config/config.service';
import path from 'path';

const { combine, timestamp, printf, colorize, json } = winston.format;

// 로그 포맷 정의
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// 로그 파일 경로
const logDir = path.join(process.cwd(), 'logs');

// 로거 생성
const logger = winston.createLogger({
    level: config.isProduction ? 'info' : 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
    transports: [
        // 에러 로그 파일
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
        }),
        // 전체 로그 파일
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
        }),
    ],
});

// 개발 환경일 경우 콘솔에도 출력
if (!config.isProduction) {
    logger.add(
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            ),
        })
    );
}

// 스트림 유틸리티 (Morgan 연동용)
export const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

export default logger;
