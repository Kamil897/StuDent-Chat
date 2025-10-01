import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        coins: true,
        crystals: true,
        karmaPoints: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      coins: user.coins,
      crystals: user.crystals,
      karmaPoints: user.karmaPoints,
    };
  }

  async addCoins(userId: number, amount: number, source: string = 'reward') {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        coins: {
          increment: amount,
        },
      },
    });

    // Записываем транзакцию
    await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: 'deposit',
        amount,
        currency: 'coins',
        source,
      },
    });

    return { coins: user.coins };
  }

  async addCrystals(userId: number, amount: number, source: string = 'reward') {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        crystals: {
          increment: amount,
        },
      },
    });

    // Записываем транзакцию
    await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: 'deposit',
        amount,
        currency: 'crystals',
        source,
      },
    });

    return { crystals: user.crystals };
  }

  async addKarma(userId: number, amount: number, source: string = 'reward') {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        karmaPoints: {
          increment: amount,
        },
      },
    });

    await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: 'deposit',
        amount,
        currency: 'points',
        source,
      },
    });

    return { karmaPoints: user.karmaPoints };
  }

  async spendCoins(userId: number, amount: number, source: string = 'purchase') {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.coins < amount) {
      throw new BadRequestException('Insufficient coins');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        coins: {
          decrement: amount,
        },
      },
    });

    // Записываем транзакцию
    await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: 'withdraw',
        amount,
        currency: 'coins',
        source,
      },
    });

    return { coins: updatedUser.coins };
  }

  async spendCrystals(userId: number, amount: number, source: string = 'purchase') {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.crystals < amount) {
      throw new BadRequestException('Insufficient crystals');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        crystals: {
          decrement: amount,
        },
      },
    });

    // Записываем транзакцию
    await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: 'withdraw',
        amount,
        currency: 'crystals',
        source,
      },
    });

    return { crystals: updatedUser.crystals };
  }

  async spendKarma(userId: number, amount: number, source: string = 'purchase') {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.karmaPoints < amount) {
      throw new BadRequestException('Insufficient points');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        karmaPoints: {
          decrement: amount,
        },
      },
    });

    await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: 'withdraw',
        amount,
        currency: 'points',
        source,
      },
    });

    return { karmaPoints: updatedUser.karmaPoints };
  }

  async transferCurrency(
    fromUserId: number,
    toUserId: number,
    amount: number,
    currency: 'coins' | 'crystals'
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Проверяем, существует ли получатель
    const recipient = await this.prisma.user.findUnique({
      where: { id: toUserId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Проверяем баланс отправителя
    const sender = await this.prisma.user.findUnique({
      where: { id: fromUserId },
    });

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    const senderBalance = currency === 'coins' ? sender.coins : sender.crystals;
    if (senderBalance < amount) {
      throw new BadRequestException(`Insufficient ${currency}`);
    }

    // Выполняем перевод
    await this.prisma.$transaction([
      // Списываем с отправителя
      this.prisma.user.update({
        where: { id: fromUserId },
        data: {
          [currency]: {
            decrement: amount,
          },
        },
      }),
      // Зачисляем получателю
      this.prisma.user.update({
        where: { id: toUserId },
        data: {
          [currency]: {
            increment: amount,
          },
        },
      }),
      // Записываем транзакцию отправителя
      this.prisma.walletTransaction.create({
        data: {
          userId: fromUserId,
          type: 'transfer',
          amount,
          currency,
          source: `transfer_to_${toUserId}`,
        },
      }),
      // Записываем транзакцию получателя
      this.prisma.walletTransaction.create({
        data: {
          userId: toUserId,
          type: 'deposit',
          amount,
          currency,
          source: `transfer_from_${fromUserId}`,
        },
      }),
    ]);

    return { message: 'Transfer completed successfully' };
  }

  async getTransactionHistory(userId: number, limit: number = 50) {
    return this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getTransactionStats(userId: number) {
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { userId },
    });

    const stats = {
      totalDeposits: { coins: 0, crystals: 0 },
      totalWithdrawals: { coins: 0, crystals: 0 },
      totalTransfers: { coins: 0, crystals: 0 },
      transactionCount: transactions.length,
    };

    transactions.forEach(tx => {
      if (tx.type === 'deposit') {
        stats.totalDeposits[tx.currency as 'coins' | 'crystals'] += tx.amount;
      } else if (tx.type === 'withdraw') {
        stats.totalWithdrawals[tx.currency as 'coins' | 'crystals'] += tx.amount;
      } else if (tx.type === 'transfer') {
        stats.totalTransfers[tx.currency as 'coins' | 'crystals'] += tx.amount;
      }
    });

    return stats;
  }
}


