import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async getFriends(userId: number) {
    const friendships = await this.prisma.friend.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        friend: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return friendships.map((f) => {
      const other = f.userId === userId ? f.friend : f.user;
      return {
        friendshipId: f.id,
        id: other?.id,
        name: other?.name,
        email: other?.email,
        avatar: other?.avatar,
        createdAt: f.createdAt,
      };
    });
  }

  async addFriend(userId: number, friendId: number) {
    if (userId === friendId) {
      throw new Error('Cannot add yourself as a friend');
    }

    const existing = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        friend: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (existing) {
      if (existing.status === 'PENDING' && existing.userId === friendId) {
        const accepted = await this.prisma.friend.update({
          where: { id: existing.id },
          data: { status: 'ACCEPTED' },
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
            friend: { select: { id: true, name: true, email: true, avatar: true } },
          },
        });

        return {
          friendshipId: accepted.id,
          status: accepted.status,
          fromUser: accepted.user,
          toUser: accepted.friend,
          createdAt: accepted.createdAt,
        };
      }

      return {
        friendshipId: existing.id,
        status: existing.status,
        fromUser: existing.user,
        toUser: existing.friend,
        createdAt: existing.createdAt,
      };
    }

    const request = await this.prisma.friend.create({
      data: { userId, friendId, status: 'PENDING' },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        friend: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return {
      friendshipId: request.id,
      status: request.status,
      fromUser: request.user,
      toUser: request.friend,
      createdAt: request.createdAt,
    };
  }

  async removeFriend(userId: number, friendId: number) {
    return this.prisma.friend.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
  }

  async acceptFriendRequest(userId: number, friendId: number) {
    return this.prisma.friend.updateMany({
      where: { userId: friendId, friendId: userId, status: 'PENDING' },
      data: { status: 'ACCEPTED' },
    });
  }

  async getPendingRequests(userId: number) {
    const requests = await this.prisma.friend.findMany({
      where: { friendId: userId, status: 'PENDING' },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return requests.map((r) => ({
      id: r.id,
      user: r.user,
      createdAt: r.createdAt,
    }));
  }

  async blockUser(userId: number, friendId: number) {
    return this.prisma.friend.updateMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
      data: { status: 'BLOCKED' },
    });
  }
}
