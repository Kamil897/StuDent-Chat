import { Controller, Get, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@Req() req: Request & { user: { id: number } }) {
    return this.notifications.list(req.user.id);
  }

  @Patch(':id/read')
  read(@Req() req: Request & { user: { id: number } }, @Param('id') id: string) {
    return this.notifications.markRead(req.user.id, Number(id));
  }

  @Patch('read-all')
  readAll(@Req() req: Request & { user: { id: number } }) {
    return this.notifications.markAllRead(req.user.id);
  }
}

