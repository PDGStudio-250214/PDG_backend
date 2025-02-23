// src/schedule/schedule.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
    constructor(
        @InjectRepository(Schedule)
        private scheduleRepository: Repository<Schedule>,
    ) {}

    async create(userId: number, createScheduleDto: CreateScheduleDto) {
        const schedule = this.scheduleRepository.create({
            ...createScheduleDto,
            user: { id: userId },
        });
        await this.scheduleRepository.save(schedule);
        return { message: '일정이 생성되었습니다.', schedule };
    }

    async findAll(userId: number) {
        const schedules = await this.scheduleRepository.find({
            where: { user: { id: userId } },
            order: { startDate: 'ASC' },
        });
        return { schedules };
    }

    async findOne(userId: number, id: number) {
        const schedule = await this.scheduleRepository.findOne({
            where: { id, user: { id: userId } },
        });

        if (!schedule) {
            throw new NotFoundException('일정을 찾을 수 없습니다.');
        }

        return { schedule };
    }

    async update(userId: number, id: number, updateScheduleDto: UpdateScheduleDto) {
        const schedule = await this.scheduleRepository.findOne({
            where: { id, user: { id: userId } },
        });

        if (!schedule) {
            throw new NotFoundException('일정을 찾을 수 없습니다.');
        }

        await this.scheduleRepository.update(id, updateScheduleDto);
        const updatedSchedule = await this.scheduleRepository.findOne({
            where: { id },
        });

        return { message: '일정이 수정되었습니다.', schedule: updatedSchedule };
    }

    async remove(userId: number, id: number) {
        const schedule = await this.scheduleRepository.findOne({
            where: { id, user: { id: userId } },
        });

        if (!schedule) {
            throw new NotFoundException('일정을 찾을 수 없습니다.');
        }

        await this.scheduleRepository.remove(schedule);
        return { message: '일정이 삭제되었습니다.' };
    }
}
