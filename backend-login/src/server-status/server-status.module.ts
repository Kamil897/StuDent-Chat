import { Module } from '@nestjs/common';
import { ServerStatusController } from './server-status.controller';
import { ServerStatusService } from './server-status.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ServerStatusController],
  providers: [ServerStatusService, PrismaService],
  exports: [ServerStatusService],
})
export class ServerStatusModule {}
