import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UniversityEntity } from './university.entity';
import { RegularAdmissionPreviousResultEntity } from './regular-admission-previous-result.entity';

@Entity('js_admission', { comment: '정시 입학 정보 테이블' })
export class RegularAdmissionEntity {
  @PrimaryGeneratedColumn({ comment: '정시 입학 정보 고유 ID' })
  id: number;

  @Column({ type: 'int', comment: '년도' })
  year: number;

  @Column({ type: 'varchar', length: 30, comment: '전형명' })
  admission_name: string;

  @Column({ type: 'varchar', length: 10, comment: '모집군' })
  admission_type: string;

  @Column({ type: 'varchar', length: 50, comment: '계열명 (의치한약수)' })
  general_field_name: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '상세계열 (전기•전자•컴퓨터•통신)',
  })
  detailed_fields: string;

  @Column({ type: 'int', comment: '정원', default: 0 })
  recruitment_number: number;

  @Column({ type: 'varchar', length: 50, comment: '선발 방식' })
  selection_method: number;

  @Column({ type: 'varchar', length: 50, comment: '모집단위명 (한국어문학과)' })
  recruitment_name: string;

  @Column({ type: 'varchar', length: 30, comment: '수능 비율' })
  csat_ratio: string;

  @Column({ type: 'varchar', length: 30, comment: '학생부 비율' })
  school_record_ratio: string;

  @Column({ type: 'varchar', length: 30, comment: '면접 비율' })
  interview_ratio: string;

  @Column({ type: 'varchar', length: 30, comment: '기타 비율' })
  other_ratio: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '점수환산식 (계명의학)',
    nullable: true,
  })
  score_calculation: string;

  @Column({
    type: 'varchar',
    length: 10,
    comment: '점수환산식 코드 (SC001)',
    nullable: true,
  })
  score_calculation_code: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '수능요소 (백+백)',
    nullable: true,
  })
  csat_elements: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '수능조합 (수탐(2)+국영中택1)',
    nullable: true,
  })
  csat_combination: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '수능필수 (수탐(2))',
    nullable: true,
  })
  csat_required: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '수능선택 (국영中택1)',
    nullable: true,
  })
  csat_optional: string;

  @Column({ type: 'int', comment: '전형 총점', nullable: true })
  total_score: number;

  @Column({ type: 'int', comment: '탐구과목수', nullable: true })
  research_subject_count: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '국어배점',
  })
  korean_reflection_score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '수학배점',
  })
  math_reflection_score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '탐구배점',
  })
  research_reflection_score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '영어 배점',
  })
  english_reflection_score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '한국사 배점',
  })
  korean_history_reflection_score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '제2외국어 배점',
  })
  second_foreign_language_reflection_score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '최초컷',
  })
  min_cut: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '최초누백',
  })
  min_cut_percent: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '추합컷',
  })
  max_cut: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '추합누백',
  })
  max_cut_percent: number;

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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '최초누백',
  })
  initial_cumulative_percentile: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '추합누백',
  })
  additional_cumulative_percentile: number;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '국어선택과목',
  })
  korean_elective_subject: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '수학_선택과목',
  })
  math_elective_subject: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '수학_확통가산점',
  })
  math_probability_statistics_additional_points: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '수학_미적가산점',
  })
  math_calculus_additional_points: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '수학_기하가산점',
  })
  math_geometry_additional_points: string;

  @Column({ type: 'varchar', length: 40, nullable: true, comment: '탐구_유형' })
  research_type: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '탐구_사회가산점',
  })
  research_social_additional_points: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '탐구_과학가산점',
  })
  research_science_additional_points: string;

  @Column({ type: 'varchar', length: 40, nullable: true, comment: '수탐선택' })
  math_research_selection: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '영어_적용기준',
  })
  english_application_criteria: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '영어 1등급점수',
  })
  english_grade_1_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '영어 2등급점수',
  })
  english_grade_2_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '영어 3등급점수',
  })
  english_grade_3_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '영어 4등급점수',
  })
  english_grade_4_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '영어 5등급점수',
  })
  english_grade_5_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '영어 6등급점수',
  })
  english_grade_6_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '영어 7등급점수',
  })
  english_grade_7_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '영어 8등급점수',
  })
  english_grade_8_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '영어 9등급점수',
  })
  english_grade_9_score: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '영어 최저기준',
  })
  english_minimum_criteria: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '한국사_적용기준',
  })
  korean_history_application_criteria: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '한국사 1등급점수',
  })
  korean_history_grade_1_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '한국사 2등급점수',
  })
  korean_history_grade_2_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '한국사 3등급점수',
  })
  korean_history_grade_3_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '한국사 4등급점수',
  })
  korean_history_grade_4_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '한국사 5등급점수',
  })
  korean_history_grade_5_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '한국사 6등급점수',
  })
  korean_history_grade_6_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '한국사 7등급점수',
  })
  korean_history_grade_7_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '한국사 8등급점수',
  })
  korean_history_grade_8_score: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: true,
    comment: '한국사 9등급점수',
  })
  korean_history_grade_9_score: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '한국사 최저기준',
  })
  korean_history_minimum_criteria: string;

  @ManyToOne(() => UniversityEntity, (university) => university.regular_admissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'university_id' })
  university: UniversityEntity;

  @OneToMany(
    () => RegularAdmissionPreviousResultEntity,
    (pastResult) => pastResult.regular_admission,
    { cascade: true },
  )
  previous_results: RegularAdmissionPreviousResultEntity[];
}
