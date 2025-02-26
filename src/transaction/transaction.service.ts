// src/transaction/transaction.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { User } from '../auth/entities/user.entity';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async create(userId: number, createTransactionDto: CreateTransactionDto, receipt?: Express.Multer.File) {
        // hosk2014 사용자 ID 확인
        const user = await this.userRepository.findOne({ where: { id: userId } });

        // user가 null인 경우 처리
        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        // 오직 hosk2014@test.com 계정만 거래 내역을 추가/수정 가능
        if (user.email !== 'hosk2014@test.com') {
            throw new ForbiddenException('금융 내역을 추가할 권한이 없습니다.');
        }

        const transaction = this.transactionRepository.create({
            ...createTransactionDto,
            user: { id: userId }
        });

        if (receipt) {
            const uploadDir = path.join(process.cwd(), 'uploads');
            await fs.mkdir(uploadDir, { recursive: true });

            const filename = `${Date.now()}-${receipt.originalname}`;
            const filepath = path.join(uploadDir, filename);
            await fs.writeFile(filepath, receipt.buffer);
            transaction.receipt = filename;
        }

        return await this.transactionRepository.save(transaction);
    }

    async update(userId: number, id: number, updateTransactionDto: CreateTransactionDto) {
        // hosk2014 사용자 확인
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        if (user.email !== 'hosk2014@test.com') {
            throw new ForbiddenException('금융 내역을 수정할 권한이 없습니다.');
        }

        const transaction = await this.findOne(userId, id);
        const updated = this.transactionRepository.merge(transaction, updateTransactionDto);
        return await this.transactionRepository.save(updated);
    }

    async findAll(userId: number, filterDto: TransactionFilterDto) {
        const query = this.transactionRepository.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.user', 'user');

        // 필터링 적용
        if (filterDto.type) {
            query.andWhere('transaction.type = :type', { type: filterDto.type });
        }

        if (filterDto.startDate && filterDto.endDate) {
            query.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
                startDate: filterDto.startDate,
                endDate: filterDto.endDate,
            });
        }

        // 모든 사용자가 모든 내역을 볼 수 있음
        return await query.getMany();
    }

    async findOne(userId: number, id: number) {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: ['user']
        });

        if (!transaction) {
            throw new NotFoundException('거래내역을 찾을 수 없습니다.');
        }

        return transaction;
    }

    async remove(userId: number, id: number) {
        // hosk2014 사용자 확인
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        if (user.email !== 'hosk2014@test.com') {
            throw new ForbiddenException('금융 내역을 삭제할 권한이 없습니다.');
        }

        const transaction = await this.findOne(userId, id);
        if (transaction.receipt) {
            const filepath = path.join(process.cwd(), 'uploads', transaction.receipt);
            try {
                await fs.unlink(filepath);
            } catch (error) {
                console.error('영수증 파일 삭제 실패:', error);
            }
        }
        await this.transactionRepository.remove(transaction);
        return { message: '거래내역이 삭제되었습니다.' };
    }
}
