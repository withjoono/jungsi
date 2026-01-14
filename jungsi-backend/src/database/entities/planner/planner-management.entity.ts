import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

/**
 * 플래너 멤버십 엔티티
 * 학생이 어떤 플래너 클래스에 소속되어 있는지 관리합니다.
 */
@Entity('planner_management_tb')
@Index(['planner_id'])
@Index(['class_code'])
@Index(['use_yn'])
export class PlannerManagementEntity {
  @PrimaryColumn({ type: 'bigint' })
  member_id: number; // 학생 ID

  @PrimaryColumn({ type: 'bigint' })
  planner_id: number; // 플래너 ID

  @PrimaryColumn({ type: 'varchar', length: 10 })
  class_code: string;

  @PrimaryColumn({ type: 'varchar', length: 8 })
  start_date: string; // YYYYMMDD

  @Column({ type: 'varchar', length: 8, nullable: true })
  end_date: string | null; // YYYYMMDD

  @Column({ type: 'char', length: 1, default: 'Y' })
  use_yn: string;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planner_id' })
  planner: MemberEntity;
}
