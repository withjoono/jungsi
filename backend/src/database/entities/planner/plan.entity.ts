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
 * 장기 학습계획 엔티티
 * 과목별 장기 학습 목표 및 진행률을 관리합니다.
 */
@Entity('planner_plan_tb')
@Index(['member_id'])
@Index(['subject'])
export class PlanEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  member_id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subject: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  step: string | null;

  @Column({ type: 'date', nullable: true })
  start_date: Date | null;

  @Column({ type: 'date', nullable: true })
  end_date: Date | null;

  @Column({ type: 'time', nullable: true })
  start_time: string | null;

  @Column({ type: 'time', nullable: true })
  end_time: string | null;

  @Column({ type: 'int', default: 0 })
  type: number; // 0: 강의, 1: 교재

  @Column({ type: 'varchar', length: 200, nullable: true })
  material: string | null;

  @Column({ type: 'int', nullable: true })
  total: number | null;

  @Column({ type: 'int', default: 0 })
  done: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  person: string | null;

  @Column({ type: 'boolean', default: false })
  is_item: boolean;

  @Column({ type: 'boolean', default: false })
  is_item_done: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
