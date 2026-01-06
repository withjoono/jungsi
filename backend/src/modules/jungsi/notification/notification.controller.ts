import { Controller, Get, Post, Body, Req, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  NotificationSettingsDto,
  NotificationSettingsResponseDto,
  ConnectKakaoChannelDto,
  TestNotificationDto,
  RegisterFcmTokenDto,
} from './dto/notification-settings.dto';

@ApiTags('정시 알림 설정')
@ApiBearerAuth()
@Controller('api/jungsi/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('settings')
  @ApiOperation({ summary: '알림 설정 조회' })
  @ApiResponse({
    status: 200,
    description: '알림 설정 조회 성공',
    type: NotificationSettingsResponseDto,
  })
  async getSettings(@Req() req): Promise<NotificationSettingsResponseDto> {
    const memberId = req.user?.memberId || req.user?.id;
    return this.notificationService.getSettings(memberId);
  }

  @Post('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '알림 설정 저장' })
  @ApiResponse({
    status: 200,
    description: '알림 설정 저장 성공',
    type: NotificationSettingsResponseDto,
  })
  async saveSettings(
    @Req() req,
    @Body() dto: NotificationSettingsDto,
  ): Promise<NotificationSettingsResponseDto> {
    const memberId = req.user?.memberId || req.user?.id;
    return this.notificationService.saveSettings(memberId, dto);
  }

  @Post('channels/kakao/connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '카카오 알림톡 연결' })
  @ApiResponse({
    status: 200,
    description: '카카오 연결 성공',
  })
  async connectKakaoChannel(
    @Req() req,
    @Body() dto: ConnectKakaoChannelDto,
  ): Promise<{ success: boolean; message: string }> {
    const memberId = req.user?.memberId || req.user?.id;
    return this.notificationService.connectKakaoChannel(memberId, dto.phoneNumber);
  }

  @Post('channels/kakao/disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '카카오 알림톡 연결 해제' })
  @ApiResponse({
    status: 200,
    description: '카카오 연결 해제 성공',
  })
  async disconnectKakaoChannel(@Req() req): Promise<{ success: boolean; message: string }> {
    const memberId = req.user?.memberId || req.user?.id;
    return this.notificationService.disconnectChannel(memberId, 'kakao');
  }

  @Post('channels/sms/disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SMS 연결 해제' })
  @ApiResponse({
    status: 200,
    description: 'SMS 연결 해제 성공',
  })
  async disconnectSmsChannel(@Req() req): Promise<{ success: boolean; message: string }> {
    const memberId = req.user?.memberId || req.user?.id;
    return this.notificationService.disconnectChannel(memberId, 'sms');
  }

  @Post('channels/push/register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'FCM 푸시 토큰 등록' })
  @ApiResponse({
    status: 200,
    description: 'FCM 토큰 등록 성공',
  })
  async registerFcmToken(
    @Req() req,
    @Body() dto: RegisterFcmTokenDto,
  ): Promise<{ success: boolean }> {
    const memberId = req.user?.memberId || req.user?.id;
    return this.notificationService.registerFcmToken(memberId, dto);
  }

  @Post('channels/push/disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '푸시 알림 연결 해제' })
  @ApiResponse({
    status: 200,
    description: '푸시 연결 해제 성공',
  })
  async disconnectPushChannel(@Req() req): Promise<{ success: boolean; message: string }> {
    const memberId = req.user?.memberId || req.user?.id;
    return this.notificationService.disconnectChannel(memberId, 'push');
  }

  @Post('channels/email/disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 연결 해제' })
  @ApiResponse({
    status: 200,
    description: '이메일 연결 해제 성공',
  })
  async disconnectEmailChannel(@Req() req): Promise<{ success: boolean; message: string }> {
    const memberId = req.user?.memberId || req.user?.id;
    return this.notificationService.disconnectChannel(memberId, 'email');
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '테스트 알림 발송' })
  @ApiResponse({
    status: 200,
    description: '테스트 알림 발송 성공',
  })
  async sendTestNotification(
    @Req() req,
    @Body() dto: TestNotificationDto,
  ): Promise<{ success: boolean; message: string }> {
    const memberId = req.user?.memberId || req.user?.id;
    return this.notificationService.sendTestNotification(memberId, dto);
  }

  @Get('logs')
  @ApiOperation({ summary: '알림 발송 이력 조회' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: '알림 이력 조회 성공',
  })
  async getNotificationLogs(
    @Req() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const memberId = req.user?.memberId || req.user?.id;
    return this.notificationService.getNotificationLogs(memberId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }
}
