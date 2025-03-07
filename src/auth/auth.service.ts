// src/auth/auth.service.ts
import {Injectable, NotFoundException, OnModuleInit, UnauthorizedException} from '@nestjs/common';
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

    // 기존 메서드들
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

    // 원래 이름이 findUserById였지만, getUserById로 변경
    async getUserById(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
        }

        // 비밀번호 제외
        const { password, ...result } = user;
        return result;
    }

    // 기존 메서드 유지
    async findAllUsers() {
        const users = await this.userRepository.find({
            select: ['id', 'email', 'name'] // 비밀번호는 제외
        });
        return users;
    }

    // 기존 메서드 유지
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

    // 기존 메서드 이름 변경 (findUserById -> getUserById로 변경됨)
    async findUserById(userId: number) {
        return this.getUserById(userId);
    }

    // 새로운 메서드들 추가
    async getPublicUserProfile(userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
        }

        // 공개 프로필에는 제한된 정보만 포함
        return {
            id: user.id,
            name: user.name,
            profileImageUrl: user.profileImageUrl
        };
    }

    async updateUserProfile(userId: number, updateData: any) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
        }

        // DTO에서 제공된 필드만 업데이트
        if (updateData.name !== undefined) {
            user.name = updateData.name;
        }
        if (updateData.profileImageUrl !== undefined) {
            user.profileImageUrl = updateData.profileImageUrl;
        }
        if (updateData.bio !== undefined) {
            user.bio = updateData.bio;
        }

        await this.userRepository.save(user);

        // 비밀번호 제외하고 응답
        const { password, ...result } = user;
        return result;
    }

    async updateUserPassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`);
        }

        // 현재 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('현재 비밀번호가 올바르지 않습니다.');
        }

        // 새 비밀번호로 업데이트
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await this.userRepository.save(user);

        return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
    }
}
