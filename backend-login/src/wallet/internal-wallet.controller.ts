import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet/internal')
export class InternalWalletController {
  constructor(private readonly walletService: WalletService) {}

  private validateSecret(secret?: string) {
    const expected = process.env.INTERNAL_SECRET || 'dev-internal-secret';
    if (!secret || secret !== expected) {
      throw new BadRequestException('Invalid internal secret');
    }
  }

  @Post('credit')
  async credit(
    @Headers('x-internal-secret') secret: string,
    @Body() body: { userId: number; amount: number; currency?: 'coins' | 'crystals' | 'points'; source?: string }
  ) {
    this.validateSecret(secret);
    const currency = body.currency || 'coins';
    if (currency === 'coins') {
      return this.walletService.addCoins(body.userId, body.amount, body.source || 'internal_credit');
    }
    if (currency === 'crystals') {
      return this.walletService.addCrystals(body.userId, body.amount, body.source || 'internal_credit');
    }
    // points
    return (this.walletService as any).addKarma(body.userId, body.amount, body.source || 'internal_credit');
  }

  @Post('debit')
  async debit(
    @Headers('x-internal-secret') secret: string,
    @Body() body: { userId: number; amount: number; currency?: 'coins' | 'crystals' | 'points'; source?: string }
  ) {
    this.validateSecret(secret);
    const currency = body.currency || 'coins';
    if (currency === 'coins') {
      return this.walletService.spendCoins(body.userId, body.amount, body.source || 'internal_debit');
    }
    if (currency === 'crystals') {
      return this.walletService.spendCrystals(body.userId, body.amount, body.source || 'internal_debit');
    }
    // points
    return (this.walletService as any).spendKarma(body.userId, body.amount, body.source || 'internal_debit');
  }
}


