import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';

// 알림 유형 코드
export enum NotificationTypeCode {
  COMPETITION_SURGE = 'competition_surge', // 경쟁률 급등
  PROBABILITY_CHANGE = 'probability_change', // 합격 확률 변동
  SAFE_ZONE = 'safe_zone', // 안전권 진입/이탈
  DEADLINE = 'deadline', // 마감 임박
  DAILY_SUMMARY = 'daily_summary', // 일일 요약
}

// 알림 채널
export enum NotificationChannel {
  KAKAO = 'kakao',
  SMS = 'sms',
  PUSH = 'push',
  EMAIL = 'email',
}

@Entity('user_notification_types')
@Unique(['memberId', 'typeCode'])
@Index(['memberId'])
export class UserNotificationTypeEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;

  @Column({
    name: 'type_code',
    type: 'varchar',
    length: 50,
  })
  typeCode: string;

  @Column({ name: 'enabled', type: 'boolean', default: true })
  enabled: boolean;

  // 알림 채널 배열 (JSON으로 저장)
  @Column({
    name: 'channels',
    type: 'simple-json',
    nullable: true,
  })
  channels: string[] | null;

  // 임계값 (경쟁률 30%, 확률 5% 등)
  @Column({
    name: 'threshold',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  threshold: number | null;

  // 시간 설정 (daily_summary용 - "21:00" 형식)
  @Column({ name: 'time_setting', type: 'varchar', length: 10, nullable: true })
  timeSetting: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
