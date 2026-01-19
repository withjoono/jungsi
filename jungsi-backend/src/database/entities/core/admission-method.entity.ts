import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { AdmissionEntity } from './admission.entity';

@Entity('ss_admission_method', { comment: '대학 입학전형 방법 정보 테이블' })
export class AdmissionMethodEntity {
  @PrimaryGeneratedColumn({ comment: '전형 방법 고유 ID' })
  id: number;

  @OneToOne(() => AdmissionEntity, (admission) => admission.method, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'admission_id' })
  admission: AdmissionEntity;

  @Column({ type: 'varchar', length: 255, comment: '전형방법 설명' })
  method_description: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '교과비율',
  })
  subject_ratio: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '서류비율',
  })
  document_ratio: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '면접비율',
  })
  interview_ratio: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '실기/실적비율',
  })
  practical_ratio: number;

  @Column({ type: 'text', nullable: true, comment: '기타내역' })
  other_details: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '2단계_1단계성적비율',
  })
  second_stage_first_ratio: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '2단계_면접비율',
  })
  second_stage_interview_ratio: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '2단계_그외비율',
  })
  second_stage_other_ratio: number;

  @Column({ type: 'text', nullable: true, comment: '2단계_그외내역' })
  second_stage_other_details: string;

  @Column({ type: 'text', comment: '지원자격' })
  eligibility: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '생기부평가배점 (예: 40/40/20)',
  })
  school_record_evaluation_score: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '생기부평가요소 (예: CD/O/GS)',
  })
  school_record_evaluation_elements: string;
}
