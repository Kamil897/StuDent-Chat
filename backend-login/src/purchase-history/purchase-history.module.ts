import { Module } from '@nestjs/common';
import { PurchaseHistoryController } from './purchase-history.controller';
import { PurchaseHistoryService } from './purchase-history.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PurchaseHistoryController],
  providers: [PurchaseHistoryService, PrismaService],
  exports: [PurchaseHistoryService],
})
export class PurchaseHistoryModule {}

