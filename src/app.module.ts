// src/app.module.ts
import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TransactionModule } from './transaction/transaction.module';
import { HealthController } from './health/health.controller';
import { ServeStaticModule } from '@nestjs/serve-static'; // 추가
import { join } from 'path'; // 추가
import { UploadModule } from './upload/upload.module'; // 추가

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
    // 정적 파일 서빙 설정 추가
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      // 프로덕션 환경에서는 캐싱 설정 추가
      serveStaticOptions: {
        maxAge: 86400000, // 24시간 캐싱
        etag: true,
      },
    }),
    AuthModule,
    ScheduleModule,
    TransactionModule,
    UploadModule, // 업로드 모듈 추가
  ],
  controllers: [HealthController],
})
export class AppModule {}
