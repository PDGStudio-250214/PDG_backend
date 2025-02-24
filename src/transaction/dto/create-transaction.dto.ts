// src/transaction/dto/create-transaction.dto.ts
import { IsEnum, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
    @ApiProperty({ enum: TransactionType })
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty()
    @IsNumber()
    amount: number;

    @ApiProperty()
    @IsDateString()
    date: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;
}
