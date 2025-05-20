// src/app.module.ts
import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TransactionModule } from './transaction/transaction.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseConnection');
        const dbUrl = configService.get('DATABASE_URL');
        
        if (!dbUrl) {
          logger.error('DATABASE_URL 환경 변수가 설정되지 않았습니다!');
        } else {
          logger.log('데이터베이스 URL이 설정되어 있습니다.');
        }
        
        const sslConfig = process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false,
        } : false;
        
        logger.log(`NODE_ENV: ${process.env.NODE_ENV}, SSL 설정: ${JSON.stringify(sslConfig)}`);
        
        return {
          type: 'postgres',
          url: dbUrl,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          ssl: sslConfig,
          // 연결 오류에 대한 자세한 로깅 추가
          logging: ['error', 'warn'],
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ScheduleModule,
    TransactionModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
