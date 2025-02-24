// src/transaction/transaction.controller.ts
import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post()
    @UseInterceptors(FileInterceptor('receipt'))
    create(
        @Request() req,
        @Body() createTransactionDto: CreateTransactionDto,
        @UploadedFile() receipt?: Express.Multer.File
    ) {
        return this.transactionService.create(req.user.userId, createTransactionDto, receipt);
    }

    @Get()
    findAll(@Request() req, @Query() filterDto: TransactionFilterDto) {
        return this.transactionService.findAll(req.user.userId, filterDto);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.transactionService.findOne(req.user.userId, +id);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.transactionService.remove(req.user.userId, +id);
    }
}
