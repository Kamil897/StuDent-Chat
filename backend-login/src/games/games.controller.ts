import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface JwtUser {
  id: number;
  email?: string;
  name?: string;
  avatar?: string | null;
  role?: string;
}

type AuthedRequest = Request & { user: JwtUser };

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  private getUserIdOrThrow(req: AuthedRequest) {
    const id = req.user?.id;
    if (!id) throw new UnauthorizedException('User not found in request');
    return id;
  }

  @Post('progress')
  async saveProgress(
    @Req() req: AuthedRequest,
    @Body()
    body: {
      gameName: string;
      score: number;
      level?: number;
      timeSpent?: number;
      completed?: boolean;
    },
  ) {
    const userId = this.getUserIdOrThrow(req);

    const progress = await this.gamesService.saveGameProgress(
      userId,
      body.gameName,
      {
        score: body.score ?? 0,
        level: body.level ?? 1,
        timeSpent: body.timeSpent ?? 0,
        completed: body.completed ?? false,
      },
    );

    await this.gamesService.updateLeaderboard(
      userId,
      body.gameName,
      body.score ?? 0,
    );

    const newTitles = await this.gamesService.checkAndAwardTitles(userId);

    return { progress, newTitles };
  }

  @Post('award-title')
  async awardTitle(
    @Req() req: AuthedRequest,
    @Body() body: { titleName: string },
  ) {
    const userId = this.getUserIdOrThrow(req);
    const result = await this.gamesService.awardTitleIfMissing(
      userId,
      body.titleName,
    );
    return { awarded: result.awarded, title: result.title };
  }

  @Get('progress')
  async getAllProgress(@Req() req: AuthedRequest) {
    const userId = this.getUserIdOrThrow(req);
    return this.gamesService.getGameProgress(userId);
  }

  @Get('progress/:gameName')
  async getProgress(@Req() req: AuthedRequest, @Param('gameName') gameName: string) {
    const userId = this.getUserIdOrThrow(req);
    return this.gamesService.getGameProgress(userId, gameName);
  }

  @Get('leaderboard/:gameName')
  async getLeaderboard(@Param('gameName') gameName: string, @Query('limit') limit?: number) {
    return this.gamesService.getLeaderboard(gameName, Number(limit) || 10);
  }

  @Get('leaderboard/:gameName/rank')
  async getUserRank(@Req() req: AuthedRequest, @Param('gameName') gameName: string) {
    const userId = this.getUserIdOrThrow(req);
    return this.gamesService.getUserRank(userId, gameName);
  }

  @Get('titles')
  async getUserTitles(@Req() req: AuthedRequest) {
    const userId = this.getUserIdOrThrow(req);
    return this.gamesService.getUserTitles(userId);
  }

  @Get('stats')
  async getUserStats(@Req() req: AuthedRequest) {
    const userId = this.getUserIdOrThrow(req);

    const progress = await this.gamesService.getGameProgress(userId);
    const titles = await this.gamesService.getUserTitles(userId);

    const progressArray = Array.isArray(progress) ? progress : [];
    const totalScore = progressArray.reduce((s: number, g: any) => s + (g.score || 0), 0);
    const totalTime = progressArray.reduce((s: number, g: any) => s + (g.timeSpent || 0), 0);
    const completedGames = progressArray.filter((g: any) => g.completed).length;

    return {
      totalGames: progressArray.length,
      totalScore,
      totalTime,
      completedGames,
      titles: titles.length,
      averageScore: progressArray.length > 0 ? Math.round(totalScore / progressArray.length) : 0,
    };
  }
}
