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
        const port = configService.get('PGPORT');
        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          host: configService.get<string>('PGHOST', 'localhost'),
          port: port ? parseInt(port) : 5432,
          username: configService.get<string>('PGUSER', 'postgres'),
          password: configService.get<string>('PGPASSWORD', 'postgres'),
          database: configService.get<string>('PGDATABASE', 'schedule_db'),
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
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ScheduleModule,
  ],
})
export class AppModule {}
