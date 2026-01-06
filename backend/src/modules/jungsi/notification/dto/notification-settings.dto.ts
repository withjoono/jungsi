import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsIn,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

// 채널 설정 DTO
class KakaoChannelDto {
  @ApiProperty({ description: '카카오 알림 활성화 여부', example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: '연락처', example: '010-1234-5678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

class SmsChannelDto {
  @ApiProperty({ description: 'SMS 알림 활성화 여부', example: false })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: '연락처', example: '010-1234-5678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

class PushChannelDto {
  @ApiProperty({ description: '푸시 알림 활성화 여부', example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'FCM 토큰' })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}

class EmailChannelDto {
  @ApiProperty({ description: '이메일 알림 활성화 여부', example: false })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({
    description: '이메일 주소',
    example: 'student@example.com',
  })
  @IsOptional()
  @IsString()
  emailAddress?: string;
}

class ChannelsDto {
  @ApiPropertyOptional({ description: '카카오 알림톡 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => KakaoChannelDto)
  kakao?: KakaoChannelDto;

  @ApiPropertyOptional({ description: 'SMS 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SmsChannelDto)
  sms?: SmsChannelDto;

  @ApiPropertyOptional({ description: '푸시 알림 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PushChannelDto)
  push?: PushChannelDto;

  @ApiPropertyOptional({ description: '이메일 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailChannelDto)
  email?: EmailChannelDto;
}

// 알림 유형별 설정 DTO
class NotificationTypeSettingDto {
  @ApiProperty({ description: '알림 활성화 여부', example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: '알림 채널 목록',
    example: ['kakao', 'push'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsIn(['kakao', 'sms', 'push', 'email'], { each: true })
  channels: string[];

  @ApiPropertyOptional({
    description: '임계값 (경쟁률 %, 확률 % 등)',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiPropertyOptional({
    description: '알림 시간 (HH:mm 형식)',
    example: '21:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: '시간은 HH:mm 형식이어야 합니다',
  })
  time?: string;
}

class NotificationTypesDto {
  @ApiPropertyOptional({ description: '경쟁률 급등 알림 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationTypeSettingDto)
  competition_surge?: NotificationTypeSettingDto;

  @ApiPropertyOptional({ description: '합격 확률 변동 알림 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationTypeSettingDto)
  probability_change?: NotificationTypeSettingDto;

  @ApiPropertyOptional({ description: '안전권 진입/이탈 알림 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationTypeSettingDto)
  safe_zone?: NotificationTypeSettingDto;

  @ApiPropertyOptional({ description: '마감 임박 알림 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationTypeSettingDto)
  deadline?: NotificationTypeSettingDto;

  @ApiPropertyOptional({ description: '일일 요약 알림 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationTypeSettingDto)
  daily_summary?: NotificationTypeSettingDto;
}

// 방해 금지 시간 DTO
class QuietHoursDto {
  @ApiProperty({ description: '방해 금지 활성화 여부', example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({
    description: '시작 시간 (HH:mm)',
    example: '23:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: '시간은 HH:mm 형식이어야 합니다',
  })
  start?: string;

  @ApiPropertyOptional({
    description: '종료 시간 (HH:mm)',
    example: '07:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: '시간은 HH:mm 형식이어야 합니다',
  })
  end?: string;
}

// 메인 설정 요청/응답 DTO
export class NotificationSettingsDto {
  @ApiPropertyOptional({ description: '채널별 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelsDto)
  channels?: ChannelsDto;

  @ApiPropertyOptional({ description: '알림 유형별 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationTypesDto)
  notificationTypes?: NotificationTypesDto;

  @ApiPropertyOptional({ description: '방해 금지 시간 설정' })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;
}

// 응답용 DTO (전체 설정)
export class NotificationSettingsResponseDto {
  @ApiProperty({ description: '채널별 설정' })
  channels: {
    kakao: { enabled: boolean; phoneNumber: string | null };
    sms: { enabled: boolean; phoneNumber: string | null };
    push: { enabled: boolean; fcmToken: string | null };
    email: { enabled: boolean; emailAddress: string | null };
  };

  @ApiProperty({ description: '알림 유형별 설정' })
  notificationTypes: {
    [key: string]: {
      enabled: boolean;
      channels: string[];
      threshold?: number;
      time?: string;
    };
  };

  @ApiProperty({ description: '방해 금지 시간 설정' })
  quietHours: {
    enabled: boolean;
    start: string | null;
    end: string | null;
  };
}

// 채널 연결 요청 DTO
export class ConnectKakaoChannelDto {
  @ApiProperty({ description: '카카오 연동용 전화번호', example: '010-1234-5678' })
  @IsString()
  phoneNumber: string;
}

export class DisconnectChannelDto {
  @ApiProperty({
    description: '연결 해제할 채널',
    example: 'kakao',
    enum: ['kakao', 'sms', 'push', 'email'],
  })
  @IsString()
  @IsIn(['kakao', 'sms', 'push', 'email'])
  channel: string;
}

// 테스트 알림 요청 DTO
export class TestNotificationDto {
  @ApiProperty({
    description: '테스트할 채널',
    example: 'push',
    enum: ['kakao', 'sms', 'push', 'email'],
  })
  @IsString()
  @IsIn(['kakao', 'sms', 'push', 'email'])
  channel: string;

  @ApiPropertyOptional({
    description: '테스트 메시지',
    example: '테스트 알림입니다',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

// FCM 토큰 등록 DTO
export class RegisterFcmTokenDto {
  @ApiProperty({ description: 'FCM 토큰' })
  @IsString()
  fcmToken: string;
}
