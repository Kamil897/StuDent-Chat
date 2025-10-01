import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Request } from 'express';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('top-games')
  @Roles('admin', 'creator')
  async getTopGames(@Query('limit') limit?: string) {
    return this.analyticsService.getTopGames(limit ? parseInt(limit) : 10);
  }

  @Get('active-users')
  @Roles('admin', 'creator')
  async getActiveUsers(@Query('days') days?: string) {
    return this.analyticsService.getActiveUsers(days ? parseInt(days) : 7);
  }

  @Get('sales')
  @Roles('admin', 'creator')
  async getSalesStats(@Query('days') days?: string) {
    return this.analyticsService.getSalesStats(days ? parseInt(days) : 30);
  }

  @Get('game/:gameName')
  @Roles('admin', 'creator')
  async getGameAnalytics(@Param('gameName') gameName: string) {
    return this.analyticsService.getGameAnalytics(gameName);
  }

  @Get('user/:id')
  @Roles('admin', 'creator')
  async getUserAnalytics(@Param('id') id: string) {
    return this.analyticsService.getUserAnalytics(parseInt(id));
  }

  @Get('user')
  async getCurrentUserAnalytics(@Req() req: Request & { user: { id: number } }) {
    return this.analyticsService.getUserAnalytics(req.user.id);
  }
}




