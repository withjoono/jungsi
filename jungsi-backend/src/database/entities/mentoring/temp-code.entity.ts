import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';

/**
 * 멘토링 임시 코드 엔티티
 * 멘토가 생성한 6자리 연계 코드를 저장합니다.
 * 코드는 5분간 유효합니다.
 */
@Entity('tr_temp_code')
export class TempCodeEntity {
  @PrimaryColumn({ type: 'bigint' })
  member_id: number;

  @Index()
  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Index()
  @Column({ type: 'timestamp' })
  expire_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
