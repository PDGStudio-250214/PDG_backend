// src/auth/auth.controller.ts
import {Controller, Post, Body, Get, UseGuards, Request} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import {JwtAuthGuard} from "./jwt-auth.guard";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }) {
        return this.authService.login(loginDto);
    }

    @Post('auto-login')
    @UseGuards(JwtAuthGuard)
    async autoLogin(@Request() req) {
        // JwtAuthGuard가 토큰을 검증하고 req.user에 사용자 정보를 설정합니다
        return this.authService.findUserById(req.user.userId);
    }

    @Get('users')
    async findAllUsers() {
        return this.authService.findAllUsers();
    }

    // auth.controller.ts에 추가
    @Post('update-names')
    async updateUserNames() {
        return this.authService.updateUserNames();
    }
}
