import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  async sendMessage(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { toUserId: number; content: string }
  ) {
    return this.messagesService.sendMessage(req.user.id, body.toUserId, body.content);
  }

  @Get(':friendId')
  async getConversation(
    @Req() req: Request & { user: { id: number } },
    @Param('friendId') friendId: string
  ) {
    return this.messagesService.getConversation(req.user.id, Number(friendId));
  }

  @Post(':id/read')
  async markAsRead(
    @Req() req: Request & { user: { id: number } },
    @Param('id') id: string
  ) {
    return this.messagesService.markAsRead(req.user.id, Number(id));
  }

  @Get('unread/count')
  async getUnreadCount(@Req() req: Request & { user: { id: number } }) {
    return this.messagesService.getUnreadCount(req.user.id);
  }

  @Get('conversations/recent')
  async getRecentConversations(@Req() req: Request & { user: { id: number } }) {
    return this.messagesService.getRecentConversations(req.user.id);
  }
}




