import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationService } from './moderation.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, PrismaService, ModerationService, NotificationsService],
  exports: [ReportsService],
})
export class ReportsModule {}
