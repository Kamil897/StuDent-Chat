import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('memory')
@UseGuards(JwtAuthGuard)
export class MemoryController {
  constructor(private readonly memory: MemoryService) {}

  @Post('save')
  async save(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { key: string; value: any },
  ) {
    return this.memory.saveMemory(req.user.id, body.key, body.value);
  }

  @Get()
  async get(
    @Req() req: Request & { user: { id: number } },
    @Query('key') key?: string,
  ) {
    return this.memory.getMemory(req.user.id, key || undefined);
  }
}


