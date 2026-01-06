import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 사정관 평가 엔티티
 * member_id: 평가자 id(사정관), student_id: 학생 id
 * status: COMPLETE | READY
 * series: 자연과학계열>농림・수산>작물・원예학
 */
@Entity('officer_student_evaludate_relation_tb')
@Unique('unique_mock2', ['student_id', 'member_id'])
export class OfficerEvaluationEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  create_dt: Date;

  @Column({ type: 'bigint' })
  member_id: number;

  @Column({ type: 'varchar', length: 500 })
  series: string;

  @Column({ type: 'varchar', length: 500 })
  status: string; // COMPLETE | READY

  @Column({ type: 'bigint' })
  student_id: number;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  update_dt: Date;
}
