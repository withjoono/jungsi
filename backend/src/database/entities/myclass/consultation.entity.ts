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

export enum ConsultationType {
  STUDENT = 'student',
  PARENT = 'parent',
}

@Entity('myclass_consultation_tb')
export class ConsultationEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'member_id' })
  member_id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 20 })
  type: ConsultationType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mentor: string | null;

  @Column({ type: 'bigint', name: 'mentor_id', nullable: true })
  mentor_id: number | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'date', name: 'next_date', nullable: true })
  next_date: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'mentor_id' })
  mentorMember: MemberEntity;
}
