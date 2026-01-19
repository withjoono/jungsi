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

/**
 * 환산인자별 사용자 환산점수 저장 테이블
 *
 * 목적:
 * - 700+ 모집단위마다 환산점수를 개별 계산하는 대신, 534개의 고유 환산인자만 계산
 * - 환산점수를 환산인자별로 1번만 저장하여 저장공간 35% 감소
 * - 모집단위별 테이블(ts_member_jungsi_recruitment_scores)은 메타데이터만 저장
 * - 환산점수 조회 시 LEFT JOIN으로 이 테이블과 결합
 *
 * 성능 개선:
 * - 계산 시간: 35초 → 3~5초 (88.9% 개선)
 * - 저장 공간: 350KB/user → 228KB/user (35% 감소)
 * - DB 저장: 700+ INSERT → 534 UPSERT (안정성 향상)
 *
 * 데이터 정규화:
 * - 환산점수는 환산인자별로 1번만 저장
 * - 동일 환산인자를 사용하는 모든 모집단위가 이 점수를 공유
 * - 유불리/백분위는 추후 별도 컬럼으로 추가 예정
 */
@Entity('js_user_hwansan_score', {
  comment: '환산인자별 사용자 환산점수',
})
@Index(['member_id', 'score_calculation_code', 'major'], { unique: true })
@Index(['member_id'])
@Index(['score_calculation_code'])
export class MemberJungsiFactorScoreEntity {
  @PrimaryGeneratedColumn({ comment: '고유 ID' })
  id: number;

  @Column({ type: 'int', comment: '회원 ID' })
  member_id: number;

  @Column({
    type: 'varchar',
    length: 10,
    comment: '환산식 코드 (SC001~SC534)',
  })
  score_calculation_code: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '계열 (인문/자연)',
  })
  major: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    comment: '환산점수 (핵심 데이터)',
    default: 0,
  })
  converted_score: number;

  @Column({
    type: 'int',
    comment: '표준점수 합계 (국+수+탐2)',
    default: 0,
  })
  standard_score_sum: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '유불리 점수 (동점수 평균 환산점수)',
  })
  optimal_score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    nullable: true,
    comment: '유불리 차이 (optimal_score - converted_score)',
  })
  advantage_score: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: '상위누적백분위',
  })
  cumulative_percentile: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: '유불리 백분위 차이',
  })
  advantage_percentile: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '계산 일시',
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
}
