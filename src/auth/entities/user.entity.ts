// src/auth/entities/user.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from '../../schedule/entities/schedule.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    name: string;

    @Exclude()
    @Column()
    password: string;

    @Column({ nullable: true })
    profileImageUrl: string;

    @Column({ nullable: true })
    bio: string;

    @Column({ default: false })
    isAdmin: boolean;

    @OneToMany(() => Schedule, (schedule) => schedule.user)
    schedules: Schedule[];

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions: Transaction[];


}
