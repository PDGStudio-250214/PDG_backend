// src/schedule/dto/create-schedule.dto.ts
import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto {
    @ApiProperty({ example: '프로젝트 미팅', description: '일정 제목' })
    @IsString()
    title: string;

    @ApiProperty({ example: '프로젝트 진행상황 논의', description: '일정 설명' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: '2025-02-24T09:00:00', description: '시작 시간' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2025-02-24T10:00:00', description: '종료 시간' })
    @IsDateString()
    endDate: string;
}
