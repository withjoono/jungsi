import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MemberEntity } from './member.entity';
import { UniversityEntity } from '../core/university.entity';
import { RegularAdmissionEntity } from '../core/regular-admission.entity';

/**
 * 사용자별 모집단위별 정시 환산점수 저장 테이블
 * - 각 모집단위(recruitment_unit)별로 환산점수, 유불리 점수 저장
 * - 사용자가 수능점수를 입력하고 트리거하면 모든 모집단위에 대해 계산 후 저장
 */
@Entity('js_user_recruitment_scores', { comment: '정시 모집단위별 사용자 환산점수' })
@Index(['member_id', 'regular_admission_id'], { unique: true })
@Index(['member_id'])
@Index(['member_id', 'university_id'])
export class MemberJungsiRecruitmentScoreEntity {
  @PrimaryGeneratedColumn({ comment: '고유 ID' })
  id: number;

  @Column({ type: 'int', comment: '회원 ID' })
  member_id: number;

  @Column({ type: 'int', comment: '정시 모집단위 ID' })
  regular_admission_id: number;

  @Column({ type: 'int', comment: '대학 ID' })
  university_id: number;

  @Column({ type: 'varchar', length: 100, comment: '대학명' })
  university_name: string;

  @Column({ type: 'varchar', length: 200, comment: '모집단위명' })
  recruitment_name: string;

  @Column({ type: 'varchar', length: 20, comment: '모집군 (가/나/다)' })
  admission_type: string;

  @Column({ type: 'varchar', length: 100, comment: '전형명', nullable: true })
  admission_name: string;

  @Column({ type: 'varchar', length: 100, comment: '환산식 코드명' })
  score_calculation: string;

  @Column({ type: 'varchar', length: 10, comment: '환산식 코드 (SC001)' })
  score_calculation_code: string;

  @Column({ type: 'varchar', length: 50, comment: '계열 (인문/자연)' })
  major: string;

  // ========== 환산점수 ==========
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    comment: '환산점수',
    default: 0,
  })
  converted_score: number;

  @Column({
    type: 'int',
    comment: '표준점수 합 (국+수+탐2)',
    default: 0,
  })
  standard_score_sum: number;

  // ========== 유불리 점수 ==========
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    comment: '동점수 평균 환산점수 (유불리 점수표에서 조회)',
    default: 0,
  })
  optimal_score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    comment: '유불리 점수차 (optimal_score - converted_score, 양수=유리, 음수=불리)',
    default: 0,
  })
  advantage_score: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    comment: '상위누적백분위',
    nullable: true,
  })
  cumulative_percentile: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    comment: '유불리 백분위 차이',
    nullable: true,
  })
  advantage_percentile: number;

  // ========== 위험도 ==========
  @Column({
    type: 'int',
    comment: '위험도 점수 (-15 ~ 10)',
    nullable: true,
  })
  risk_score: number;

  // ========== 컷라인 정보 (ts_regular_admissions에서 복사) ==========
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    comment: '최소 컷라인 (50%컷)',
    nullable: true,
  })
  min_cut: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    comment: '최대 컷라인 (70%컷)',
    nullable: true,
  })
  max_cut: number;

  // ========== 계산 성공 여부 ==========
  @Column({ type: 'boolean', comment: '계산 성공 여부', default: true })
  success: boolean;

  @Column({ type: 'varchar', length: 200, comment: '실패 사유', nullable: true })
  failure_reason: string;

  // ========== 메타 정보 ==========
  @Column({
    type: 'timestamp',
    comment: '계산 일시',
    nullable: true,
  })
  calculated_at: Date;

  @CreateDateColumn({ comment: '생성일시' })
  created_at: Date;

  @UpdateDateColumn({ comment: '수정일시' })
  updated_at: Date;

  // ========== Relations ==========
  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => UniversityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'university_id' })
  university: UniversityEntity;

  @ManyToOne(() => RegularAdmissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'regular_admission_id' })
  regular_admission: RegularAdmissionEntity;
}
