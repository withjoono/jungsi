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
 * 루틴(일과) 엔티티
 * 매일 반복되는 일과를 관리합니다.
 */
@Entity('pl_routine')
@Index(['member_id'])
export class RoutineEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  member_id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'boolean', default: true })
  repeat: boolean;

  @Column({ type: 'date', nullable: true })
  date: Date | null; // 특정 날짜 (반복 아닌 경우)

  @Column({ type: 'int', nullable: true })
  length: number | null; // 소요 시간 (분)

  @Column({ type: 'boolean', default: false })
  sun: boolean;

  @Column({ type: 'boolean', default: false })
  mon: boolean;

  @Column({ type: 'boolean', default: false })
  tues: boolean;

  @Column({ type: 'boolean', default: false })
  wed: boolean;

  @Column({ type: 'boolean', default: false })
  thurs: boolean;

  @Column({ type: 'boolean', default: false })
  fri: boolean;

  @Column({ type: 'boolean', default: false })
  sat: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
