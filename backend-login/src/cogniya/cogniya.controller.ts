import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('cogniya')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CogniyaController {
  constructor(private prisma: PrismaService) {}

  @Get('profiles')
  @Roles('admin', 'creator')
  async list() {
    return this.prisma.cogniyaProfile.findMany({ include: { user: { select: { id: true, email: true, name: true } } } });
  }

  @Get('profiles/:userId')
  @Roles('admin', 'creator')
  async get(@Param('userId') userId: string) {
    return this.prisma.cogniyaProfile.findFirst({ where: { userId: +userId } });
  }

  @Post('profiles/:userId')
  @Roles('admin', 'creator')
  async upsert(@Param('userId') userId: string, @Body() body: { hobbies?: string; interests?: string; bio?: string }) {
    const existing = await this.prisma.cogniyaProfile.findFirst({ where: { userId: +userId } });
    if (existing) {
      return this.prisma.cogniyaProfile.update({ where: { id: existing.id }, data: body });
    }
    return this.prisma.cogniyaProfile.create({ data: { userId: +userId, ...body } });
  }
}
