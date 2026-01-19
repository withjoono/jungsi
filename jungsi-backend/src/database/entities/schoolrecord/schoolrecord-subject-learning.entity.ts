import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

@Entity('sgb_subject_learning')
export class SchoolRecordSubjectLearningEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  achievement: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  etc: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  grade: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  main_subject_code: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  main_subject_name: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  ranking: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  raw_score: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  semester: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  standard_deviation: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  students_num: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  sub_subject_average: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  subject_code: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  subject_name: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  unit: string | null;

  @ManyToOne(() => MemberEntity, (member) => member.subjectLearnings)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
