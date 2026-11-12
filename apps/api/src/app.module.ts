import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PeriodsModule } from './modules/periods/periods.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { OutlinesModule } from './modules/outlines/outlines.module';
import { AcceptanceModule } from './modules/acceptance/acceptance.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ScheduleModule } from './modules/schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PeriodsModule,
    ProjectsModule,
    OutlinesModule,
    AcceptanceModule,
    BudgetsModule,
    NotificationsModule,
    ScheduleModule,
  ],
})
export class AppModule {}

