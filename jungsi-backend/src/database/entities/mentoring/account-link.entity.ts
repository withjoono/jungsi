import { CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';

/**
 * 멘토링 계정 연동 엔티티
 * 연동된 계정 쌍을 저장합니다 (멘토-멘티 관계).
 */
@Entity('tr_account_link')
@Index(['member_id'])
@Index(['linked_member_id'])
export class AccountLinkEntity {
  @PrimaryColumn({ type: 'bigint' })
  member_id: number;

  @PrimaryColumn({ type: 'bigint' })
  linked_member_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'linked_member_id' })
  linkedMember: MemberEntity;
}
