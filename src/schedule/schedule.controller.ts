// src/schedule/schedule.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@ApiTags('schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) {}

    @Post()
    create(@Request() req, @Body() createScheduleDto: CreateScheduleDto) {
        return this.scheduleService.create(req.user.userId, createScheduleDto);
    }

    @Get()
    @ApiQuery({ name: 'all', required: false, type: Boolean })
    findAll(@Request() req, @Query('all') all: string) {
        // all 파라미터가 'true'이면 모든 일정 조회
        const showAll = all === 'true';
        if (showAll) {
            return this.scheduleService.findAllSchedules();
        } else {
            return this.scheduleService.findAll(req.user.userId);
        }
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.scheduleService.findOne(req.user.userId, +id);
    }

    @Put(':id')
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateScheduleDto: UpdateScheduleDto,
    ) {
        return this.scheduleService.update(req.user.userId, +id, updateScheduleDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.scheduleService.remove(req.user.userId, +id);
    }
}
