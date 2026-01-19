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
 * 정시 입력 성적 테이블
 * - 사용자가 입력한 수능 성적 (표준점수, 등급, 백분위)
 * - 계열 및 선택과목 정보
 * - 이 데이터를 기반으로 대학별 환산점수 계산
 */
@Entity('js_user_input_scores', { comment: '정시 입력 성적' })
@Index(['member_id'], { unique: true })
export class MemberJungsiInputScoreEntity {
  @PrimaryGeneratedColumn({ comment: '입력 성적 고유 ID' })
  id: number;

  @Column({ type: 'int', comment: '회원 ID' })
  member_id: number;

  // ========== 계열 및 선택과목 정보 ==========
  @Column({ type: 'varchar', length: 20, comment: '계열 (인문/자연)' })
  major_type: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '국어 선택과목 (화작/언매)',
    nullable: true,
  })
  korean_elective: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '수학 선택과목 (확통/미적/기하)',
    nullable: true,
  })
  math_elective: string;

  // ========== 국어 ==========
  @Column({ type: 'int', comment: '국어 표준점수', nullable: true })
  korean_standard_score: number;

  @Column({ type: 'int', comment: '국어 등급', nullable: true })
  korean_grade: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    comment: '국어 백분위',
    nullable: true,
  })
  korean_percentile: number;

  // ========== 수학 ==========
  @Column({ type: 'int', comment: '수학 표준점수', nullable: true })
  math_standard_score: number;

  @Column({ type: 'int', comment: '수학 등급', nullable: true })
  math_grade: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    comment: '수학 백분위',
    nullable: true,
  })
  math_percentile: number;

  // ========== 영어 ==========
  @Column({ type: 'int', comment: '영어 등급', nullable: true })
  english_grade: number;

  // ========== 탐구1 ==========
  @Column({
    type: 'varchar',
    length: 50,
    comment: '탐구1 과목명',
    nullable: true,
  })
  research1_subject: string;

  @Column({ type: 'int', comment: '탐구1 표준점수', nullable: true })
  research1_standard_score: number;

  @Column({ type: 'int', comment: '탐구1 등급', nullable: true })
  research1_grade: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    comment: '탐구1 백분위',
    nullable: true,
  })
  research1_percentile: number;

  // ========== 탐구2 ==========
  @Column({
    type: 'varchar',
    length: 50,
    comment: '탐구2 과목명',
    nullable: true,
  })
  research2_subject: string;

  @Column({ type: 'int', comment: '탐구2 표준점수', nullable: true })
  research2_standard_score: number;

  @Column({ type: 'int', comment: '탐구2 등급', nullable: true })
  research2_grade: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    comment: '탐구2 백분위',
    nullable: true,
  })
  research2_percentile: number;

  // ========== 한국사 ==========
  @Column({ type: 'int', comment: '한국사 등급', nullable: true })
  korean_history_grade: number;

  // ========== 제2외국어/한문 ==========
  @Column({
    type: 'varchar',
    length: 50,
    comment: '제2외국어 과목명',
    nullable: true,
  })
  second_foreign_subject: string;

  @Column({ type: 'int', comment: '제2외국어 표준점수', nullable: true })
  second_foreign_standard_score: number;

  @Column({ type: 'int', comment: '제2외국어 등급', nullable: true })
  second_foreign_grade: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    comment: '제2외국어 백분위',
    nullable: true,
  })
  second_foreign_percentile: number;

  // ========== 메타 정보 ==========
  @Column({ type: 'int', comment: '적용 년도', default: 2026 })
  year: number;

  @CreateDateColumn({ comment: '생성일시' })
  created_at: Date;

  @UpdateDateColumn({ comment: '수정일시' })
  updated_at: Date;

  // ========== Relations ==========
  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
