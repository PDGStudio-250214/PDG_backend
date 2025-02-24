// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const baseConfig = {
          type: 'postgres' as const,
          url: configService.get<string>('LOCAL_URL'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        };

        // 개발 환경
        if (process.env.NODE_ENV !== 'production') {
          return baseConfig;
        }

        // 프로덕션 환경
        return {
          ...baseConfig,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ScheduleModule,
    TransactionModule,
  ],
})
export class AppModule {}
