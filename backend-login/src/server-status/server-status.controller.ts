import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ServerStatusService } from './server-status.service';

@Controller('server-status')
export class ServerStatusController {
  constructor(private readonly serverStatusService: ServerStatusService) {}

  @Get()
  async getStatus() {
    return this.serverStatusService.getStatus();
  }

  @Patch()
  async updateStatus(@Body() data: { uptime?: number; onlineUsers?: number; message?: string }) {
    return this.serverStatusService.updateStatus(data);
  }
}
