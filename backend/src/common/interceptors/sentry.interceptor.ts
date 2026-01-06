import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { IncomingWebhook } from '@slack/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { catchError, Observable, throwError } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  private lastNotificationTime: number = 0;
  private errorCount: { [key: string]: number } = {};

  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      catchError((error) => {
        const errorKey = `${error.name}:${error.message}`;
        this.errorCount[errorKey] = (this.errorCount[errorKey] || 0) + 1;

        // Sentry에 컨텍스트와 함께 에러 전송
        Sentry.withScope((scope) => {
          // 요청 정보 추가
          scope.setContext('request', {
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          });

          // 요청 데이터 추가 (민감한 정보 제외)
          scope.setContext('requestData', {
            body: this.sanitizeData(request.body),
            params: request.params,
            query: request.query,
          });

          // 사용자 정보 (있는 경우)
          if (request.user) {
            scope.setUser({
              id: request.user.id,
              email: request.user.email,
            });
          }

          // 에러 발생 횟수
          scope.setTag('errorCount', this.errorCount[errorKey]);
          scope.setTag('errorType', error.name);

          // HTTP 상태 코드
          if (error instanceof HttpException) {
            scope.setTag('statusCode', error.getStatus());
          }

          // Sentry에 에러 전송
          Sentry.captureException(error);
        });

        // 로그 컨텍스트 생성
        const logContext = {
          exception: error.stack,
          body: this.sanitizeData(request.body),
          params: request.params,
          query: request.query,
          headers: this.sanitizeHeaders(request.headers),
          errorCount: this.errorCount[errorKey],
        };

        // 로그 메시지 생성
        const logMessage = `[${request.method}] ${request.url} - ${request.ip} - 에러 발생: ${error.message}`;

        // HTTP 예외가 아니거나 500 에러인 경우
        if (!(error instanceof HttpException) || error instanceof InternalServerErrorException) {
          this.logger.error(logMessage, logContext);
          this.sendSlackNotification(error, logContext);
        } else {
          // 400대 에러는 경고 로그로 기록
          this.logger.warn(logMessage, logContext);
        }

        // 원래의 에러를 다시 던져서 HttpExceptionFilter가 처리할 수 있게 함
        return throwError(() => error);
      }),
    );
  }

  // 민감한 데이터 제거
  private sanitizeData(data: any): any {
    if (!data) return data;

    const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'secret'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // 민감한 헤더 제거
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sendSlackNotification(error: Error, logContext: any): void {
    const currentTime = Date.now();
    const errorKey = `${error.name}:${error.message}`;

    // 마지막 알림으로부터 5분이 지났거나, 같은 에러가 5번 이상 발생했을 때만 알림을 보냄
    if (currentTime - this.lastNotificationTime > 5 * 60 * 1000 || this.errorCount[errorKey] >= 5) {
      const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK);
      webhook.send({
        attachments: [
          {
            color: 'danger',
            text: `🚨${process.env.APP_NAME} API 서버 심각한 에러발생🚨`,
            fields: [
              {
                title: '에러 유형',
                value: error.name,
                short: false,
              },
              {
                title: '에러 메시지',
                value: error.message,
                short: false,
              },
              {
                title: '스택 트레이스',
                value: error.stack,
                short: false,
              },
              {
                title: '발생 횟수',
                value: this.errorCount[errorKey].toString(),
                short: true,
              },
              {
                title: '요청 정보',
                value: JSON.stringify(logContext, null, 2),
                short: false,
              },
            ],
            ts: Math.floor(currentTime / 1000).toString(),
          },
        ],
      });

      // Slack notification sent (logger.info removed due to compatibility issues)

      // 알림을 보낸 후 타임스탬프와 에러 카운트를 초기화
      this.lastNotificationTime = currentTime;
      this.errorCount[errorKey] = 0;
    }
  }
}
