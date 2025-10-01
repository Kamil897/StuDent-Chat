import { Controller, Get, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('creator')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('creator')
export class CreatorController {
  constructor(private prisma: PrismaService) {}

  @Get('server-status')
  async getServerStatus() {
    const last = await this.prisma.serverStatus.findFirst({ orderBy: { id: 'desc' } });
    return last || { uptime: 0, onlineUsers: 0, message: 'No data yet' };
  }

  @Patch('server-status')
  async updateServerStatus(@Body() body: { uptime?: number; onlineUsers?: number; message?: string }) {
    return this.prisma.serverStatus.create({ data: { uptime: body.uptime ?? 0, onlineUsers: body.onlineUsers ?? 0, message: body.message } });
  }

  @Patch('users/:id/promote')
  async promote(@Param('id') id: string) {
    return this.prisma.user.update({ where: { id: +id }, data: { role: 'admin' } });
  }

  @Patch('users/:id/demote')
  async demote(@Param('id') id: string) {
    return this.prisma.user.update({ where: { id: +id }, data: { role: 'user' } });
  }
}
