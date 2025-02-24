// src/transaction/entities/transaction.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum TransactionType {
    RENT = 'RENT',           // 월세
    DEPOSIT = 'DEPOSIT',     // 입금
    WITHDRAWAL = 'WITHDRAWAL', // 출금
    UTILITY = 'UTILITY',     // 공과금
    MAINTENANCE = 'MAINTENANCE' // 관리비
}

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: TransactionType })
    type: TransactionType;

    @Column()
    amount: number;

    @Column()
    date: Date;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true, type: 'varchar' })
    receipt?: string; // 영수증 파일 경로를 optional로 변경

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.transactions)
    user: User;
}
