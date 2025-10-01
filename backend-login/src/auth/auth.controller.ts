import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { UsersService } from '../users/users.service'; // 👈 подключаем
import { GetUser } from './decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly usersService: UsersService, // 👈 инжектим UsersService
  ) {}

  @Post('register')
  async registerUser(@Body() body: RegisterDto) {
    const user = await this.auth.register(
      body.email,
      body.password,
      body.firstName,
      'user',
    );
    return { id: user.id, email: user.email, role: user.role };
  }

  @Post('register-admin')
  async registerAdmin(@Body() body: RegisterDto) {
    const user = await this.auth.register(body.email, body.password, body.firstName, 'admin');
    return { id: user.id, email: user.email, role: user.role };
  }

  @Post('register-creator')
  async registerCreator(@Body() body: RegisterDto) {
    const user = await this.auth.register(body.email, body.password, body.firstName, 'creator');
    return { id: user.id, email: user.email, role: user.role };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.auth.validateUser(body.email, body.password);
    return this.auth.login(user);
  }
  @UseGuards(JwtAuthGuard)
@Get('me')
async getMe(@GetUser() user: User) {
  const fullUser = await this.usersService.findById(user.id);

  if (!fullUser) {
    return { message: 'User not found' };
  }

  return {
    id: fullUser.id,
    email: fullUser.email,
    firstName: fullUser.name,   // исправил
    lastName: fullUser.lastName,
    avatar: fullUser.avatar,
    role: fullUser.role,
    karmaPoints: fullUser.karmaPoints,   // ⚡️ добавил
};
}

  
  @UseGuards(JwtAuthGuard)
@Post('add-points')
async addPoints(
  @GetUser() user: User,
  @Body('points') points: number,
) {
  // обновляем баланс пользователя
  const updatedUser = await this.usersService.updatePoints(user.id, points);

  return { 
    id: updatedUser.id,
    karmaPoints: updatedUser.karmaPoints, 
  };
}

}
