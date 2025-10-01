import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  async ask(
    @Body('message') message: string,
    @Body('userId') userId: string = 'defaultUser',
    @Body('style') style: string = 'default',
    @Body('history') history?: any[],
  ) {
    if (!message) {
      return { error: 'Message is required' };
    }

    return this.aiService.ask(userId, message, style, history);
  }
}
