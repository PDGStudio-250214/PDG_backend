// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedule/schedule.module';
import { User } from './auth/entities/user.entity';
import { Schedule } from './schedule/entities/schedule.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');

        return {
          type: 'postgres',
          url: 'postgresql://postgres:mMdADXghquHUYojwBwpMbpOrfUuksDBQ@switchyard.proxy.rlwy.net:17806/railway',
          entities: [User, Schedule],
          synchronize: true,
          ssl: {
            rejectUnauthorized: false
          }
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ScheduleModule,
  ],
})
export class AppModule {}
