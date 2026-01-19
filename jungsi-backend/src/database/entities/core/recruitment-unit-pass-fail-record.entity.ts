import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { RecruitmentUnitEntity } from './recruitment-unit.entity';

@Entity('ss_recruitment_unit_pass_fail_record', {
  comment: '모집단위 합불 데이터 테이블',
})
export class RecruitmentUnitPassFailRecordsEntity {
  @PrimaryGeneratedColumn({ comment: '합불 데이터 고유 ID' })
  id: number;

  @ManyToOne(() => RecruitmentUnitEntity, (unit) => unit.pass_fail_records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recruitment_unit_id' })
  recruitmentUnit: RecruitmentUnitEntity;

  @Column('varchar', {
    length: 5,
    nullable: true,
    comment: '지원결과 1단계 (합/불)',
  })
  first_result: string | null;

  @Column('varchar', {
    length: 5,
    nullable: true,
    comment: '지원결과 최종 (합/불)',
  })
  final_result: string | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '평균등급 - 전과목',
  })
  avg_grade_all: number | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '평균등급 - 국영수사',
  })
  avg_grade_gyss: number | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '평균등급 - 국영수과',
  })
  avg_grade_gysg: number | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '평균등급 - 국영수탐(백분위)',
  })
  avg_grade_gyst_100: number | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '평균등급 - 국영수탐',
  })
  avg_grade_gyst: number | null;
}
