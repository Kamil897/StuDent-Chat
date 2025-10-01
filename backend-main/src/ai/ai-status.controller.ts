import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AiStatusService } from './ai-status.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('ai-status')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiStatusController {
  constructor(private readonly aiStatusService: AiStatusService) {}

  @Get()
  @Roles('creator')
  async getStatus() {
    return await this.aiStatusService.getStatus();
  }

  @Patch()
  @Roles('creator')
  async setStatus(@Body() body: { running: boolean }) {
    return await this.aiStatusService.setStatus(Boolean(body?.running));
  }
}
