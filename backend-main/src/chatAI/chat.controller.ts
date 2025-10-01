import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('message')
  async handleMessage(@Body('message') message: string) {
    const response = await this.chatService.handleMessage(message);
    return { response };
  }
}
