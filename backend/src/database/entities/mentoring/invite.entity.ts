import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';

/**
 * 멘토링 초대 링크 엔티티
 * 선생님이 학생을 초대하기 위한 코드를 저장합니다.
 * 코드는 7일간 유효하며, 사용 횟수 제한이 있습니다.
 */
@Entity('mentoring_invite_tb')
export class MentoringInviteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'bigint' })
  teacher_id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  invite_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  class_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  class_name: string;

  @Column({ type: 'varchar', length: 20, default: 'student' })
  invite_type: string; // student, parent

  @Column({ type: 'int', default: 0 })
  use_count: number;

  @Column({ type: 'int', default: 100 })
  max_use_count: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Index()
  @Column({ type: 'timestamp' })
  expire_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: MemberEntity;
}
