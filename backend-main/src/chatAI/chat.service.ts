import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  [x: string]: any;
  constructor(private prisma: PrismaService) {}

  async getMessagesForUser(userId: number) {
    return this.prisma.aiMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
