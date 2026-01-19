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

export enum AttendanceStatus {
  PRESENT = 'present',
  LATE = 'late',
  ABSENT = 'absent',
  EXCUSED = 'excused',
}

@Entity('mc_attendance')
export class AttendanceEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'member_id' })
  member_id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', name: 'check_in', nullable: true })
  check_in: string | null;

  @Column({ type: 'time', name: 'check_out', nullable: true })
  check_out: string | null;

  @Column({ type: 'varchar', length: 20, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

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
