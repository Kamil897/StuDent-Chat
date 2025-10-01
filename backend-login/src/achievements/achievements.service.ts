import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllAchievements() {
    return this.prisma.achievement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserAchievements(userId: number) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async unlockAchievement(userId: number, achievementId: number) {
    // Проверяем, есть ли уже это достижение у пользователя
    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId },
      },
    });

    if (existing) {
      throw new Error('Achievement already unlocked');
    }

    // Получаем информацию о достижении
    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }

    // Создаем запись о получении достижения
    const userAchievement = await this.prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
      include: {
        achievement: true,
      },
    });

    // Начисляем очки пользователю
    if (achievement.points > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          karmaPoints: {
            increment: achievement.points,
          },
        },
      });
    }

    return userAchievement;
  }

  async checkAndUnlockAchievements(userId: number, gameData: any) {
    const achievements = await this.prisma.achievement.findMany();
    const unlockedAchievements = [];

    for (const achievement of achievements) {
      try {
        const condition = JSON.parse(achievement.condition);
        const shouldUnlock = this.evaluateCondition(condition, gameData);

        if (shouldUnlock) {
          try {
            await this.unlockAchievement(userId, achievement.id);
            unlockedAchievements.push(achievement);
          } catch (error) {
            // Достижение уже получено
          }
        }
      } catch (error) {
        console.error(`Error evaluating achievement ${achievement.id}:`, error);
      }
    }

    return unlockedAchievements;
  }

  private evaluateCondition(condition: any, gameData: any): boolean {
    // Простая система оценки условий
    switch (condition.type) {
      case 'score':
        return gameData.score >= condition.value;
      case 'games_played':
        return gameData.gamesPlayed >= condition.value;
      case 'time_spent':
        return gameData.timeSpent >= condition.value;
      case 'wins':
        return gameData.wins >= condition.value;
      case 'combo':
        return gameData.combo >= condition.value;
      default:
        return false;
    }
  }

  async getAchievementStats(userId: number) {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const totalPoints = userAchievements.reduce(
      (sum, ua) => sum + ua.achievement.points,
      0
    );

    return {
      totalAchievements: userAchievements.length,
      totalPoints,
      recentAchievements: userAchievements
        .slice(0, 5)
        .map(ua => ({
          name: ua.achievement.name,
          icon: ua.achievement.icon,
          earnedAt: ua.earnedAt,
        })),
    };
  }
}

