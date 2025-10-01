import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'creator')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async me() {
    return { panel: 'admin', ok: true };
  }
}
