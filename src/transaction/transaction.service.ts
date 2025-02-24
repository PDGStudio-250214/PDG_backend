// src/transaction/transaction.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
    ) {}

    async create(userId: number, createTransactionDto: CreateTransactionDto, receipt?: Express.Multer.File) {
        // hosk2014 사용자만 거래내역 생성 가능
        const email = 'hosk2014@test.com'; // 실제로는 user 테이블에서 조회
        if (email !== 'hosk2014@test.com') {
            throw new ForbiddenException('권한이 없습니다.');
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

    async findAll(userId: number, filterDto: TransactionFilterDto) {
        const query = this.transactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.userId = :userId', { userId });

        if (filterDto.type) {
            query.andWhere('transaction.type = :type', { type: filterDto.type });
        }

        if (filterDto.startDate && filterDto.endDate) {
            query.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
                startDate: filterDto.startDate,
                endDate: filterDto.endDate,
            });
        }

        return await query.getMany();
    }

    async findOne(userId: number, id: number) {
        const transaction = await this.transactionRepository.findOne({
            where: { id, user: { id: userId } }
        });

        if (!transaction) {
            throw new NotFoundException('거래내역을 찾을 수 없습니다.');
        }

        return transaction;
    }

    async remove(userId: number, id: number) {
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
