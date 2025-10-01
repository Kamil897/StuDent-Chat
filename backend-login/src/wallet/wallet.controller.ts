import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Req() req: Request & { user: { id: number } }) {
    return this.walletService.getBalance(req.user.id);
  }

  @Post('transfer')
  async transferCurrency(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { toUserId: number; amount: number; currency: 'coins' | 'crystals' }
  ) {
    return this.walletService.transferCurrency(
      req.user.id,
      body.toUserId,
      body.amount,
      body.currency
    );
  }

  @Post('add')
  async addCurrency(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { amount: number; currency: 'coins' | 'crystals'; source?: string }
  ) {
    if (body.currency === 'coins') {
      return this.walletService.addCoins(req.user.id, body.amount, body.source);
    } else {
      return this.walletService.addCrystals(req.user.id, body.amount, body.source);
    }
  }

  @Post('spend')
  async spendCurrency(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { amount: number; currency: 'coins' | 'crystals'; source?: string }
  ) {
    if (body.currency === 'coins') {
      return this.walletService.spendCoins(req.user.id, body.amount, body.source);
    } else {
      return this.walletService.spendCrystals(req.user.id, body.amount, body.source);
    }
  }

  @Get('transactions')
  async getTransactionHistory(
    @Req() req: Request & { user: { id: number } },
    @Body() body: { limit?: number }
  ) {
    return this.walletService.getTransactionHistory(req.user.id, body.limit);
  }

  @Get('stats')
  async getTransactionStats(@Req() req: Request & { user: { id: number } }) {
    return this.walletService.getTransactionStats(req.user.id);
  }
}




