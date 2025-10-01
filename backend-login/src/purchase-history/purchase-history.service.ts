import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchaseHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async recordPurchase(data: {
    userId: number;
    productName: string;
    amount: number;
    currency?: string;
    quantity?: number;
    totalCost: number;
    source?: string;
  }) {
    return this.prisma.purchaseHistory.create({
      data: {
        userId: data.userId,
        productName: data.productName,
        amount: data.amount,
        currency: data.currency || 'points',
        quantity: data.quantity || 1,
        totalCost: data.totalCost,
        source: data.source || 'shop',
      },
    });
  }

  async getUserPurchases(userId: number) {
    return this.prisma.purchaseHistory.findMany({
      where: { userId },
      orderBy: { purchaseAt: 'desc' },
    });
  }

  async getPurchaseStats(userId: number) {
    const purchases = await this.prisma.purchaseHistory.findMany({
      where: { userId },
    });

    const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
    const totalItems = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    const uniqueProducts = new Set(purchases.map(p => p.productName)).size;

    return {
      totalPurchases: purchases.length,
      totalSpent,
      totalItems,
      uniqueProducts,
      averagePurchase: purchases.length > 0 ? totalSpent / purchases.length : 0,
    };
  }
}

