import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiStatusService } from './ai-status.service';
import { AiStatusController } from './ai-status.controller';

@Module({
  imports: [HttpModule],
  controllers: [AiController, AiStatusController],
  providers: [AiService, AiStatusService],
})
export class AiModule {}
