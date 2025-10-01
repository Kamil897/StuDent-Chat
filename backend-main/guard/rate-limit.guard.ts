import {
    CanActivate,
    ExecutionContext,
    Injectable,
    BadRequestException,
  } from '@nestjs/common';
  import { RateLimiterMemory } from 'rate-limiter-flexible';
  
  const limiter = new RateLimiterMemory({
    points: 10, // 10 запросов
    duration: 60, // в течение 60 секунд
  });
  
  @Injectable()
  export class RateLimitGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();
      const userId = req.body.userId || 'unknown';
  
      try {
        await limiter.consume(userId);
        return true;
      } catch {
        throw new BadRequestException('Слишком много запросов. Попробуй позже.');
      }
    }
  }
  