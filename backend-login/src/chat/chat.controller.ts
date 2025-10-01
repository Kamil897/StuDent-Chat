import { Controller, Get, Post, Delete, Body, Req, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { Request } from 'express';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('list')
  async getChats(@Req() req: Request & { user: { id: number } }) {
    return this.chatService.getChats(req.user.id);
  }

  @Post('new')
  async createChat(@Req() req: Request & { user: { id: number } }, @Body('title') title: string) {
    return this.chatService.createChat(req.user.id, title);
  }

  @Get(':id')
  async getChat(@Req() req: Request & { user: { id: number } }, @Param('id') id: number) {
    return this.chatService.getChat(req.user.id, Number(id));
  }

  @Post(':id/message')
  async addMessage(
    @Req() req: Request & { user: { id: number } },
    @Param('id') id: number,
    @Body() body: { role: 'user' | 'assistant'; content: string },
  ) {
    return this.chatService.addMessage(req.user.id, Number(id), body.role, body.content);
  }

  @Delete(':id')
  async clearChat(@Req() req: Request & { user: { id: number } }, @Param('id') id: number) {
    return this.chatService.clearChat(req.user.id, Number(id));
  }
}
