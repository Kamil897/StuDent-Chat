import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ orderBy: { id: 'asc' } });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  ban(id: number) {
    return this.prisma.user.update({ where: { id }, data: { status: 'banned' } });
  }

  unban(id: number) {
    return this.prisma.user.update({ where: { id }, data: { status: 'active' } });
  }

  promoteToAdmin(id: number) {
    return this.prisma.user.update({ where: { id }, data: { role: 'admin' } });
  }

  demoteToUser(id: number) {
    return this.prisma.user.update({ where: { id }, data: { role: 'user' } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        avatar: true,
        role: true,
        karmaPoints: true,      // ✅ добавляем баланс
      },
    });
  }
  

  async updatePoints(userId: number, points: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        karmaPoints: {
          increment: points, // добавить очки к текущему значению
        },
      },
    });
  }
}
