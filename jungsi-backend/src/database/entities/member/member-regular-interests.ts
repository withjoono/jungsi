import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MemberEntity } from './member.entity';

@Entity('js_user_university_interest')
export class MemberRegularInterestsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  member_id: number;

  @Column({ type: 'varchar', length: 50 })
  admission_type: '가' | '나' | '다';

  @Column({ type: 'bigint' })
  target_id: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => MemberEntity, (member) => member.regular_interests)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
