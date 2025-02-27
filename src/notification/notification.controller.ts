import { Controller, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('token')
    async saveToken(@Request() req, @Body() body: { token: string }) {
        const userId = req.user.userId;
        return this.notificationService.saveToken(userId, body.token);
    }

    @Post('send')
    async sendNotification(@Request() req, @Body() body: { title: string; body: string; eventId: number }) {
        const userId = req.user.userId;
        return this.notificationService.sendNotification(userId, body.title, body.body, body.eventId);
    }
}
