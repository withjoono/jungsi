import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  UserNotificationSettingsEntity,
  UserNotificationTypeEntity,
  NotificationLogEntity,
  NotificationTypeCode,
  NotificationStatus,
} from '../../../database/entities/notification';
import {
  NotificationSettingsDto,
  NotificationSettingsResponseDto,
  TestNotificationDto,
  RegisterFcmTokenDto,
} from './dto/notification-settings.dto';
import { FcmService } from './services/fcm.service';
import { EmailService } from './services/email.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(UserNotificationSettingsEntity)
    private settingsRepository: Repository<UserNotificationSettingsEntity>,
    @InjectRepository(UserNotificationTypeEntity)
    private typeRepository: Repository<UserNotificationTypeEntity>,
    @InjectRepository(NotificationLogEntity)
    private logRepository: Repository<NotificationLogEntity>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly fcmService: FcmService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * 사용자 알림 설정 조회
   */
  async getSettings(memberId: number): Promise<NotificationSettingsResponseDto> {
    // 기본 설정 조회 또는 생성
    let settings = await this.settingsRepository.findOne({
      where: { memberId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(memberId);
    }

    // 알림 유형별 설정 조회
    const notificationTypes = await this.typeRepository.find({
      where: { memberId },
    });

    // 기본 알림 유형이 없으면 생성
    if (notificationTypes.length === 0) {
      await this.createDefaultNotificationTypes(memberId);
      const defaultTypes = await this.typeRepository.find({
        where: { memberId },
      });
      return this.formatSettingsResponse(settings, defaultTypes);
    }

    return this.formatSettingsResponse(settings, notificationTypes);
  }

  /**
   * 사용자 알림 설정 저장
   */
  async saveSettings(
    memberId: number,
    dto: NotificationSettingsDto,
  ): Promise<NotificationSettingsResponseDto> {
    // 기존 설정 조회 또는 생성
    let settings = await this.settingsRepository.findOne({
      where: { memberId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(memberId);
    }

    // 채널 설정 업데이트
    if (dto.channels) {
      if (dto.channels.kakao) {
        settings.kakaoEnabled = dto.channels.kakao.enabled;
        if (dto.channels.kakao.phoneNumber !== undefined) {
          settings.kakaoPhone = dto.channels.kakao.phoneNumber || null;
        }
      }
      if (dto.channels.sms) {
        settings.smsEnabled = dto.channels.sms.enabled;
        if (dto.channels.sms.phoneNumber !== undefined) {
          settings.smsPhone = dto.channels.sms.phoneNumber || null;
        }
      }
      if (dto.channels.push) {
        settings.pushEnabled = dto.channels.push.enabled;
        if (dto.channels.push.fcmToken !== undefined) {
          settings.pushFcmToken = dto.channels.push.fcmToken || null;
        }
      }
      if (dto.channels.email) {
        settings.emailEnabled = dto.channels.email.enabled;
        if (dto.channels.email.emailAddress !== undefined) {
          settings.emailAddress = dto.channels.email.emailAddress || null;
        }
      }
    }

    // 방해 금지 시간 설정 업데이트
    if (dto.quietHours) {
      settings.quietHoursEnabled = dto.quietHours.enabled;
      if (dto.quietHours.start !== undefined) {
        settings.quietHoursStart = dto.quietHours.start || null;
      }
      if (dto.quietHours.end !== undefined) {
        settings.quietHoursEnd = dto.quietHours.end || null;
      }
    }

    await this.settingsRepository.save(settings);

    // 알림 유형별 설정 업데이트
    if (dto.notificationTypes) {
      for (const [typeCode, typeSetting] of Object.entries(dto.notificationTypes)) {
        if (typeSetting) {
          await this.typeRepository.upsert(
            {
              memberId,
              typeCode,
              enabled: typeSetting.enabled,
              channels: typeSetting.channels,
              threshold: typeSetting.threshold ?? null,
              timeSetting: typeSetting.time ?? null,
            },
            ['memberId', 'typeCode'],
          );
        }
      }
    }

    // 업데이트된 설정 조회 후 반환
    return this.getSettings(memberId);
  }

  /**
   * 카카오 채널 연결
   */
  async connectKakaoChannel(
    memberId: number,
    phoneNumber: string,
  ): Promise<{ success: boolean; message: string }> {
    let settings = await this.settingsRepository.findOne({
      where: { memberId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(memberId);
    }

    // 전화번호 형식 정리
    const cleanPhone = phoneNumber.replace(/-/g, '');

    settings.kakaoPhone = cleanPhone;
    settings.kakaoEnabled = true;
    await this.settingsRepository.save(settings);

    this.logger.info('카카오 채널 연결', { memberId, phone: cleanPhone });

    // TODO: 실제 카카오 비즈니스 API 연동 시 추가 처리 필요
    return {
      success: true,
      message: '카카오 알림톡이 연결되었습니다.',
    };
  }

  /**
   * 채널 연결 해제
   */
  async disconnectChannel(
    memberId: number,
    channel: string,
  ): Promise<{ success: boolean; message: string }> {
    const settings = await this.settingsRepository.findOne({
      where: { memberId },
    });

    if (!settings) {
      throw new BadRequestException('알림 설정이 없습니다.');
    }

    switch (channel) {
      case 'kakao':
        settings.kakaoEnabled = false;
        settings.kakaoPhone = null;
        break;
      case 'sms':
        settings.smsEnabled = false;
        settings.smsPhone = null;
        break;
      case 'push':
        settings.pushEnabled = false;
        settings.pushFcmToken = null;
        break;
      case 'email':
        settings.emailEnabled = false;
        settings.emailAddress = null;
        break;
      default:
        throw new BadRequestException('잘못된 채널입니다.');
    }

    await this.settingsRepository.save(settings);

    this.logger.info('채널 연결 해제', { memberId, channel });

    return {
      success: true,
      message: `${channel} 채널이 연결 해제되었습니다.`,
    };
  }

  /**
   * FCM 토큰 등록
   */
  async registerFcmToken(
    memberId: number,
    dto: RegisterFcmTokenDto,
  ): Promise<{ success: boolean }> {
    let settings = await this.settingsRepository.findOne({
      where: { memberId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(memberId);
    }

    settings.pushFcmToken = dto.fcmToken;
    settings.pushEnabled = true;
    await this.settingsRepository.save(settings);

    this.logger.info('FCM 토큰 등록', { memberId });

    return { success: true };
  }

  /**
   * 테스트 알림 발송
   */
  async sendTestNotification(
    memberId: number,
    dto: TestNotificationDto,
  ): Promise<{ success: boolean; message: string }> {
    const settings = await this.settingsRepository.findOne({
      where: { memberId },
    });

    if (!settings) {
      throw new BadRequestException('알림 설정이 없습니다.');
    }

    const testMessage = dto.message || '거북스쿨 테스트 알림입니다.';

    // 로그 기록
    const log = this.logRepository.create({
      memberId,
      typeCode: 'test',
      channel: dto.channel,
      title: '테스트 알림',
      content: testMessage,
      status: NotificationStatus.PENDING,
    });

    try {
      switch (dto.channel) {
        case 'kakao':
          if (!settings.kakaoPhone) {
            throw new BadRequestException('카카오 알림톡 전화번호가 등록되지 않았습니다.');
          }
          // TODO: 카카오 알림톡 발송 구현 (카카오 비즈니스 API 연동 필요)
          this.logger.info('카카오 테스트 알림 발송 (미구현)', {
            memberId,
            phone: settings.kakaoPhone,
          });
          // 임시로 성공 처리
          break;

        case 'sms':
          if (!settings.smsPhone) {
            throw new BadRequestException('SMS 전화번호가 등록되지 않았습니다.');
          }
          // TODO: SMS 발송 구현 (기존 SmsService 연동)
          this.logger.info('SMS 테스트 알림 발송 (미구현)', {
            memberId,
            phone: settings.smsPhone,
          });
          // 임시로 성공 처리
          break;

        case 'push':
          if (!settings.pushFcmToken) {
            throw new BadRequestException('FCM 토큰이 등록되지 않았습니다.');
          }
          const pushResult = await this.fcmService.sendTestNotification(settings.pushFcmToken);
          if (!pushResult.success) {
            throw new BadRequestException(pushResult.error || '푸시 알림 발송 실패');
          }
          this.logger.info('푸시 테스트 알림 발송 성공', { memberId });
          break;

        case 'email':
          if (!settings.emailAddress) {
            throw new BadRequestException('이메일 주소가 등록되지 않았습니다.');
          }
          const emailResult = await this.emailService.sendTestEmail(settings.emailAddress);
          if (!emailResult.success) {
            throw new BadRequestException(emailResult.error || '이메일 발송 실패');
          }
          this.logger.info('이메일 테스트 알림 발송 성공', {
            memberId,
            email: settings.emailAddress,
          });
          break;
      }

      log.status = NotificationStatus.SENT;
      log.sentAt = new Date();
    } catch (error) {
      log.status = NotificationStatus.FAILED;
      log.errorMessage = error.message;
      throw error;
    } finally {
      await this.logRepository.save(log);
    }

    return {
      success: true,
      message: `${dto.channel} 테스트 알림이 발송되었습니다.`,
    };
  }

  /**
   * 알림 발송 이력 조회
   */
  async getNotificationLogs(
    memberId: number,
    options?: { limit?: number; offset?: number },
  ): Promise<{ logs: NotificationLogEntity[]; total: number }> {
    const [logs, total] = await this.logRepository.findAndCount({
      where: { memberId },
      order: { createdAt: 'DESC' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    });

    return { logs, total };
  }

  /**
   * 기본 설정 생성
   */
  private async createDefaultSettings(memberId: number): Promise<UserNotificationSettingsEntity> {
    const settings = this.settingsRepository.create({
      memberId,
      kakaoEnabled: false,
      smsEnabled: false,
      pushEnabled: false,
      emailEnabled: false,
      quietHoursEnabled: false,
    });

    return this.settingsRepository.save(settings);
  }

  /**
   * 기본 알림 유형 설정 생성
   */
  private async createDefaultNotificationTypes(memberId: number): Promise<void> {
    const defaultTypes = [
      {
        memberId,
        typeCode: NotificationTypeCode.COMPETITION_SURGE,
        enabled: true,
        channels: ['kakao', 'push'],
        threshold: 30,
      },
      {
        memberId,
        typeCode: NotificationTypeCode.PROBABILITY_CHANGE,
        enabled: true,
        channels: ['push'],
        threshold: 5,
      },
      {
        memberId,
        typeCode: NotificationTypeCode.SAFE_ZONE,
        enabled: true,
        channels: ['kakao', 'push'],
        threshold: null,
      },
      {
        memberId,
        typeCode: NotificationTypeCode.DEADLINE,
        enabled: true,
        channels: ['kakao', 'sms', 'push'],
        threshold: null,
      },
      {
        memberId,
        typeCode: NotificationTypeCode.DAILY_SUMMARY,
        enabled: false,
        channels: ['email'],
        threshold: null,
        timeSetting: '21:00',
      },
    ];

    await this.typeRepository.save(defaultTypes);
  }

  /**
   * 설정 응답 포맷
   */
  private formatSettingsResponse(
    settings: UserNotificationSettingsEntity,
    notificationTypes: UserNotificationTypeEntity[],
  ): NotificationSettingsResponseDto {
    const typesMap: NotificationSettingsResponseDto['notificationTypes'] = {};

    for (const type of notificationTypes) {
      typesMap[type.typeCode] = {
        enabled: type.enabled,
        channels: type.channels || [],
        threshold: type.threshold ? Number(type.threshold) : undefined,
        time: type.timeSetting || undefined,
      };
    }

    return {
      channels: {
        kakao: {
          enabled: settings.kakaoEnabled,
          phoneNumber: settings.kakaoPhone,
        },
        sms: {
          enabled: settings.smsEnabled,
          phoneNumber: settings.smsPhone,
        },
        push: {
          enabled: settings.pushEnabled,
          fcmToken: settings.pushFcmToken,
        },
        email: {
          enabled: settings.emailEnabled,
          emailAddress: settings.emailAddress,
        },
      },
      notificationTypes: typesMap,
      quietHours: {
        enabled: settings.quietHoursEnabled,
        start: settings.quietHoursStart,
        end: settings.quietHoursEnd,
      },
    };
  }
}
