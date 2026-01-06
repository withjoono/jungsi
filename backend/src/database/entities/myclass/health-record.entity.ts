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

export enum MoodType {
  GOOD = 'good',
  NORMAL = 'normal',
  BAD = 'bad',
}

@Entity('myclass_health_record_tb')
export class HealthRecordEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'member_id' })
  member_id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 3, scale: 1, name: 'sleep_hours', nullable: true })
  sleep_hours: number | null;

  @Column({ type: 'int', name: 'meal_count', nullable: true })
  meal_count: number | null;

  @Column({ type: 'int', name: 'exercise_minutes', nullable: true })
  exercise_minutes: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mood: MoodType | null;

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
