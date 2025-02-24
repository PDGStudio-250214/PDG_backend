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

    // src/auth/auth.service.ts의 onModuleInit 메서드
    async onModuleInit() {
        // 초기 사용자 데이터 생성
        const defaultUsers = [
            { email: 'pizza@test.com', name: 'pizza' },
            { email: '1bfish106@test.com', name: '1bfish106' },
            { email: 'hosk2014@test.com', name: 'hosk2014' }
        ];

        const hashedPassword = await bcrypt.hash('1234', 10);

        for (const userData of defaultUsers) {
            try {
                // 기존 사용자가 있다면 삭제
                await this.userRepository.delete({ email: userData.email });

                // 새로운 사용자 생성
                const user = this.userRepository.create({
                    ...userData,
                    password: hashedPassword,
                });
                await this.userRepository.save(user);
                console.log(`Created/Updated user: ${userData.email}`);
            } catch (error) {
                console.error(`Error creating user ${userData.email}:`, error);
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

    // src/auth/auth.service.ts에 메서드 추가
    async findAllUsers() {
        const users = await this.userRepository.find({
            select: ['id', 'email', 'name'] // 비밀번호는 제외
        });
        return users;
    }
}
