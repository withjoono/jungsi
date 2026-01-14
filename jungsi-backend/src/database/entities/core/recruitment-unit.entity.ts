import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { AdmissionEntity } from './admission.entity';
import { GeneralFieldEntity } from './general-field.entity';
import { MinorFieldEntity } from './minor-field.entity';
import { RecruitmentUnitScoreEntity } from './recruitment-unit-score.entity';
import { RecruitmentUnitMinimumGradeEntity } from './recruitment-unit-minimum_grade.entity';
import { RecruitmentUnitInterviewEntity } from './recruitment-unit-interview.entity';
import { RecruitmentUnitPreviousResultEntity } from './recruitment-unit-previous-result.entity';
import { RecruitmentUnitPassFailRecordsEntity } from './recruitment-unit-pass-fail-record.entity';

@Entity('ts_recruitment_units', {
  comment: '대학 입학전형의 모집단위 정보 테이블',
})
@Unique('uk_recruitment_admission_name', ['admission', 'name'])
export class RecruitmentUnitEntity {
  @PrimaryGeneratedColumn({ comment: '모집단위 고유 ID' })
  id: number;

  @ManyToOne(() => AdmissionEntity, (admission) => admission.recruitment_units, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'admission_id' })
  admission: AdmissionEntity;

  @ManyToOne(() => GeneralFieldEntity, (generalField) => generalField.recruitment_units)
  @JoinColumn({ name: 'general_field_id' })
  general_field: GeneralFieldEntity;

  @ManyToOne(() => MinorFieldEntity, (minorField) => minorField.recruitment_units)
  @JoinColumn({ name: 'minor_field_id' })
  minor_field: MinorFieldEntity;

  @Column({ type: 'varchar', length: 100, comment: '모집단위 이름' })
  name: string;

  @Column({ type: 'int', nullable: true, comment: '모집인원' })
  recruitment_number: number;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '모집단위 코드',
  })
  code: string;

  @OneToOne(() => RecruitmentUnitScoreEntity, (score) => score.recruitmentUnit)
  scores: RecruitmentUnitScoreEntity;

  @OneToOne(() => RecruitmentUnitMinimumGradeEntity, (minimumGrade) => minimumGrade.recruitmentUnit)
  minimum_grade: RecruitmentUnitMinimumGradeEntity;

  @OneToOne(() => RecruitmentUnitInterviewEntity, (interview) => interview.recruitment_unit)
  interview: RecruitmentUnitInterviewEntity;

  @OneToMany(
    () => RecruitmentUnitPreviousResultEntity,
    (previousResult) => previousResult.recruitment_unit,
  )
  previous_results: RecruitmentUnitPreviousResultEntity[];

  @OneToMany(
    () => RecruitmentUnitPassFailRecordsEntity,
    (passFailRecord) => passFailRecord.recruitmentUnit,
  )
  pass_fail_records: RecruitmentUnitPassFailRecordsEntity[];
}
