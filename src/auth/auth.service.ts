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
        // 기본 사용자 생성
        const users = [
            {
                email: 'pizza@test.com',
                password: '1234',
                name: '승혜'
            },
            {
                email: '1bfish106@test.com',
                password: '1234',
                name: '가연'
            },
            {
                email: 'hosk2014@test.com',
                password: '1234',
                name: '석린'
            }
        ];

        for (const userData of users) {
            const existingUser = await this.userRepository.findOne({
                where: { email: userData.email }
            });

            if (!existingUser) {
                // 비밀번호 해시화
                const hashedPassword = await bcrypt.hash(userData.password, 10);

                // 사용자 생성 및 저장
                await this.userRepository.save({
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name
                });

                console.log(`사용자 생성됨: ${userData.email} (${userData.name})`);
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

    async updateUserNames() {
        const namesMap = {
            'pizza@test.com': '승혜',
            '1bfish106@test.com': '가연',
            'hosk2014@test.com': '석린'
        };

        for (const [email, name] of Object.entries(namesMap)) {
            await this.userRepository.update({ email }, { name });
        }

        return { message: '사용자 이름 업데이트 완료' };
    }
}
