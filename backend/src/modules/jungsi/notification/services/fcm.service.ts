import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as admin from 'firebase-admin';

export interface FcmNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export interface FcmSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class FcmService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  /**
   * Firebase Admin SDK가 초기화되었는지 확인
   */
  private isFirebaseInitialized(): boolean {
    try {
      return admin.apps.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * 단일 FCM 토큰으로 푸시 알림 발송
   */
  async sendToDevice(fcmToken: string, payload: FcmNotificationPayload): Promise<FcmSendResult> {
    if (!this.isFirebaseInitialized()) {
      this.logger.warn('Firebase가 초기화되지 않았습니다. 푸시 알림을 보낼 수 없습니다.');
      return {
        success: false,
        error: 'Firebase not initialized',
      };
    }

    try {
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'jungsi_notifications',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: payload.title,
                body: payload.body,
              },
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
          },
          fcmOptions: {
            link: payload.data?.link || '/',
          },
        },
      };

      const response = await admin.messaging().send(message);

      this.logger.info('FCM 푸시 알림 발송 성공', {
        messageId: response,
        title: payload.title,
      });

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('FCM 푸시 알림 발송 실패', {
        error: error.message,
        code: error.code,
        fcmToken: fcmToken.substring(0, 20) + '...', // 토큰 일부만 로깅
      });

      // 토큰이 유효하지 않은 경우 처리
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        return {
          success: false,
          error: 'invalid_token',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 여러 FCM 토큰으로 동시에 푸시 알림 발송
   */
  async sendToMultipleDevices(
    fcmTokens: string[],
    payload: FcmNotificationPayload,
  ): Promise<{ successCount: number; failureCount: number; invalidTokens: string[] }> {
    if (!this.isFirebaseInitialized()) {
      this.logger.warn('Firebase가 초기화되지 않았습니다.');
      return {
        successCount: 0,
        failureCount: fcmTokens.length,
        invalidTokens: [],
      };
    }

    if (fcmTokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        invalidTokens: [],
      };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: fcmTokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'jungsi_notifications',
            priority: 'high',
            defaultSound: true,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: payload.title,
                body: payload.body,
              },
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // 유효하지 않은 토큰 수집
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(fcmTokens[idx]);
          }
        }
      });

      this.logger.info('FCM 멀티캐스트 발송 완료', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokenCount: invalidTokens.length,
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
      };
    } catch (error) {
      this.logger.error('FCM 멀티캐스트 발송 실패', { error: error.message });
      return {
        successCount: 0,
        failureCount: fcmTokens.length,
        invalidTokens: [],
      };
    }
  }

  /**
   * 정시 경쟁률 급등 알림
   */
  async sendCompetitionSurgeAlert(
    fcmToken: string,
    data: {
      universityName: string;
      departmentName: string;
      currentRate: number;
      previousRate: number;
      changePercent: number;
      link?: string;
    },
  ): Promise<FcmSendResult> {
    return this.sendToDevice(fcmToken, {
      title: '🚨 경쟁률 급등 알림',
      body: `${data.universityName} ${data.departmentName}\n경쟁률 ${data.previousRate}:1 → ${data.currentRate}:1 (+${data.changePercent}%)`,
      data: {
        type: 'competition_surge',
        universityName: data.universityName,
        departmentName: data.departmentName,
        currentRate: String(data.currentRate),
        previousRate: String(data.previousRate),
        changePercent: String(data.changePercent),
        link: data.link || '/jungsi/my-applications',
      },
    });
  }

  /**
   * 합격 확률 변동 알림
   */
  async sendProbabilityChangeAlert(
    fcmToken: string,
    data: {
      universityName: string;
      departmentName: string;
      currentProbability: number;
      previousProbability: number;
      changePercent: number;
      link?: string;
    },
  ): Promise<FcmSendResult> {
    const direction = data.changePercent > 0 ? '상승' : '하락';
    const emoji = data.changePercent > 0 ? '📈' : '📉';

    return this.sendToDevice(fcmToken, {
      title: `${emoji} 합격 확률 ${direction}`,
      body: `${data.universityName} ${data.departmentName}\n합격확률 ${data.previousProbability}% → ${data.currentProbability}%`,
      data: {
        type: 'probability_change',
        universityName: data.universityName,
        departmentName: data.departmentName,
        currentProbability: String(data.currentProbability),
        previousProbability: String(data.previousProbability),
        changePercent: String(data.changePercent),
        link: data.link || '/jungsi/my-applications',
      },
    });
  }

  /**
   * 안전권 진입/이탈 알림
   */
  async sendSafeZoneAlert(
    fcmToken: string,
    data: {
      universityName: string;
      departmentName: string;
      status: 'entered' | 'exited';
      probability: number;
      link?: string;
    },
  ): Promise<FcmSendResult> {
    const isEntered = data.status === 'entered';
    const emoji = isEntered ? '✅' : '⚠️';
    const message = isEntered
      ? `안전권(90% 이상)에 진입했습니다!`
      : `안전권에서 이탈했습니다. 현재 ${data.probability}%`;

    return this.sendToDevice(fcmToken, {
      title: `${emoji} ${data.universityName} ${data.departmentName}`,
      body: message,
      data: {
        type: 'safe_zone',
        universityName: data.universityName,
        departmentName: data.departmentName,
        status: data.status,
        probability: String(data.probability),
        link: data.link || '/jungsi/my-applications',
      },
    });
  }

  /**
   * 마감 임박 알림
   */
  async sendDeadlineAlert(
    fcmToken: string,
    data: {
      universityName: string;
      departmentName: string;
      hoursRemaining: number;
      deadlineTime: string;
      link?: string;
    },
  ): Promise<FcmSendResult> {
    const urgency = data.hoursRemaining <= 1 ? '🚨' : '⏰';
    const timeText =
      data.hoursRemaining <= 1
        ? `${Math.round(data.hoursRemaining * 60)}분`
        : `${data.hoursRemaining}시간`;

    return this.sendToDevice(fcmToken, {
      title: `${urgency} 원서 마감 ${timeText} 전`,
      body: `${data.universityName} ${data.departmentName}\n마감: ${data.deadlineTime}`,
      data: {
        type: 'deadline',
        universityName: data.universityName,
        departmentName: data.departmentName,
        hoursRemaining: String(data.hoursRemaining),
        deadlineTime: data.deadlineTime,
        link: data.link || '/jungsi/my-applications',
      },
    });
  }

  /**
   * 테스트 알림 발송
   */
  async sendTestNotification(fcmToken: string): Promise<FcmSendResult> {
    return this.sendToDevice(fcmToken, {
      title: '🔔 거북스쿨 테스트 알림',
      body: '푸시 알림이 정상적으로 작동합니다!',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });
  }
}
