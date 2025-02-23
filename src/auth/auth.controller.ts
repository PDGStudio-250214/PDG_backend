import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('auto-login')
    async autoLogin(@Headers('authorization') auth: string) {
        if (!auth || !auth.startsWith('Bearer ')) {
            return { success: false, message: '토큰이 없습니다.' };
        }
        const token = auth.split(' ')[1];
        return this.authService.autoLogin(token);
    }
}
