// src/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationToken } from './entities/notification-token.entity';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(NotificationToken)
        private tokenRepository: Repository<NotificationToken>,
    ) {
        // Firebase Admin SDK 초기화
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    // 수정된 부분: null 병합 연산자 사용
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
            });
        }
    }

    async saveToken(userId: number, token: string) {
        // 기존 토큰이 있는지 확인
        let tokenEntity = await this.tokenRepository.findOne({ where: { userId, token } });

        // 없으면 새로 저장
        if (!tokenEntity) {
            tokenEntity = this.tokenRepository.create({
                userId,
                token,
            });
        }

        return this.tokenRepository.save(tokenEntity);
    }

    async sendNotification(userId: number, title: string, body: string, eventId: number) {
        // 같은 이벤트에 대한 알림을 다른 사용자에게도 전송
        const allTokens = await this.tokenRepository.find();

        if (!allTokens.length) {
            return { success: false, message: '등록된 알림 토큰이 없습니다.' };
        }

        const tokens = allTokens.map(t => t.token);

        // Firebase로 푸시 알림 전송
        try {
            const message = {
                notification: {
                    title,
                    body,
                },
                data: {
                    eventId: eventId.toString(),
                    time: new Date().toISOString(),
                },
                tokens,
            };

            // 수정된 부분: 최신 API 사용 또는 타입 단언
            const response = await admin.messaging().sendEachForMulticast(message);
            // 또는 const response = await (admin.messaging() as any).sendMulticast(message);

            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        } catch (error) {
            console.error('알림 전송 실패:', error);
            return { success: false, message: '알림 전송 중 오류가 발생했습니다.' };
        }
    }
}
