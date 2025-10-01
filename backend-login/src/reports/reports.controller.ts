import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Request } from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  // user создаёт жалобу
  @Post()
  @Roles('user','admin','creator')
  create(@Req() req: Request & { user: { id: number } }, @Body() body: { targetId?: number; reason: string }) {
    return this.reports.createReport(req.user.id, body);
  }

  // admin/creator видят список
  @Get()
  @Roles('admin','creator')
  list() { return this.reports.list(); }

  // назначить на себя
  @Patch(':id/assign')
  @Roles('admin','creator')
  assign(@Req() req: Request & { user: { id: number } }, @Param('id') id: string) {
    return this.reports.assign(Number(id), req.user.id);
  }

  // изменить статус
  @Patch(':id/status')
  @Roles('admin','creator')
  updateStatus(
    @Req() req: Request & { user: { id: number } },
    @Param('id') id: string,
    @Body() body: { status: 'in_review'|'resolved'|'rejected' }
  ) {
    return this.reports.updateStatus(Number(id), req.user.id, body.status);
  }
}
