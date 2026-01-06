import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('susi_comprehensive_tb')
@Index('idx_year_basic_type_large_medium_small', [
  'year',
  'basic_type',
  'large_department',
  'medium_department',
  'small_department',
])
export class SusiComprehensiveEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '통합 아이디 (ex. U0094121)',
  })
  unified_id: string | null;

  @Column({ type: 'int', nullable: true, comment: '년도' })
  year: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '지역구분' })
  region: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '대학명' })
  university_name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '대학코드' })
  university_code: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '국립/사립' })
  national_or_private: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true, comment: '기본유형' })
  basic_type: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '전형세부유형',
  })
  detailed_type: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '전형명' })
  type_name: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '중심전형분류',
  })
  central_classification: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '계열' })
  department: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '모집단위명',
  })
  recruitment_unit_name: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '대계열' })
  large_department: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '중계열' })
  medium_department: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '소계열' })
  small_department: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true, comment: '모집인원' })
  recruitment_number: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true, comment: '선발모형' })
  selection_model: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true, comment: '선발비율' })
  selection_ratio: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true, comment: '전형방법' })
  selection_method: string | null;

  @Column({ type: 'int', nullable: true, comment: '서류비율' })
  document_rate: number | null;

  @Column({ type: 'int', nullable: true, comment: '면접비율' })
  interview_rate: number | null;

  @Column({ type: 'int', nullable: true, comment: '그외비율' })
  other_rate: number | null;

  @Column({ type: 'text', nullable: true, comment: '그외내역' })
  other_details: string | null;

  @Column({ type: 'int', nullable: true, comment: '(2단계)1단계성적' })
  step2_step1_score_rate: number | null;

  @Column({ type: 'int', nullable: true, comment: '(2단계)면접비율' })
  step2_interview_rate: number | null;

  @Column({ type: 'int', nullable: true, comment: '(2단계)그외' })
  step2_other_rate: number | null;

  @Column({ type: 'text', nullable: true, comment: '(2단계)그외내역' })
  step2_other_details: string | null;

  @Column({ type: 'text', nullable: true, comment: '지원자격TEXT' })
  application_eligibility_text: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '50컷' })
  cut_50: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '70컷' })
  cut_70: string | null;

  @Column({ type: 'float', nullable: true, comment: '환산점수위험도(+)5' })
  risk_level_plus5: number | null;

  @Column({ type: 'float', nullable: true, comment: '위험도(+)4' })
  risk_level_plus4: number | null;

  @Column({ type: 'float', nullable: true, comment: '위험도(+)3' })
  risk_level_plus3: number | null;

  @Column({ type: 'float', nullable: true, comment: '위험도(+)2' })
  risk_level_plus2: number | null;

  @Column({ type: 'float', nullable: true, comment: '위험도(+)1' })
  risk_level_plus1: number | null;

  @Column({ type: 'float', nullable: true, comment: '위험도(-1)' })
  risk_level_minus1: number | null;

  @Column({ type: 'float', nullable: true, comment: '위험도(-2)' })
  risk_level_minus2: number | null;

  @Column({ type: 'float', nullable: true, comment: '위험도(-3)' })
  risk_level_minus3: number | null;

  @Column({ type: 'float', nullable: true, comment: '위험도(-4)' })
  risk_level_minus4: number | null;

  @Column({ type: 'float', nullable: true, comment: '위험도(-5)' })
  risk_level_minus5: number | null;

  @Column({ type: 'int', nullable: true, comment: '최저학력기준_반영여부' })
  minimum_academic_standards_applied: number | null;

  @Column({ type: 'text', nullable: true, comment: '수능최저학력기준TEXT' })
  minimum_academic_standards_text: string | null;

  @Column({ type: 'int', nullable: true, comment: '최저국어' })
  minimum_korean: number | null;

  @Column({ type: 'int', nullable: true, comment: '최저수학' })
  minimum_math: number | null;

  @Column({ type: 'int', nullable: true, comment: '최저수학(미/기)' })
  minimum_math_science_engineering: number | null;

  @Column({ type: 'int', nullable: true, comment: '영어' })
  minimum_english: number | null;

  @Column({ type: 'int', nullable: true, comment: '사탐' })
  minimum_social_studies: number | null;

  @Column({ type: 'int', nullable: true, comment: '과탐' })
  minimum_science_studies: number | null;

  @Column({ type: 'int', nullable: true, comment: '탐계산' })
  minimum_calculation_studies: number | null;

  @Column({ type: 'int', nullable: true, comment: '최저갯수' })
  minimum_count: number | null;

  @Column({ type: 'float', nullable: true, comment: '최저합' })
  minimum_sum: number | null;

  @Column({ type: 'float', nullable: true, comment: '한국사' })
  minimum_korean_history: number | null;

  @Column({ type: 'int', nullable: true, comment: '그외' })
  minimum_others: number | null;

  @Column({ type: 'text', nullable: true, comment: '그외상세' })
  minimum_others_details: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '가산점',
  })
  additional_point: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '가산점 TEXT',
  })
  additional_point_text: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '3개평가 비중(30:20:50)',
  })
  evaluation_ratios: string | null;

  @Column({
    type: 'varchar',
    length: 60,
    nullable: true,
    comment: '3개평가 코드',
  })
  evaluation_code: string | null;

  @Column({ type: 'int', nullable: true, comment: '면접점수반영여부' })
  interview_score_applied: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '면접유형' })
  interview_type: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '면접시활용자료',
  })
  interview_resources: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '면접진행방식',
  })
  interview_method: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '면접평가내용',
  })
  interview_evaluation_content: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '면접날짜TEXT',
  })
  interview_date_text: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '면접시간' })
  interview_time: string | null;

  @Column({
    type: 'varchar',
    length: 120,
    nullable: true,
    comment: '2024년입결기준',
  })
  admission_criteria_2024: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2024학년도입결(등급)',
  })
  admission_2024_grade: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2024학년도입결(환산점수)',
  })
  admission_2024_converted_score: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2024학년도경쟁률',
  })
  competition_rate_2024: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2024충원',
  })
  replenishment_2024: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '2023학년도기준',
  })
  admission_criteria_2023: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2023학년도입결(등급)',
  })
  admission_2023_grade: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2023학년도입결(환산점수)',
  })
  admission_2023_converted_score: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2023학년도경쟁률',
  })
  competition_rate_2023: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2023충원',
  })
  replenishment_2023: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '2022학년도기준',
  })
  admission_criteria_2022: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2022학년도입결',
  })
  admission_2022_grade: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2022학년도경쟁률',
  })
  competition_rate_2022: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2022충원',
  })
  replenishment_2022: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2021학년도입결',
  })
  admission_2021_grade: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2021학년도경쟁률',
  })
  competition_rate_2021: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2021충원',
  })
  replenishment_2021: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2020학년도입결',
  })
  admission_2020_grade: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2020학년도경쟁률',
  })
  competition_rate_2020: string | null;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
    comment: '2020충원',
  })
  replenishment_2020: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '지원시유의사항',
  })
  application_notes: string | null;
}
