import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { AdminModule } from './src/admin/admin.module';
import { PrismaModule } from './src/prisma/prisma.module';
// import { TeacherModule } from './src/teacher/teacher.module';
// import { EventModule } from './src/event/event.module';
import { GroupModule } from './src/group/group.module';
// import { TeacherReviewModule } from './src/teacher_review/teacher_review.module';
// import { TeacherFeedbackModule } from './src/teacher_feedback/teacher_feedback.module';
// import { ParentsModule } from './src/parents/parents.module';
import { NotificationsModule } from './src/notifications/notifications.module';
import { AttendanceModule } from './src/attendance/attendance.module';
// import { PreschoolerModule } from './src/preschooler/preschooler.module';
// import { GruopPreschoolerModule } from './src/gruop_preschooler/gruop_preschooler.module';
// import { EventRegestrationModule } from './src/event_regestration/event_regestration.module';
// import { AuthModule } from './src/auth/auth.module';
// import { ParentAndPreschoolModule } from './src/parent_and_presschooler/parent_and_presschooler.module';
import { GameModule } from './src/game/game.module';
import { ChatModule } from './src/chat/chat.module';
import { AiModule } from './src/ai/ai.module';
// import { AppController } from './app.controller';
import { ShopModule } from './src/shop/shop.module';
import { PrismaService } from 'src/prisma/prisma.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true
    }),
    PrismaModule,
    GroupModule,
    NotificationsModule,
    AttendanceModule,
    GameModule,
    ChatModule,
    AiModule,
    ShopModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
