import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MemberEntity } from './member.entity';

@Entity('ss_user_university_interest')
export class MemberInterestsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  member_id: number;

  @Column({ type: 'varchar', length: 50 })
  target_table:
    | 'susi_subject_tb'
    | 'susi_comprehensive_tb'
    | 'early_subject'
    | 'early_comprehensive';

  @Column({ type: 'bigint' })
  target_id: number;

  @Column({ type: 'int', nullable: true })
  evaluation_id?: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => MemberEntity, (member) => member.interests)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
