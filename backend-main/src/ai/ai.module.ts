import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiStatusService } from './ai-status.service';
import { AiStatusController } from './ai-status.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [AiController, AiStatusController],
  providers: [AiService, AiStatusService, PrismaService],
})
export class AiModule {}
