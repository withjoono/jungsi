import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

/**
 * 멘토링 관리자 클래스 엔티티
 * 멘토-멘티 관계를 양방향으로 저장합니다.
 */
@Entity('mentoring_admin_class_tb')
@Index(['member_id'])
@Index(['target_member_id'])
export class AdminClassEntity {
  @PrimaryColumn({ type: 'bigint' })
  member_id: number;

  @PrimaryColumn({ type: 'bigint' })
  target_member_id: number;

  @Column({ type: 'char', length: 1, default: 'Y' })
  use_yn: string;

  @Column({ type: 'date', nullable: true })
  first_reg_dt: Date | null;

  @Column({ type: 'date', nullable: true })
  last_mod_dt: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  group_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  group_name: string | null;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_member_id' })
  targetMember: MemberEntity;
}
