import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany();
    if (plans.length === 0) {
      // seed defaults
      await this.prisma.subscriptionPlan.createMany({
        data: [
          { code: 'free', name: 'Free', dailyLimit: 50, priceCents: 0 },
          { code: 'pro', name: 'Pro', dailyLimit: 500, priceCents: 990 },
          { code: 'premium', name: 'Premium', dailyLimit: 5000, priceCents: 1990 },
        ],
        skipDuplicates: true,
      });
      return this.prisma.subscriptionPlan.findMany();
    }
    return plans;
  }

  async subscribe(userId: number, planCode: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { code: planCode } });
    if (!plan) throw new ForbiddenException('Unknown plan');

    const now = new Date();
    const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const existing = await this.prisma.userSubscription.findFirst({ where: { userId } });
    if (existing) {
      return this.prisma.userSubscription.update({
        where: { id: existing.id },
        data: { planId: plan.id, status: 'active', currentPeriodStart: now, currentPeriodEnd: end },
      });
    }
    return this.prisma.userSubscription.create({
      data: { userId, planId: plan.id, status: 'active', currentPeriodStart: now, currentPeriodEnd: end },
    });
  }

  async getUserPlan(userId: number) {
    const sub = await this.prisma.userSubscription.findFirst({ where: { userId }, include: { plan: true } });
    if (sub && sub.status === 'active' && sub.currentPeriodEnd > new Date()) return sub.plan;
    // default to free
    const free = await this.prisma.subscriptionPlan.findUnique({ where: { code: 'free' } });
    return free ?? { code: 'free', name: 'Free', dailyLimit: 50, id: 0, priceCents: 0, currency: 'usd' } as any;
  }

  private startOfUtcDay(date = new Date()) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  async checkUserLimit(userId: number) {
    const plan = await this.getUserPlan(userId);
    const day = this.startOfUtcDay();
    const usage = await this.prisma.usageCounter.upsert({
      where: { userId_date: { userId, date: day } },
      create: { userId, date: day, aiRequests: 0 },
      update: {},
    });
    if (usage.aiRequests >= plan.dailyLimit) {
      throw new ForbiddenException('Daily AI request limit reached');
    }
    return { plan, usage };
  }

  async incrementUsage(userId: number) {
    const day = this.startOfUtcDay();
    return this.prisma.usageCounter.update({
      where: { userId_date: { userId, date: day } },
      data: { aiRequests: { increment: 1 } },
    });
  }
}


