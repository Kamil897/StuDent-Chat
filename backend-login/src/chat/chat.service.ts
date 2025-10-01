import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getChats(userId: number) {
    return this.prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, createdAt: true },
    });
  }

  async createChat(userId: number, title?: string) {
    return this.prisma.chat.create({
      data: { userId, title: title || 'Новый чат' },
    });
  }

  async getChat(userId: number, chatId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.userId !== userId) throw new ForbiddenException();
    return chat;
  }

  async addMessage(
    userId: number,
    chatId: number,
    role: 'user' | 'assistant',
    content: string,
  ) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.userId !== userId) throw new ForbiddenException();

    if (!content || !role) throw new Error('role and content are required');

    return this.prisma.chatMessage.create({
      data: { chatId, role, content },
    });
  }

  async clearChat(userId: number, chatId: number) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.userId !== userId) throw new ForbiddenException();

    await this.prisma.chatMessage.deleteMany({ where: { chatId } });
    return { success: true };
  }
}
