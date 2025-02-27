import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationToken } from './entities/notification-token.entity';
import { User } from '../auth/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationToken, User])],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
