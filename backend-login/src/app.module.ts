import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { CreatorModule } from './creator/creator.module';
import { CogniyaModule } from './cogniya/cogniya.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { PrismaService } from './prisma/prisma.service';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GamesModule } from './games/games.module';
import { PurchaseHistoryModule } from './purchase-history/purchase-history.module';
import { ServerStatusModule } from './server-status/server-status.module';
import { AchievementsModule } from './achievements/achievements.module';
import { FriendsModule } from './friends/friends.module';
import { MessagesModule } from './messages/messages.module';
import { WalletModule } from './wallet/wallet.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { IeltsModule } from './ielts/ielts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    AdminModule,
    CreatorModule,
    CogniyaModule,
    ReportsModule,
    NotificationsModule,
    GamesModule,
    PurchaseHistoryModule,
    ServerStatusModule,
    AchievementsModule,
    FriendsModule,
    MessagesModule,
    WalletModule,
    AnalyticsModule,
    IeltsModule
  ],
  controllers: [ChatController],
  providers: [ChatService, PrismaService],
})
export class AppModule {}
