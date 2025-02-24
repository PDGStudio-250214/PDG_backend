// src/auth/auth.service.ts
import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async onModuleInit() {
        // 초기 사용자 데이터 생성
        const defaultUsers = [
            { email: 'pizza@test.com', name: 'pizza' },
            { email: '1bfish106@test.com', name: '1bfish106' },
            { email: 'dollyn@test.com', name: 'hosk2014' },
        ];

        const hashedPassword = await bcrypt.hash('1234', 10);

        for (const userData of defaultUsers) {
            const existingUser = await this.userRepository.findOne({
                where: { email: userData.email },
            });

            if (!existingUser) {
                const user = this.userRepository.create({
                    ...userData,
                    password: hashedPassword,
                });
                await this.userRepository.save(user);
            }
        }
    }

    async validateUser(loginDto: { email: string; password: string }) {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
        });

        if (user && await bcrypt.compare(loginDto.password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: { email: string; password: string }) {
        const user = await this.validateUser(loginDto);
        if (!user) {
            return { success: false, message: '로그인 실패' };
        }

        const payload = { email: user.email, sub: user.id };
        return {
            success: true,
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    // 자동 로그인 함수 추가
    async autoLogin(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            const user = await this.userRepository.findOne({
                where: { id: decoded.sub }
            });

            if (!user) {
                throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
            }

            return {
                success: true,
                access_token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '자동 로그인 실패'
            };
        }
    }
}
