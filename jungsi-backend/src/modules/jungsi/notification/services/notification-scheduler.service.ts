import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  UserNotificationSettingsEntity,
  UserNotificationTypeEntity,
  NotificationLogEntity,
  NotificationStatus,
  NotificationTypeCode,
} from '../../../../database/entities/notification';
import { FcmService } from './fcm.service';
import { EmailService } from './email.service';

@Injectable()
export class NotificationSchedulerService {
  constructor(
    @InjectRepository(UserNotificationSettingsEntity)
    private settingsRepository: Repository<UserNotificationSettingsEntity>,
    @InjectRepository(UserNotificationTypeEntity)
    private typeRepository: Repository<UserNotificationTypeEntity>,
    @InjectRepository(NotificationLogEntity)
    private logRepository: Repository<NotificationLogEntity>,
    private fcmService: FcmService,
    private emailService: EmailService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * 매 5분마다 실행: 경쟁률 변동 및 확률 변동 체크
   * TODO: 실제 경쟁률/확률 데이터 연동 필요
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkCompetitionChanges(): Promise<void> {
    this.logger.debug('경쟁률/확률 변동 체크 시작');

    // TODO: 실제 구현 시 다음 로직 추가
    // 1. 모든 활성 사용자의 지원 대학 목록 조회
    // 2. 각 대학의 현재 경쟁률/확률 조회
    // 3. 이전 경쟁률/확률과 비교
    // 4. 임계값 초과 시 알림 대기열에 추가

    // 임시 로그
    this.logger.debug('경쟁률/확률 변동 체크 완료 (구현 대기)');
  }

  /**
   * 매일 오전 9시: 마감 24시간 전 알림
   */
  @Cron('0 9 * * *')
  async checkDeadlines24Hours(): Promise<void> {
    this.logger.info('마감 24시간 전 알림 체크');

    // TODO: 실제 구현 시
    // 1. 24시간 이내 마감 대학 조회
    // 2. 해당 대학 지원자 중 deadline 알림 활성화된 사용자 조회
    // 3. 알림 발송
  }

  /**
   * 매시간: 마감 1시간 전 긴급 알림
   */
  @Cron('0 * * * *')
  async checkDeadlines1Hour(): Promise<void> {
    this.logger.debug('마감 1시간 전 알림 체크');

    // TODO: 실제 구현 시
    // 1. 1시간 이내 마감 대학 조회
    // 2. 긴급 알림 발송
  }

  /**
   * 매일 오후 9시: 일일 요약 이메일 발송
   */
  @Cron('0 21 * * *')
  async sendDailySummary(): Promise<void> {
    this.logger.info('일일 요약 이메일 발송 시작');

    try {
      // daily_summary 알림이 활성화된 사용자 조회
      const subscribedUsers = await this.typeRepository.find({
        where: {
          typeCode: NotificationTypeCode.DAILY_SUMMARY,
          enabled: true,
        },
      });

      if (subscribedUsers.length === 0) {
        this.logger.debug('일일 요약 구독자 없음');
        return;
      }

      const memberIds = subscribedUsers.map((u) => u.memberId);

      // 이메일 설정이 있는 사용자만 필터링
      const settings = await this.settingsRepository.find({
        where: {
          memberId: In(memberIds),
          emailEnabled: true,
        },
      });

      for (const setting of settings) {
        if (!setting.emailAddress) continue;

        // 방해 금지 시간 체크
        if (this.isInQuietHours(setting)) {
          this.logger.debug('방해 금지 시간으로 스킵', { memberId: setting.memberId });
          continue;
        }

        // TODO: 실제 지원 현황 데이터 조회 및 이메일 발송
        // const applications = await this.getApplicationsForMember(setting.memberId);
        // await this.emailService.sendDailySummaryEmail(setting.emailAddress, { ... });

        this.logger.info('일일 요약 이메일 발송 예정', {
          memberId: setting.memberId,
          email: setting.emailAddress,
        });
      }

      this.logger.info('일일 요약 이메일 발송 완료', { count: settings.length });
    } catch (error) {
      this.logger.error('일일 요약 발송 실패', { error: error.message });
    }
  }

  /**
   * 매 분마다 실행: 알림 대기열 처리
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processNotificationQueue(): Promise<void> {
    // 대기 중인 알림 조회 (최대 50개)
    const pendingNotifications = await this.logRepository.find({
      where: {
        status: NotificationStatus.PENDING,
      },
      take: 50,
      order: { createdAt: 'ASC' },
    });

    if (pendingNotifications.length === 0) {
      return;
    }

    this.logger.debug('알림 대기열 처리', { count: pendingNotifications.length });

    for (const notification of pendingNotifications) {
      await this.processNotification(notification);
    }
  }

  /**
   * 개별 알림 처리
   */
  private async processNotification(notification: NotificationLogEntity): Promise<void> {
    try {
      // 사용자 설정 조회
      const settings = await this.settingsRepository.findOne({
        where: { memberId: notification.memberId },
      });

      if (!settings) {
        notification.status = NotificationStatus.FAILED;
        notification.errorMessage = '사용자 설정 없음';
        await this.logRepository.save(notification);
        return;
      }

      // 방해 금지 시간 체크
      if (this.isInQuietHours(settings)) {
        this.logger.debug('방해 금지 시간으로 알림 지연', {
          memberId: notification.memberId,
        });
        return; // 다음 주기에 재시도
      }

      let success = false;
      let errorMessage = '';

      // 채널별 발송
      switch (notification.channel) {
        case 'push':
          if (settings.pushEnabled && settings.pushFcmToken) {
            const result = await this.fcmService.sendToDevice(settings.pushFcmToken, {
              title: notification.title,
              body: notification.content,
              data: notification.metadata as Record<string, string>,
            });
            success = result.success;
            errorMessage = result.error || '';

            // 유효하지 않은 토큰이면 비활성화
            if (result.error === 'invalid_token') {
              settings.pushFcmToken = null;
              settings.pushEnabled = false;
              await this.settingsRepository.save(settings);
            }
          } else {
            errorMessage = '푸시 알림 비활성화 또는 토큰 없음';
          }
          break;

        case 'email':
          if (settings.emailEnabled && settings.emailAddress) {
            const result = await this.emailService.sendEmail({
              to: settings.emailAddress,
              subject: notification.title,
              html: notification.content,
            });
            success = result.success;
            errorMessage = result.error || '';
          } else {
            errorMessage = '이메일 비활성화 또는 주소 없음';
          }
          break;

        case 'kakao':
          // TODO: 카카오 알림톡 연동
          this.logger.debug('카카오 알림톡 발송 (미구현)', {
            memberId: notification.memberId,
          });
          success = false;
          errorMessage = '카카오 알림톡 미구현';
          break;

        case 'sms':
          // TODO: SMS 연동 (기존 SmsService 활용)
          this.logger.debug('SMS 발송 (미구현)', {
            memberId: notification.memberId,
          });
          success = false;
          errorMessage = 'SMS 미구현';
          break;
      }

      // 결과 저장
      if (success) {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
      } else {
        notification.retryCount += 1;
        if (notification.retryCount >= 3) {
          notification.status = NotificationStatus.FAILED;
        }
        notification.errorMessage = errorMessage;
      }

      await this.logRepository.save(notification);
    } catch (error) {
      this.logger.error('알림 처리 실패', {
        notificationId: notification.id,
        error: error.message,
      });

      notification.retryCount += 1;
      if (notification.retryCount >= 3) {
        notification.status = NotificationStatus.FAILED;
      }
      notification.errorMessage = error.message;
      await this.logRepository.save(notification);
    }
  }

  /**
   * 방해 금지 시간 체크
   */
  private isInQuietHours(settings: UserNotificationSettingsEntity): boolean {
    if (!settings.quietHoursEnabled || !settings.quietHoursStart || !settings.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const start = settings.quietHoursStart;
    const end = settings.quietHoursEnd;

    // 방해 금지 시간이 자정을 넘어가는 경우 (예: 23:00 ~ 07:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    // 방해 금지 시간이 같은 날인 경우 (예: 13:00 ~ 14:00)
    return currentTime >= start && currentTime < end;
  }

  /**
   * 알림 대기열에 추가
   */
  async queueNotification(
    memberId: number,
    typeCode: string,
    channel: string,
    title: string,
    content: string,
    metadata?: Record<string, any>,
  ): Promise<NotificationLogEntity> {
    const log = this.logRepository.create({
      memberId,
      typeCode,
      channel,
      title,
      content,
      metadata,
      status: NotificationStatus.PENDING,
    });

    return this.logRepository.save(log);
  }

  /**
   * 모든 활성화된 채널로 알림 발송 대기열 추가
   */
  async queueNotificationToAllChannels(
    memberId: number,
    typeCode: string,
    title: string,
    content: string,
    metadata?: Record<string, any>,
  ): Promise<NotificationLogEntity[]> {
    // 해당 알림 유형에 대한 사용자 설정 조회
    const typeSetting = await this.typeRepository.findOne({
      where: { memberId, typeCode },
    });

    if (!typeSetting || !typeSetting.enabled || !typeSetting.channels) {
      return [];
    }

    const logs: NotificationLogEntity[] = [];

    for (const channel of typeSetting.channels) {
      const log = await this.queueNotification(
        memberId,
        typeCode,
        channel,
        title,
        content,
        metadata,
      );
      logs.push(log);
    }

    return logs;
  }

  /**
   * 오래된 로그 정리 (30일 이상)
   */
  @Cron('0 3 * * *') // 매일 새벽 3시
  async cleanupOldLogs(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.logRepository.delete({
      createdAt: LessThan(thirtyDaysAgo),
      status: In([NotificationStatus.SENT, NotificationStatus.FAILED]),
    });

    if (result.affected && result.affected > 0) {
      this.logger.info('오래된 알림 로그 정리', { deleted: result.affected });
    }
  }
}
