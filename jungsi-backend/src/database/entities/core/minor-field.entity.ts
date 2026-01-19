import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { MidFieldEntity } from './mid-field.entity';
import { RecruitmentUnitEntity } from './recruitment-unit.entity';

@Entity('ss_minor_field', {
  comment: '대학 소계열(예: 경제학, 건축·설비공학) 정보를 저장하는 테이블',
})
@Unique('uk_ts_minor_fields_name_mid_field', ['name', 'mid_field'])
export class MinorFieldEntity {
  @PrimaryGeneratedColumn({ comment: '소계열 고유 ID' })
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '소계열 이름' })
  name: string;

  @ManyToOne(() => MidFieldEntity, (midField) => midField.minor_fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mid_field_id' })
  mid_field: MidFieldEntity;

  @Column({ name: 'mid_field_id', nullable: true })
  mid_field_id: number;

  @OneToMany(() => RecruitmentUnitEntity, (unit) => unit.minor_field)
  recruitment_units: RecruitmentUnitEntity[];
}
