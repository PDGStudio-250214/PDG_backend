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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
    findAll(@Request() req) {
        return this.scheduleService.findAll(req.user.userId);
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
