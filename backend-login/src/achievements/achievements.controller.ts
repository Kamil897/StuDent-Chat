import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  async getAllAchievements() {
    return this.achievementsService.getAllAchievements();
  }

  @Get('by-user/:id')
  async getUserAchievements(@Param('id') id: string) {
    return this.achievementsService.getUserAchievements(Number(id));
  }

  @Get('me')
  async getCurrentUserAchievements(@Req() req: Request & { user: { id: number } }) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Post('unlock')
  async unlockAchievement(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { achievementId: number }
  ) {
    return this.achievementsService.unlockAchievement(req.user.id, body.achievementId);
  }

  @Get('stats')
  async getAchievementStats(@Req() req: Request & { user: { id: number } }) {
    return this.achievementsService.getAchievementStats(req.user.id);
  }

  @Post('check')
  async checkAchievements(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { gameName: string; score: number; level: number; timeSpent: number; completed: boolean }
  ) {
    const gameData = {
      score: body.score,
      gamesPlayed: 1,
      timeSpent: body.timeSpent,
      wins: body.completed ? 1 : 0,
      level: body.level, // исправил с combo → level
    };

    const unlockedAchievements = await this.achievementsService.checkAndUnlockAchievements(
      req.user.id,
      gameData
    );

    return { unlockedAchievements };
  }

  @Get('user')
  async getUserAchievementsForFrontend(@Req() req: Request & { user: { id: number } }) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

}
