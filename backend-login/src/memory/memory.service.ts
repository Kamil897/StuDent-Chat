import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MemoryService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMemory(userId: number, key: string, value: any) {
    return this.prisma.userMemory.upsert({
      where: { userId_key: { userId, key } },
      create: { userId, key, value },
      update: { value },
    });
  }

  async getMemory(userId: number, key?: string) {
    if (key) return this.prisma.userMemory.findUnique({ where: { userId_key: { userId, key } } });
    return this.prisma.userMemory.findMany({ where: { userId } });
  }
}


