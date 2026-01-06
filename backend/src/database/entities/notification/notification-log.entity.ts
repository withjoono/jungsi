import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';

// 알림 발송 상태
export enum NotificationStatus {
  PENDING = 'pending', // 대기 중
  SENT = 'sent', // 발송 완료
  FAILED = 'failed', // 발송 실패
}

@Entity('notification_logs')
@Index(['memberId', 'createdAt'])
@Index(['status'])
@Index(['typeCode'])
export class NotificationLogEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;

  @Column({ name: 'type_code', type: 'varchar', length: 50 })
  typeCode: string;

  @Column({ name: 'channel', type: 'varchar', length: 20 })
  channel: string; // kakao, sms, push, email

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: NotificationStatus.PENDING,
  })
  status: string;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  // 재시도 횟수
  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  // 알림 관련 메타데이터 (대학명, 학과명 등)
  @Column({ name: 'metadata', type: 'simple-json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
