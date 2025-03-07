// src/auth/user.controller.ts
import { Body, Controller, Get, Param, Patch, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('users')
export class UserController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        return this.authService.getUserById(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUserById(@Request() req, @Param('id') id: string) {
        // 관리자이거나 자신의 프로필만 조회 가능
        if (req.user.isAdmin || req.user.id === parseInt(id)) {
            return this.authService.getUserById(parseInt(id));
        }
        // 다른 사용자 정보는 제한된 정보만 제공
        return this.authService.getPublicUserProfile(parseInt(id));
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(@Request() req, @Body() updateProfileDto: any) {
        return this.authService.updateUserProfile(req.user.id, updateProfileDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('password')
    async updatePassword(
        @Request() req,
        @Body() updatePasswordDto: { currentPassword: string; newPassword: string }
    ) {
        try {
            return await this.authService.updateUserPassword(
                req.user.id,
                updatePasswordDto.currentPassword,
                updatePasswordDto.newPassword
            );
        } catch (error) {
            if (error.message === '현재 비밀번호가 올바르지 않습니다.') {
                throw new UnauthorizedException(error.message);
            }
            throw error;
        }
    }
}
