// src/auth/auth.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }) {
        return this.authService.login(loginDto);
    }

    @Post('auto-login')
    async autoLogin(@Body() tokenDto: { token: string }) {
        return this.authService.autoLogin(tokenDto.token);
    }

    @Get('users')
    async findAllUsers() {
        return this.authService.findAllUsers();
    }
}
