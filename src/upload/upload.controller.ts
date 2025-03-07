// src/upload/upload.controller.ts
import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('upload')
export class UploadController {
    @UseGuards(JwtAuthGuard)
    @Post('profile-image')
    @UseInterceptors(FileInterceptor('profileImage'))
    async uploadProfileImage(@UploadedFile() file, @Request() req) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const imageUrl = `${baseUrl}/uploads/profiles/${file.filename}`;

        return {
            success: true,
            imageUrl,
            filename: file.filename,
        };
    }
}
