import { Controller, Get, Param, Patch, UseGuards, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';


@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private users: UsersService) {}


  // --- старые эндпоинты для админов ---
  @Get()
  @Roles('admin', 'creator')
  findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  @Roles('admin', 'creator')
  findOne(@Param('id') id: string) {
    return this.users.findOne(+id);
  }

  @Patch(':id/ban')
  @Roles('admin', 'creator')
  ban(@Param('id') id: string) {
    return this.users.ban(+id);
  }

  @Patch(':id/unban')
  @Roles('admin', 'creator')
  unban(@Param('id') id: string) {
    return this.users.unban(+id);
  }
}
