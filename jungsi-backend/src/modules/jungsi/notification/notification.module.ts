import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import {
  UserNotificationSettingsEntity,
  UserNotificationTypeEntity,
  NotificationLogEntity,
} from '../../../database/entities/notification';
import { CommonModule } from '../../../common/common.module';
import { FcmService } from './services/fcm.service';
import { EmailService } from './services/email.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';

@Module({
  imports: [
    CommonModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      UserNotificationSettingsEntity,
      UserNotificationTypeEntity,
      NotificationLogEntity,
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, FcmService, EmailService, NotificationSchedulerService],
  exports: [NotificationService, FcmService, EmailService, NotificationSchedulerService],
})
export class NotificationModule {}
