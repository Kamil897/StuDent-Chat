import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async saveGameProgress(userId: number, gameName: string, data: {
    score: number;
    level?: number;
    timeSpent?: number;
    completed?: boolean;
  }) {
    return this.prisma.gameProgress.upsert({
      where: { userId_gameName: { userId, gameName } },
      update: {
        score: Math.max(data.score, 0),
        level: data.level || 1,
        timeSpent: data.timeSpent || 0,
        completed: data.completed || false,
        updatedAt: new Date(),
      },
      create: {
        userId,
        gameName,
        score: Math.max(data.score, 0),
        level: data.level || 1,
        timeSpent: data.timeSpent || 0,
        completed: data.completed || false,
      },
    });
  }

  async getGameProgress(userId: number, gameName?: string) {
    if (gameName) {
      return this.prisma.gameProgress.findUnique({
        where: { userId_gameName: { userId, gameName } },
      });
    }
    return this.prisma.gameProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateLeaderboard(userId: number, gameName: string, score: number) {
    const leaderboard = await this.prisma.leaderboard.upsert({
      where: { userId_gameName: { userId, gameName } },
      update: { score: Math.max(score, 0) },
      create: { userId, gameName, score: Math.max(score, 0) },
    });

    await this.recalculateRanks(gameName);
    return leaderboard;
  }

  async getLeaderboard(gameName: string, limit: number = 10) {
    return this.prisma.leaderboard.findMany({
      where: { gameName },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async getUserRank(userId: number, gameName: string) {
    const userScore = await this.prisma.leaderboard.findUnique({
      where: { userId_gameName: { userId, gameName } },
    });

    if (!userScore) return null;

    const rank = await this.prisma.leaderboard.count({
      where: { gameName, score: { gt: userScore.score } },
    });

    return rank + 1;
  }

  private async recalculateRanks(gameName: string) {
    const scores = await this.prisma.leaderboard.findMany({
      where: { gameName },
      orderBy: { score: 'desc' },
    });

    for (let i = 0; i < scores.length; i++) {
      await this.prisma.leaderboard.update({
        where: { id: scores[i].id },
        data: { rank: i + 1 },
      });
    }
  }

  async awardTitle(userId: number, titleName: string) {
    return this.prisma.userTitle.create({
      data: { userId, titleName },
    });
  }

  async awardTitleIfMissing(userId: number, titleName: string) {
    const existing = await this.prisma.userTitle.findFirst({
      where: { userId, titleName },
    });

    if (existing) {
      return { awarded: false, title: existing };
    }

    const title = await this.prisma.userTitle.create({
      data: { userId, titleName },
    });

    return { awarded: true, title };
  }

  async getUserTitles(userId: number) {
    return this.prisma.userTitle.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async checkAndAwardTitles(userId: number) {
    const progress = await this.prisma.gameProgress.findMany({ where: { userId } });
    const titles: string[] = [];

    for (const game of progress) {
      switch (game.gameName) {
        case 'snake':
          if (game.score >= 1000 && !titles.includes('Snake Master')) {
            await this.awardTitleIfMissing(userId, 'Snake Master');
            titles.push('Snake Master');
          }
          break;
        case 'mathbattle':
          if (game.score >= 500 && !titles.includes('Math Genius')) {
            await this.awardTitleIfMissing(userId, 'Math Genius');
            titles.push('Math Genius');
          }
          break;
        case 'asteroids':
          if (game.score >= 2000 && !titles.includes('Asteroid Hunter')) {
            await this.awardTitleIfMissing(userId, 'Asteroid Hunter');
            titles.push('Asteroid Hunter');
          }
          break;
        case 'tictactoe':
          if (game.completed && !titles.includes('Tic Tac Toe Champion')) {
            await this.awardTitleIfMissing(userId, 'Tic Tac Toe Champion');
            titles.push('Tic Tac Toe Champion');
          }
          break;
        case 'pingpong':
          if (game.score >= 1500 && !titles.includes('Ping Pong Pro')) {
            await this.awardTitleIfMissing(userId, 'Ping Pong Pro');
            titles.push('Ping Pong Pro');
          }
          break;
        case 'tir':
          if (game.score >= 800 && !titles.includes('Sharp Shooter')) {
            await this.awardTitleIfMissing(userId, 'Sharp Shooter');
            titles.push('Sharp Shooter');
          }
          break;
        case 'knowledgemaze':
          if (game.completed && !titles.includes('Knowledge Seeker')) {
            await this.awardTitleIfMissing(userId, 'Knowledge Seeker');
            titles.push('Knowledge Seeker');
          }
          break;
        case 'don':
          if (game.score >= 300 && !titles.includes('Don Master')) {
            await this.awardTitleIfMissing(userId, 'Don Master');
            titles.push('Don Master');
          }
          break;
      }
    }

    const totalGames = progress.length;
    if (totalGames >= 5 && !titles.includes('Game Collector')) {
      await this.awardTitleIfMissing(userId, 'Game Collector');
      titles.push('Game Collector');
    }

    const totalScore = progress.reduce((sum, game) => sum + game.score, 0);
    if (totalScore >= 10000 && !titles.includes('High Scorer')) {
      await this.awardTitleIfMissing(userId, 'High Scorer');
      titles.push('High Scorer');
    }

    return titles;
  }
}
