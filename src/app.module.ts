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
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: process.env.DATABASE_URL || configService.get('DATABASE_URL'),
        host: configService.get('PGHOST'),
        port: parseInt(configService.get('PGPORT')),
        username: configService.get('PGUSER'),
        password: configService.get('PGPASSWORD'),
        database: configService.get('PGDATABASE'),
        entities: [User, Schedule],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false
        },
        extra: {
          ssl: {
            rejectUnauthorized: false
          }
        }
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ScheduleModule,
  ],
})
export class AppModule {}
