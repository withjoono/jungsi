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

export enum TestStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  MISSED = 'missed',
}

@Entity('mc_test')
export class TestEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'member_id' })
  member_id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subject: string | null;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'total_score', default: 100 })
  total_score: number;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @Column({ type: 'int', name: 'total_students', nullable: true })
  total_students: number | null;

  @Column({ type: 'varchar', length: 20, default: TestStatus.PENDING })
  status: TestStatus;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
