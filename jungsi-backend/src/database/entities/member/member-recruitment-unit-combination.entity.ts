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
import { RecruitmentUnitEntity } from '../core/recruitment-unit.entity';

@Entity('ss_user_application_combination')
export class MemberRecruitmentUnitCombinationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '조합 이름' })
  name: string;

  @ManyToOne(() => MemberEntity, (member) => member.combinations)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToMany(() => RecruitmentUnitEntity)
  @JoinTable({
    name: 'ss_user_recruitment_unit_combination_items',
    joinColumn: {
      name: 'combination_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'recruitment_unit_id',
      referencedColumnName: 'id',
    },
  })
  recruitment_units: RecruitmentUnitEntity[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updated_at: Date;
}
