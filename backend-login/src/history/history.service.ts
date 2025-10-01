import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: number, examType: string, result: any) {
    const record = await this.prisma.history.create({
      data: {
        userId,
        examType,
        result,
      },
    });
    return { id: record.id, ok: true };
  }
}


