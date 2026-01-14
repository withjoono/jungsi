import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

/**
 * 사정관 평가 시 코멘트
 * mainSurveyType은 HAKUP | JINRO | GONGDONG | ETC 중 하나
 */
@Entity('officer_comment_list_tb')
@Unique('officer_comment_list_tb_UN', ['main_survey_type', 'officer_relation_id'])
export class OfficerEvaluationCommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 7000 })
  comment: string;

  @Column({ type: 'varchar', length: 255 })
  main_survey_type: string;

  @Column({ type: 'bigint' })
  officer_relation_id: number; // 사정관 평가 id
}
