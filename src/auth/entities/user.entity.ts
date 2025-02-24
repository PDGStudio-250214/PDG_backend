// src/auth/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Schedule } from '../../schedule/entities/schedule.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Schedule, schedule => schedule.user)
    schedules: Schedule[];

    @OneToMany(() => Transaction, transaction => transaction.user)
    transactions: Transaction[];
}
