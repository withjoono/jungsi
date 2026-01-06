import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

/**
 * 사정관 평가 시 점수
 * bottom_survey_id(질문 id)에 따른 score 저장
 * D: 1, C: 2, C+: 3, B: 4, B+: 5, A: 6, A+: 7
 */
@Entity('officer_scoring_tb')
@Unique('officer_scoring_tb_UN', ['bottom_survey_id', 'officer_relation_id'])
export class OfficerEvaluationScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: true })
  bottom_survey_id: number;

  @Column({ type: 'bigint' })
  officer_relation_id: number;

  @Column({ type: 'int' })
  score: number;
}
