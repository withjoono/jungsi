import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

@Entity('schoolrecord_select_subject_tb')
export class SchoolRecordSelectSubjectEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text', nullable: true })
  achievement: string | null;

  @Column({ type: 'text', nullable: true })
  achievementa: string | null;

  @Column({ type: 'text', nullable: true })
  achievementb: string | null;

  @Column({ type: 'text', nullable: true })
  achievementc: string | null;

  @Column({ type: 'text', nullable: true })
  etc: string | null;

  @Column({ type: 'text', nullable: true })
  grade: string | null;

  @Column({ type: 'text', nullable: true })
  main_subject_code: string | null;

  @Column({ type: 'text', nullable: false })
  main_subject_name: string;

  @Column({ type: 'text', nullable: true })
  raw_score: string | null;

  @Column({ type: 'text', nullable: true })
  semester: string | null;

  @Column({ type: 'text', nullable: true })
  students_num: string | null;

  @Column({ type: 'text', nullable: true })
  sub_subject_average: string | null;

  @Column({ type: 'text', nullable: true })
  subject_code: string | null;

  @Column({ type: 'text', nullable: false })
  subject_name: string;

  @Column({ type: 'text', nullable: true })
  unit: string | null;

  @ManyToOne(() => MemberEntity, (member) => member.selectSubjects)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
