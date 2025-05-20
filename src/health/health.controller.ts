// src/health/health.controller.ts
import { Controller, Get, Logger } from '@nestjs/common';

@Controller()
export class HealthController {
    private readonly logger = new Logger(HealthController.name);

    @Get('health')
    check() {
        this.logger.log('Health check endpoint 호출됨');
        
        // 환경 변수 확인 로깅
        this.logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
        this.logger.log(`DB 연결 URL 존재 여부: ${!!process.env.DATABASE_URL}`);
        
        try {
            // 추가 확인 로직 작성 가능
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            };
        } catch (error) {
            this.logger.error(`Health check 오류: ${error.message}`, error.stack);
            throw error;
        }
    }
}
