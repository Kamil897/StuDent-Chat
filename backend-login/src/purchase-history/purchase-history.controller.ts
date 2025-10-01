import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PurchaseHistoryService } from './purchase-history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('purchase-history')
@UseGuards(JwtAuthGuard)
export class PurchaseHistoryController {
  constructor(private readonly purchaseHistoryService: PurchaseHistoryService) {}

  @Post('record')
  async recordPurchase(
    @Req() req: Request & { user: { id: number } },
    @Body() body: {
      productName: string;
      amount: number;
      currency?: string;
      quantity?: number;
      totalCost: number;
      source?: string;
    }
  ) {
    return this.purchaseHistoryService.recordPurchase({
      userId: req.user.id,
      ...body,
    });
  }

  @Get('purchases')
  async getUserPurchases(@Req() req: Request & { user: { id: number } }) {
    return this.purchaseHistoryService.getUserPurchases(req.user.id);
  }

  @Get('stats')
  async getPurchaseStats(@Req() req: Request & { user: { id: number } }) {
    return this.purchaseHistoryService.getPurchaseStats(req.user.id);
  }
}

