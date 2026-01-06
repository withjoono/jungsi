import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// 교과 검색에 사용되는 필드에 인덱스 처리 필요 (ex 지역, 기본유형, 전형 세부유형 등등) 프론트 작업 후 진행
@Entity('susi_subject_tb')
export class SuSiSubjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    length: 50,
    nullable: true,
    comment: '통합 아이디 (ex. U0094121)',
  })
  unified_id: string | null;

  @Column({ type: 'int', nullable: true })
  year: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  region: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  university_name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  university_code: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  national_or_private: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  basic_type: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  detailed_type: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  type_name: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  central_classification: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  department: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  college: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  recruitment_unit_name: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  large_department: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  medium_department: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  small_department: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  recruitment_number: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  selection_model: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  selection_ratio: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  selection_method: string | null;

  @Column({ type: 'int', nullable: true })
  curriculum: number | null;

  @Column({ type: 'int', nullable: true })
  interview: number | null;

  @Column({ type: 'int', nullable: true })
  attendance: number | null;

  @Column({ type: 'int', nullable: true })
  volunteer: number | null;

  @Column({ type: 'int', nullable: true })
  document_non_academic: number | null;

  @Column({ type: 'int', nullable: true })
  practical_skills: number | null;

  @Column({ type: 'int', nullable: true })
  step1_score: number | null;

  @Column({ type: 'int', nullable: true })
  step2_others: number | null;

  @Column({ type: 'int', nullable: true })
  step2_interview: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  step2_other_details: string | null;

  @Column({ type: 'text', nullable: true })
  application_eligibility_text: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  student_record_utilization_index: string | null;

  @Column({ type: 'int', nullable: true })
  curriculum_reflection_semester: number | null;

  @Column({ type: 'int', nullable: true })
  first_year_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  second_year_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  third_year_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  second_third_year_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  first_second_third_year_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  curriculum_grade_1: number | null;

  @Column({ type: 'int', nullable: true })
  curriculum_grade_2: number | null;

  @Column({ type: 'int', nullable: true })
  curriculum_grade_3: number | null;

  @Column({ type: 'int', nullable: true })
  curriculum_grade_4: number | null;

  @Column({ type: 'int', nullable: true })
  curriculum_grade_5: number | null;

  @Column({ type: 'int', nullable: true })
  curriculum_grade_6: number | null;

  @Column({ type: 'int', nullable: true })
  curriculum_grade_7: number | null;

  @Column({ type: 'int', nullable: true })
  curriculum_grade_8: number | null;

  @Column({ type: 'int', nullable: true })
  curriculum_grade_9: number | null;

  @Column({ type: 'int', nullable: true })
  common_general_and_career_integration: number | null;

  @Column({ type: 'int', nullable: true })
  common_general_subject_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_1_year_korean: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_1_year_math: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_1_year_english: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_1_year_science: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_1_year_social: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_1_year_korean_history: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_1_year_other: number | null;

  @Column({ type: 'int', nullable: true })
  number_of_optional_subjects_1: number | null;

  @Column({ type: 'int', nullable: true })
  total_number_of_top_subjects_1: number | null;

  @Column({ type: 'int', nullable: true })
  number_of_top_subjects_per_subject_1: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_2_3_years_korean: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_2_3_years_math: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_2_3_years_english: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_2_3_years_science: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_2_3_years_social: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_2_3_years_korean_history: number | null;

  @Column({ type: 'int', nullable: true })
  reflected_subject_2_3_years_other: number | null;

  @Column({ type: 'int', nullable: true })
  number_of_optional_subjects_2_3: number | null;

  @Column({ type: 'int', nullable: true })
  total_number_of_top_subjects_2_3: number | null;

  @Column({ type: 'int', nullable: true })
  number_of_top_subjects_per_subject_2_3: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  common_general_reflection_method: string | null;

  @Column({ type: 'int', nullable: true })
  perfect_score: number | null;

  @Column({ type: 'int', nullable: true })
  attendance_usage: number | null;

  @Column({ type: 'int', nullable: true })
  attendance_usage_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  absence_1: number | null;

  @Column({ type: 'int', nullable: true })
  absence_2: number | null;

  @Column({ type: 'int', nullable: true })
  absence_3: number | null;

  @Column({ type: 'int', nullable: true })
  absence_4: number | null;

  @Column({ type: 'int', nullable: true })
  absence_5: number | null;

  @Column({ type: 'int', nullable: true })
  absence_6: number | null;

  @Column({ type: 'int', nullable: true })
  absence_7: number | null;

  @Column({ type: 'int', nullable: true })
  absence_8: number | null;

  @Column({ type: 'int', nullable: true })
  absence_9: number | null;

  @Column({ type: 'int', nullable: true })
  absence_10: number | null;

  @Column({ type: 'int', nullable: true })
  absence_11: number | null;

  @Column({ type: 'int', nullable: true })
  absence_12: number | null;

  @Column({ type: 'int', nullable: true })
  absence_13: number | null;

  @Column({ type: 'int', nullable: true })
  absence_14: number | null;

  @Column({ type: 'int', nullable: true })
  absence_15: number | null;

  @Column({ type: 'int', nullable: true })
  absence_16: number | null;

  @Column({ type: 'int', nullable: true })
  absence_17: number | null;

  @Column({ type: 'int', nullable: true })
  absence_18: number | null;

  @Column({ type: 'int', nullable: true })
  absence_19: number | null;

  @Column({ type: 'int', nullable: true })
  absence_20: number | null;

  @Column({ type: 'int', nullable: true })
  career_subject_application: number | null;

  @Column({ type: 'text', nullable: true })
  career_subject_reflection_method: string | null;

  @Column({ type: 'int', nullable: true })
  career_optional_subject: number | null;

  @Column({ type: 'text', nullable: true })
  career_if_2: string | null;

  @Column({ type: 'int', nullable: true })
  career_optional_subject_A: number | null;

  @Column({ type: 'int', nullable: true })
  career_optional_subject_B: number | null;

  @Column({ type: 'int', nullable: true })
  career_optional_subject_C: number | null;

  @Column({ type: 'int', nullable: true })
  A_distribution_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  B_distribution_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  C_distribution_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  career_subject_ratio: number | null;

  @Column({ type: 'int', nullable: true })
  career_subject_additional_points: number | null;

  @Column({ type: 'int', nullable: true })
  number_of_top_subjects_in_all_career_subjects: number | null;

  @Column({ type: 'int', nullable: true })
  number_of_top_subjects_in_career_curriculum: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grade_cut: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grade_cut_70: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  converted_score_cut: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  non_subject_cut: string | null;

  @Column({ type: 'float', nullable: true })
  converted_score_total: number | null;

  @Column({ type: 'float', nullable: true })
  risk_level_plus5: number | null;

  @Column({ type: 'float', nullable: true })
  risk_level_plus4: number | null;

  @Column({ type: 'float', nullable: true })
  risk_level_plus3: number | null;

  @Column({ type: 'float', nullable: true })
  risk_level_plus2: number | null;

  @Column({ type: 'float', nullable: true })
  risk_level_plus1: number | null;

  @Column({ type: 'float', nullable: true })
  risk_level_minus1: number | null;

  @Column({ type: 'float', nullable: true })
  risk_level_minus2: number | null;

  @Column({ type: 'float', nullable: true })
  risk_level_minus3: number | null;

  @Column({ type: 'float', nullable: true })
  risk_level_minus4: number | null;

  @Column({ type: 'float', nullable: true })
  risk_level_minus5: number | null;

  @Column({ type: 'int', nullable: true })
  minimum_academic_standards_applied: number | null;

  @Column({ type: 'text', nullable: true })
  minimum_academic_standards_text: string | null;

  @Column({ type: 'int', nullable: true })
  minimum_korean: number | null;

  @Column({ type: 'int', nullable: true })
  minimum_math: number | null;

  @Column({ type: 'int', nullable: true })
  minimum_math_science_engineering: number | null;

  @Column({ type: 'int', nullable: true })
  english: number | null;

  @Column({ type: 'int', nullable: true })
  social_studies: number | null;

  @Column({ type: 'int', nullable: true })
  science_studies: number | null;

  @Column({ type: 'int', nullable: true })
  calculation_studies: number | null;

  @Column({ type: 'int', nullable: true })
  minimum_count: number | null;

  @Column({ type: 'float', nullable: true })
  minimum_sum: number | null;

  @Column({ type: 'float', nullable: true })
  korean_history: number | null;

  @Column({ type: 'int', nullable: true })
  others: number | null;

  @Column({ type: 'text', nullable: true })
  others_details: string | null;

  @Column({ type: 'int', nullable: true })
  additional_points: number | null;

  @Column({ type: 'text', nullable: true })
  additional_points_text: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  interview_score_applied: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  interview_type: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  interview_resources: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  interview_method: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  interview_evaluation_content: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  interview_date_text: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  interview_time: string | null;

  @Column({ type: 'int', nullable: true })
  curriculum_calculation_formula: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  admission_criteria_2024: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  admission_2024_grade: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  admission_2024_converted_score: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  competition_rate_2024: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  replenishment_2024: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  admission_criteria_2023: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  admission_2023_grade: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  admission_2023_converted_score: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  competition_rate_2023: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  replenishment_2023: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  admission_criteria_2022: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  admission_2022_grade: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  competition_rate_2022: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  replenishment_2022: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  admission_2021_grade: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  competition_rate_2021: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  replenishment_2021: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  admission_2020_grade: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  competition_rate_2020: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  replenishment_2020: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  application_notes: string | null;
}
