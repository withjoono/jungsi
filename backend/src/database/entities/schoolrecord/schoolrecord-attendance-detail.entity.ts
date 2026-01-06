import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

@Entity('schoolrecord_attendance_detail_tb')
export class SchoolRecordAttendanceDetailEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: true })
  absent_disease: number | null;

  @Column({ type: 'int', nullable: true })
  absent_etc: number | null;

  @Column({ type: 'int', nullable: true })
  absent_unrecognized: number | null;

  @Column({ type: 'int', nullable: true })
  class_days: number | null;

  @Column({ type: 'text', nullable: true })
  etc: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  grade: string | null;

  @Column({ type: 'int', nullable: true })
  late_disease: number | null;

  @Column({ type: 'int', nullable: true })
  late_etc: number | null;

  @Column({ type: 'int', nullable: true })
  late_unrecognized: number | null;

  @Column({ type: 'int', nullable: true })
  leave_early_disease: number | null;

  @Column({ type: 'int', nullable: true })
  leave_early_etc: number | null;

  @Column({ type: 'int', nullable: true })
  leave_early_unrecognized: number | null;

  @Column({ type: 'int', nullable: true })
  result_disease: number | null;

  @Column({ type: 'int', nullable: true })
  result_early_etc: number | null;

  @Column({ type: 'int', nullable: true })
  result_unrecognized: number;

  @ManyToOne(() => MemberEntity, (member) => member.attendanceDetails)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
