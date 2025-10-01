import { Controller, Post, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('add-score/:userId')
  async addScore(@Param('userId') userId: string) {
    const score = await this.gameService.addWinPoints(Number(userId));
    return { score };
  }

  @Get('score/:userId')
  async getScore(@Param('userId') userId: string) {
    const score = await this.gameService.getUserScore(Number(userId));
    return { score };
  }
}
