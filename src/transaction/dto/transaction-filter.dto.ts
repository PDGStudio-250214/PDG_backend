// src/transaction/dto/transaction-filter.dto.ts
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionFilterDto {
    @ApiProperty({ enum: TransactionType, required: false })
    @IsEnum(TransactionType)
    @IsOptional()
    type?: TransactionType;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}
