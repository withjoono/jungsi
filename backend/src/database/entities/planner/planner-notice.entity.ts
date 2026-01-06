import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';

@Entity('planner_notice_tb')
export class PlannerNoticeEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'planner_id' })
  planner_id: number;

  @Column({ type: 'varchar', length: 10, name: 'class_code', nullable: true })
  class_code: string | null;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'boolean', name: 'is_important', default: false })
  is_important: boolean;

  @Column({ type: 'varchar', length: 1, name: 'use_yn', default: 'Y' })
  use_yn: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'planner_id' })
  planner: MemberEntity;
}
