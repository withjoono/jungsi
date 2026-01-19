import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RecruitmentUnitEntity } from './recruitment-unit.entity';

@Entity('ss_recruitment_unit_score', {
  comment: '모집단위별 성적 정보 테이블',
})
export class RecruitmentUnitScoreEntity {
  @PrimaryGeneratedColumn({ comment: '성적 정보 고유 ID' })
  id: number;

  @ManyToOne(() => RecruitmentUnitEntity, (unit) => unit.scores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recruitment_unit_id' })
  recruitmentUnit: RecruitmentUnitEntity;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '등급50컷',
  })
  grade_50_cut: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '등급70컷',
  })
  grade_70_cut: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '환산50컷',
  })
  convert_50_cut: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '환산70컷',
  })
  convert_70_cut: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '위험도 +5',
  })
  risk_plus_5: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '위험도 +4',
  })
  risk_plus_4: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '위험도 +3',
  })
  risk_plus_3: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '위험도 +2',
  })
  risk_plus_2: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '위험도 +1',
  })
  risk_plus_1: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '위험도 -1',
  })
  risk_minus_1: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '위험도 -2',
  })
  risk_minus_2: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '위험도 -3',
  })
  risk_minus_3: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '위험도 -4',
  })
  risk_minus_4: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '위험도 -5',
  })
  risk_minus_5: number;
}
