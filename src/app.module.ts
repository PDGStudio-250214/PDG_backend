// src/app.module.ts
import { Module } from '@nestjs/common';
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
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false,
        } : false
      }),
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
