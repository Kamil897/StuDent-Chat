import { Module } from '@nestjs/common';
import { IeltsService } from './ielts.service';
import { IeltsController } from './ielts.controller';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from '../openai/openai.service';
import { HistoryService } from '../history/history.service';

@Module({
  controllers: [IeltsController],
  providers: [IeltsService, PrismaService, OpenAIService, HistoryService],
})
export class IeltsModule {}


