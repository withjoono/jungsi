import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

/**
 * 플래너 클래스 엔티티
 * 플래너(멘토)가 운영하는 클래스 정보를 관리합니다.
 */
@Entity('pl_class')
@Index(['planner_id'])
@Index(['class_code'])
@Index(['use_yn'])
export class PlannerClassEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  planner_id: number; // 플래너(멘토) ID

  @Column({ type: 'varchar', length: 10 })
  class_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  class_name: string | null;

  @Column({ type: 'varchar', length: 8 })
  start_date: string; // YYYYMMDD

  @Column({ type: 'varchar', length: 8, nullable: true })
  end_date: string | null; // YYYYMMDD

  @Column({ type: 'char', length: 1, default: 'Y' })
  use_yn: string;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planner_id' })
  planner: MemberEntity;
}
