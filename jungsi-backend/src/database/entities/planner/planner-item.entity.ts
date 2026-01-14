import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';

/**
 * 플래너 일정 아이템 엔티티
 * 캘린더에 표시되는 개별 일정(학습/수업)을 관리합니다.
 */
@Entity('planner_item_tb')
@Index(['member_id'])
@Index(['start_date'])
@Index(['primary_type'])
@Index(['subject'])
export class PlannerItemEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  member_id: number;

  @Column({ type: 'varchar', length: 10 })
  primary_type: string; // '학습' 또는 '수업'

  @Column({ type: 'varchar', length: 50, nullable: true })
  subject: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  teacher: string | null;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  r_rule: string | null; // iCalendar 반복 규칙

  @Column({ type: 'text', nullable: true })
  ex_date: string | null; // 반복 예외 날짜 (쉼표 구분)

  @Column({ type: 'boolean', default: false })
  late: boolean;

  @Column({ type: 'boolean', default: false })
  absent: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0 })
  progress: number; // 성취도 (0-100)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number | null;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @Column({ type: 'int', nullable: true })
  mentor_rank: number | null;

  @Column({ type: 'text', nullable: true })
  mentor_desc: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  mentor_test: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  study_type: string | null;

  @Column({ type: 'text', nullable: true })
  study_content: string | null;

  @Column({ type: 'date', nullable: true })
  plan_date: Date | null;

  @Column({ type: 'int', nullable: true })
  achievement: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  task_status: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  test: string | null;

  @Column({ type: 'int', nullable: true })
  start_page: number | null;

  @Column({ type: 'int', nullable: true })
  end_page: number | null;

  @Column({ type: 'int', nullable: true })
  start_session: number | null;

  @Column({ type: 'int', nullable: true })
  end_session: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
