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

/**
 * 사용자별 대학 환산점수 저장 테이블
 * - 정시 환산점수를 미리 계산하여 저장
 * - 사용자가 모의고사 점수를 변경하면 재계산 필요
 */
@Entity('ts_member_jungsi_calculated_scores', { comment: '정시 환산인자별 사용자 환산점수' })
@Index(['member_id', 'university_id', 'score_calculation_code'], { unique: true })
@Index(['member_id'])
export class MemberCalculatedScoreEntity {
  @PrimaryGeneratedColumn({ comment: '환산점수 고유 ID' })
  id: number;

  @Column({ type: 'int', comment: '회원 ID' })
  member_id: number;

  @Column({ type: 'int', comment: '대학 ID' })
  university_id: number;

  @Column({ type: 'varchar', length: 100, comment: '대학명' })
  university_name: string;

  @Column({ type: 'varchar', length: 100, comment: '환산식 코드명' })
  score_calculation: string;

  @Column({ type: 'varchar', length: 10, comment: '환산식 코드 (SC001)' })
  score_calculation_code: string;

  @Column({ type: 'varchar', length: 50, comment: '계열 (인문/자연)' })
  major: string;

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
    comment: '표점합',
    default: 0,
  })
  standard_score_sum: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    comment: '최적 선택과목 조합 점수',
    default: 0,
  })
  optimal_score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    comment: '유불리 점수 차이 (optimal_score - converted_score)',
    default: 0,
  })
  score_difference: number;

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

  // Relations
  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => UniversityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'university_id' })
  university: UniversityEntity;
}
