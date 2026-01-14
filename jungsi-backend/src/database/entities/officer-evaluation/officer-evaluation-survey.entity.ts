import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/** 사정관 학종 평가 시 질문 목록 */
@Entity('officer_bottom_survey_tb')
export class OfficerEvaluationSurveyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  evaluate_content: string; // 질문내용

  @Column({ type: 'int', nullable: true })
  order_num: number; // 순서
}
