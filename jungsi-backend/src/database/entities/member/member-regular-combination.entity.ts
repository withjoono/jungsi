import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MemberEntity } from './member.entity';
import { RegularAdmissionEntity } from '../core/regular-admission.entity';

@Entity('ts_member_regular_combinations')
export class MemberRegularCombinationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '조합 이름' })
  name: string;

  @ManyToOne(() => MemberEntity, (member) => member.combinations)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToMany(() => RegularAdmissionEntity, { cascade: true })
  @JoinTable({
    name: 'ts_member_regular_combination_items',
    joinColumn: {
      name: 'combination_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'regular_admission_id',
      referencedColumnName: 'id',
    },
  })
  regular_admissions: RegularAdmissionEntity[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updated_at: Date;
}
