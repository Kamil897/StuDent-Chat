import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';
import { InternalWalletController } from './internal-wallet.controller';

@Module({
  controllers: [WalletController, InternalWalletController],
  providers: [WalletService, PrismaService],
  exports: [WalletService],
})
export class WalletModule {}

