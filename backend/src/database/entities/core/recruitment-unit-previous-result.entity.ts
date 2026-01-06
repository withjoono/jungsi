import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RecruitmentUnitEntity } from './recruitment-unit.entity';

@Entity('ts_recruitment_unit_previous_results', {
  comment: '모집단위별 이전 연도 입결 정보 테이블',
})
export class RecruitmentUnitPreviousResultEntity {
  @PrimaryGeneratedColumn({ comment: '입결 정보 고유 ID' })
  id: number;

  @ManyToOne(() => RecruitmentUnitEntity, (unit) => unit.previous_results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recruitment_unit_id' })
  recruitment_unit: RecruitmentUnitEntity;

  @Column({
    type: 'int',
    comment: '입결 연도',
  })
  year: number;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '입결 기준 (예: 최종등록자90%컷)',
  })
  result_criteria: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '등급컷',
  })
  grade_cut: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '환산컷',
  })
  converted_score_cut: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '경쟁률',
  })
  competition_ratio: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: '모집인원',
  })
  recruitment_number: number;
}
