import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as nodemailer from 'nodemailer';
import { AllConfigType } from '../../../../config/config.type';

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(
    private configService: ConfigService<AllConfigType>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    // 이메일 설정 로드 (환경 변수에서)
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    this.fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@turtleskool.com';
    this.fromName = process.env.SMTP_FROM_NAME || '거북스쿨';

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      this.logger.info('이메일 서비스 초기화 완료', { host: smtpHost });
    } else {
      this.logger.warn('SMTP 설정이 없습니다. 이메일 발송이 비활성화됩니다.');
    }
  }

  /**
   * 이메일 서비스가 설정되었는지 확인
   */
  isConfigured(): boolean {
    return this.transporter !== null;
  }

  /**
   * 이메일 발송
   */
  async sendEmail(payload: EmailNotificationPayload): Promise<EmailSendResult> {
    if (!this.transporter) {
      this.logger.warn('이메일 서비스가 설정되지 않았습니다.');
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text || this.stripHtml(payload.html),
      });

      this.logger.info('이메일 발송 성공', {
        messageId: info.messageId,
        to: payload.to,
        subject: payload.subject,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error('이메일 발송 실패', {
        error: error.message,
        to: payload.to,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 일일 요약 이메일 발송
   */
  async sendDailySummaryEmail(
    to: string,
    data: {
      studentName: string;
      date: string;
      applications: Array<{
        universityName: string;
        departmentName: string;
        competitionRate: number;
        probability: number;
        status: 'safe' | 'moderate' | 'risky';
      }>;
    },
  ): Promise<EmailSendResult> {
    const statusEmoji = {
      safe: '🟢',
      moderate: '🟡',
      risky: '🔴',
    };

    const statusText = {
      safe: '안전',
      moderate: '적정',
      risky: '위험',
    };

    const applicationsHtml = data.applications
      .map(
        (app) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${statusEmoji[app.status]} ${app.universityName}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${app.departmentName}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
            ${app.competitionRate}:1
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
            ${app.probability}%
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
            ${statusText[app.status]}
          </td>
        </tr>
      `,
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f5f5f5; padding: 12px; text-align: left; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📊 정시 일일 요약</h1>
            <p style="margin: 10px 0 0;">${data.date}</p>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${data.studentName}</strong>님!</p>
            <p>오늘의 정시 지원 현황을 알려드립니다.</p>

            <table>
              <thead>
                <tr>
                  <th>대학</th>
                  <th>학과</th>
                  <th>경쟁률</th>
                  <th>합격확률</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                ${applicationsHtml}
              </tbody>
            </table>

            <p style="color: #666; font-size: 14px;">
              🟢 안전: 합격 확률 70% 이상<br>
              🟡 적정: 합격 확률 40-70%<br>
              🔴 위험: 합격 확률 40% 미만
            </p>

            <div style="text-align: center;">
              <a href="https://turtleskool.com/jungsi/my-applications" class="button">
                자세히 보기
              </a>
            </div>
          </div>
          <div class="footer">
            <p>본 메일은 거북스쿨 알림 설정에 따라 발송되었습니다.</p>
            <p>알림 설정 변경: <a href="https://turtleskool.com/settings/notifications">설정 바로가기</a></p>
            <p>© ${new Date().getFullYear()} 거북스쿨. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `[거북스쿨] ${data.date} 정시 일일 요약`,
      html,
    });
  }

  /**
   * 경쟁률 급등 알림 이메일
   */
  async sendCompetitionSurgeEmail(
    to: string,
    data: {
      studentName: string;
      universityName: string;
      departmentName: string;
      currentRate: number;
      previousRate: number;
      changePercent: number;
    },
  ): Promise<EmailSendResult> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
          .alert-box { background: #fff5f5; border: 1px solid #ff6b6b; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .stat { display: inline-block; text-align: center; padding: 15px; margin: 10px; background: #f8f9fa; border-radius: 8px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #333; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          .arrow { font-size: 24px; color: #ff6b6b; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🚨 경쟁률 급등 알림</h1>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${data.studentName}</strong>님!</p>

            <div class="alert-box">
              <p style="margin: 0; font-weight: bold; font-size: 18px;">
                ${data.universityName} ${data.departmentName}
              </p>
              <p style="margin: 10px 0 0; color: #666;">
                지원하신 학과의 경쟁률이 급격히 상승했습니다.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <div class="stat">
                <div class="stat-value">${data.previousRate}:1</div>
                <div class="stat-label">이전 경쟁률</div>
              </div>
              <span class="arrow">→</span>
              <div class="stat">
                <div class="stat-value" style="color: #ff6b6b;">${data.currentRate}:1</div>
                <div class="stat-label">현재 경쟁률</div>
              </div>
            </div>

            <p style="text-align: center; color: #ff6b6b; font-size: 18px; font-weight: bold;">
              +${data.changePercent}% 상승
            </p>

            <div style="text-align: center;">
              <a href="https://turtleskool.com/jungsi/my-applications" class="button">
                지원 현황 확인하기
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `[긴급] ${data.universityName} ${data.departmentName} 경쟁률 급등 (+${data.changePercent}%)`,
      html,
    });
  }

  /**
   * 테스트 이메일 발송
   */
  async sendTestEmail(to: string): Promise<EmailSendResult> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
          <h1>🔔 거북스쿨 테스트 이메일</h1>
          <p>이메일 알림이 정상적으로 작동합니다!</p>
          <p style="color: #888; font-size: 12px;">발송 시간: ${new Date().toLocaleString('ko-KR')}</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '[거북스쿨] 테스트 이메일',
      html,
    });
  }

  /**
   * HTML 태그 제거
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
