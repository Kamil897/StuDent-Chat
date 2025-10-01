import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type PushPayload = { type: string; title: string; body?: string };

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async push(userId: number, payload: PushPayload) {
    return this.prisma.notification.create({
      data: { userId, ...payload },
    });
  }

  async list(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(userId: number, id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }
}
