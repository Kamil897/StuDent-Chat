import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(fromUserId: number, toUserId: number, content: string) {
    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot send message to yourself');
    }

    // Проверяем, существует ли получатель
    const recipient = await this.prisma.user.findUnique({
      where: { id: toUserId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Проверяем, друзья ли они
    const friendship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { userId: fromUserId, friendId: toUserId, status: 'accepted' },
          { userId: toUserId, friendId: fromUserId, status: 'accepted' },
        ],
      },
    });

    if (!friendship) {
      throw new BadRequestException('Can only send messages to friends');
    }

    return this.prisma.message.create({
      data: {
        fromUserId,
        toUserId,
        content,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getConversation(userId: number, friendId: number) {
    // Проверяем, друзья ли они
    const friendship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { userId, friendId, status: 'accepted' },
          { userId: friendId, friendId: userId, status: 'accepted' },
        ],
      },
    });

    if (!friendship) {
      throw new BadRequestException('Can only view messages with friends');
    }

    return this.prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: userId, toUserId: friendId },
          { fromUserId: friendId, toUserId: userId },
        ],
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markAsRead(userId: number, messageId: number) {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        toUserId: userId,
        read: false,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found or already read');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.message.count({
      where: {
        toUserId: userId,
        read: false,
      },
    });
  }

  async getRecentConversations(userId: number) {
    // Получаем последние сообщения для каждого друга
    const conversations = await this.prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId },
        ],
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Группируем по собеседнику и берем последнее сообщение
    const conversationMap = new Map();
    conversations.forEach(message => {
      const otherUserId = message.fromUserId === userId ? message.toUserId : message.fromUserId;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          friendId: otherUserId,
          friendName: message.fromUserId === userId ? message.toUser.name : message.fromUser.name,
          friendAvatar: message.fromUserId === userId ? message.toUser.avatar : message.fromUser.avatar,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: 0,
        });
      }
    });

    // Подсчитываем непрочитанные сообщения
    const unreadMessages = await this.prisma.message.findMany({
      where: {
        toUserId: userId,
        read: false,
      },
    });

    unreadMessages.forEach(message => {
      const conversation = conversationMap.get(message.fromUserId);
      if (conversation) {
        conversation.unreadCount++;
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }
}




