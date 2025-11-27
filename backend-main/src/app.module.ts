import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { GroupModule } from './group/group.module';
// import { TeacherReviewModule } from './teacher_review/teacher_review.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AttendanceModule } from './attendance/attendance.module';
// import { ParentAndPreschoolerModule } from './parent_and_presschooler/parent_and_presschooler.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
// import { AppController } from './app.controller';
import { ShopModule } from './shop/shop.module';
import { IeltsModule } from './ielts/ielts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    GroupModule,
    NotificationsModule,
    AttendanceModule,
    GameModule,
    ChatModule,
    AiModule,
    AuthModule,
    ShopModule,
    IeltsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
