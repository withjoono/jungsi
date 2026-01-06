import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RegularAdmissionEntity } from './regular-admission.entity';

@Entity('ts_regular_admission_previous_results', {
  comment: '과거 정시 입학 결과 테이블',
})
export class RegularAdmissionPreviousResultEntity {
  @PrimaryGeneratedColumn({ comment: '과거 정시 입학 결과 고유 ID' })
  id: number;

  @Column({ type: 'int', comment: '년도' })
  year: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '환산점수 50%컷 (구: 최초컷)',
  })
  min_cut: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '환산점수 70%컷 (구: 추합컷)',
  })
  max_cut: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '경쟁률',
  })
  competition_ratio: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '누백',
  })
  percent: number | null;

  @Column({
    type: 'int',
    nullable: true,
    comment: '모집인원(최종)',
  })
  recruitment_number: number | null;

  @Column({
    type: 'int',
    nullable: true,
    comment: '충원합격순위',
  })
  additional_pass_rank: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '환산점수총점',
  })
  converted_score_total: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '백분위 50%컷',
  })
  percentile_50: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '백분위 70%컷',
  })
  percentile_70: number | null;

  @ManyToOne(
    () => RegularAdmissionEntity,
    (regularAdmission) => regularAdmission.previous_results,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'regular_admission_id' })
  regular_admission: RegularAdmissionEntity;
}
