import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('susi_pass_record_tb')
export class SusiPassRecordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '통합 아이디 (ex. U0094121)',
  })
  unified_id: string | null;

  @Column('varchar', { length: 20, nullable: true, comment: '지역' })
  region: string | null;

  @Column('varchar', { length: 80, nullable: true, comment: '계열' })
  department: string | null;

  @Column('varchar', { length: 80, nullable: true, comment: '대학명' })
  university_name: string | null;

  @Column('varchar', { length: 80, nullable: true, comment: '학과명' })
  recruitment_unit_name: string | null;

  @Column('varchar', {
    length: 20,
    nullable: true,
    comment: '전형유형 (실기, 논술, 교과)',
  })
  central_classification: string | null;

  @Column('varchar', { length: 20, nullable: true, comment: '일반, 특별' })
  basic_type: string | null;

  @Column('varchar', { length: 50, nullable: true, comment: '전형명' })
  type_name: string | null;

  @Column('varchar', { length: 20, nullable: true, comment: '지원결과 1단계' })
  first_result: string | null;

  @Column('varchar', { length: 20, nullable: true, comment: '지원결과 최종' })
  final_result: string | null;

  @Column('varchar', {
    length: 20,
    nullable: true,
    comment: '평균등급 - 전과목',
  })
  avg_grade_all: string | null;

  @Column('varchar', {
    length: 20,
    nullable: true,
    comment: '평균등급 국영수사',
  })
  avg_grade_gyss: string | null;

  @Column('varchar', {
    length: 20,
    nullable: true,
    comment: '평균등급 국영수과',
  })
  avg_grade_gysg: string | null;

  @Column('varchar', { length: 20, nullable: true, comment: '국영수탐 백분위' })
  avg_grade_gyst_100: string | null;

  @Column('varchar', {
    length: 20,
    nullable: true,
    comment: '평균등급 국영수탐',
  })
  avg_grade_gyst: string | null;
}
