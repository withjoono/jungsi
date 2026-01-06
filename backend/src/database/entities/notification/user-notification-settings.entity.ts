import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';

@Entity('user_notification_settings')
@Index(['memberId'], { unique: true })
export class UserNotificationSettingsEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;

  // 카카오 알림톡 설정
  @Column({ name: 'kakao_enabled', type: 'boolean', default: false })
  kakaoEnabled: boolean;

  @Column({ name: 'kakao_phone', type: 'varchar', length: 20, nullable: true })
  kakaoPhone: string | null;

  // SMS 설정
  @Column({ name: 'sms_enabled', type: 'boolean', default: false })
  smsEnabled: boolean;

  @Column({ name: 'sms_phone', type: 'varchar', length: 20, nullable: true })
  smsPhone: string | null;

  // 푸시 알림 설정
  @Column({ name: 'push_enabled', type: 'boolean', default: false })
  pushEnabled: boolean;

  @Column({ name: 'push_fcm_token', type: 'text', nullable: true })
  pushFcmToken: string | null;

  // 이메일 설정
  @Column({ name: 'email_enabled', type: 'boolean', default: false })
  emailEnabled: boolean;

  @Column({ name: 'email_address', type: 'varchar', length: 255, nullable: true })
  emailAddress: string | null;

  // 방해 금지 시간 설정
  @Column({ name: 'quiet_hours_enabled', type: 'boolean', default: false })
  quietHoursEnabled: boolean;

  @Column({ name: 'quiet_hours_start', type: 'time', nullable: true })
  quietHoursStart: string | null;

  @Column({ name: 'quiet_hours_end', type: 'time', nullable: true })
  quietHoursEnd: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
