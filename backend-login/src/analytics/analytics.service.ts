import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopGames(limit: number = 10) {
    // Получаем топ игр по количеству игроков
    const gameStats = await this.prisma.gameProgress.groupBy({
      by: ['gameName'],
      _count: {
        userId: true,
      },
      _avg: {
        score: true,
      },
      _sum: {
        timeSpent: true,
      },
    });

    return gameStats
      .map(game => ({
        gameName: game.gameName,
        playersCount: game._count.userId,
        averageScore: Math.round(game._avg.score || 0),
        totalTimeSpent: game._sum.timeSpent || 0,
      }))
      .sort((a, b) => b.playersCount - a.playersCount)
      .slice(0, limit);
  }

  async getActiveUsers(days: number = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    // Пользователи, которые играли в последние N дней
    const activeUsers = await this.prisma.gameProgress.count({
      where: {
        updatedAt: {
          gte: date,
        },
      },
    });

    // Общее количество пользователей
    const totalUsers = await this.prisma.user.count();

    // Пользователи, зарегистрированные в последние N дней
    const newUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: date,
        },
      },
    });

    return {
      activeUsers,
      totalUsers,
      newUsers,
      activityRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
    };
  }

  async getSalesStats(days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    // Статистика покупок
    const purchases = await this.prisma.purchaseHistory.findMany({
      where: {
        purchaseAt: {
          gte: date,
        },
      },
    });

    const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
    const totalTransactions = purchases.length;

    // Статистика по валютам
    const currencyStats = purchases.reduce((acc, purchase) => {
      const currency = purchase.currency;
      if (!acc[currency]) {
        acc[currency] = { count: 0, total: 0 };
      }
      acc[currency].count++;
      acc[currency].total += purchase.totalCost;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Статистика по источникам
    const sourceStats = purchases.reduce((acc, purchase) => {
      const source = purchase.source;
      if (!acc[source]) {
        acc[source] = { count: 0, total: 0 };
      }
      acc[source].count++;
      acc[source].total += purchase.totalCost;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Ежедневная статистика
    const dailyStats = await this.prisma.purchaseHistory.groupBy({
      by: ['purchaseAt'],
      _sum: {
        totalCost: true,
      },
      _count: {
        id: true,
      },
      where: {
        purchaseAt: {
          gte: date,
        },
      },
    });

    return {
      totalRevenue,
      totalTransactions,
      averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      currencyStats,
      sourceStats,
      dailyStats: dailyStats.map(day => ({
        date: day.purchaseAt,
        revenue: day._sum.totalCost || 0,
        transactions: day._count.id,
      })),
    };
  }

  async getGameAnalytics(gameName: string) {
    const gameProgress = await this.prisma.gameProgress.findMany({
      where: { gameName },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (gameProgress.length === 0) {
      return {
        gameName,
        totalPlayers: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        topPlayers: [],
        completionRate: 0,
      };
    }

    const totalPlayers = gameProgress.length;
    const averageScore = Math.round(
      gameProgress.reduce((sum, progress) => sum + progress.score, 0) / totalPlayers
    );
    const totalTimeSpent = gameProgress.reduce((sum, progress) => sum + progress.timeSpent, 0);
    const completedGames = gameProgress.filter(progress => progress.completed).length;
    const completionRate = Math.round((completedGames / totalPlayers) * 100);

    // Топ игроков
    const topPlayers = gameProgress
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((progress, index) => ({
        rank: index + 1,
        userId: progress.user.id,
        userName: progress.user.name,
        score: progress.score,
        level: progress.level,
        timeSpent: progress.timeSpent,
        completed: progress.completed,
      }));

    return {
      gameName,
      totalPlayers,
      averageScore,
      totalTimeSpent,
      completionRate,
      topPlayers,
    };
  }

  async getUserAnalytics(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        gameProgress: true,
        leaderboards: true,
        userTitles: true,
        purchases: true,
        walletTransactions: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const totalGamesPlayed = user.gameProgress.length;
    const totalScore = user.gameProgress.reduce((sum, progress) => sum + progress.score, 0);
    const totalTimeSpent = user.gameProgress.reduce((sum, progress) => sum + progress.timeSpent, 0);
    const completedGames = user.gameProgress.filter(progress => progress.completed).length;
    const totalPurchases = user.purchases.length;
    const totalSpent = user.purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);

    // Любимая игра
    const gameStats = user.gameProgress.reduce((acc, progress) => {
      if (!acc[progress.gameName]) {
        acc[progress.gameName] = { timeSpent: 0, gamesPlayed: 0, bestScore: 0 };
      }
      acc[progress.gameName].timeSpent += progress.timeSpent;
      acc[progress.gameName].gamesPlayed += 1;
      acc[progress.gameName].bestScore = Math.max(acc[progress.gameName].bestScore, progress.score);
      return acc;
    }, {} as Record<string, { timeSpent: number; gamesPlayed: number; bestScore: number }>);

    const favoriteGame = Object.entries(gameStats).sort((a, b) => b[1].timeSpent - a[1].timeSpent)[0];

    return {
      userId: user.id,
      userName: user.name,
      totalGamesPlayed,
      totalScore,
      totalTimeSpent,
      completedGames,
      completionRate: totalGamesPlayed > 0 ? Math.round((completedGames / totalGamesPlayed) * 100) : 0,
      totalPurchases,
      totalSpent,
      averageSpent: totalPurchases > 0 ? totalSpent / totalPurchases : 0,
      titlesCount: user.userTitles.length,
      favoriteGame: favoriteGame ? {
        name: favoriteGame[0],
        timeSpent: favoriteGame[1].timeSpent,
        gamesPlayed: favoriteGame[1].gamesPlayed,
        bestScore: favoriteGame[1].bestScore,
      } : null,
      balance: {
        coins: user.coins,
        crystals: user.crystals,
        karmaPoints: user.karmaPoints,
      },
    };
  }
}
