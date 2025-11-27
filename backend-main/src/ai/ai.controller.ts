import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AiService } from './ai.service';

type HistoryItemDto = { role: string; text: string };

@Controller('api/ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('ask')
  async ask(
    @Req() req: Request,
    @Body('message') message: string,
    @Body('mode') mode: 'online' | 'offline' = 'offline',
    @Body('history') history?: HistoryItemDto[],
  ) {
    if (!message) {
      return { error: 'Message is required' };
    }

    // Пытаемся вытащить userId из JWT, но не заваливаем запрос, если токена нет/он другой
    let userId = 'defaultUser';
    const auth = req.headers.authorization || req.headers.Authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      try {
        const payload: any = this.jwtService.decode(token);
        if (payload?.sub) {
          userId = String(payload.sub);
        }
      } catch {
        // игнорируем ошибки, останемся на defaultUser
      }
    }

    // приводим клиентскую историю {role, text} к формату {role, content}
    const mappedHistory = Array.isArray(history)
      ? history.map((item) => ({
          role: item.role === 'ai' ? 'assistant' : item.role,
          content: item.text,
        }))
      : undefined;

    const authHeader = typeof auth === 'string' ? auth : undefined;

    return this.aiService.ask(userId, message, mode, mappedHistory, authHeader);
  }
}
