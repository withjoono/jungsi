import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { MajorFieldEntity } from './major-field.entity';
import { MinorFieldEntity } from './minor-field.entity';

@Entity('ss_mid_field', {
  comment: '대학 중계열(예: 경영·경제, 건축) 정보를 저장하는 테이블',
})
@Unique('uk_ts_mid_fields_name_major_field', ['name', 'major_field'])
export class MidFieldEntity {
  @PrimaryGeneratedColumn({ comment: '중계열 고유 ID' })
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '중계열 이름' })
  name: string;

  @ManyToOne(() => MajorFieldEntity, (majorField) => majorField.mid_fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'major_field_id' })
  major_field: MajorFieldEntity;

  @Column({ name: 'major_field_id', nullable: true })
  major_field_id: number;

  @OneToMany(() => MinorFieldEntity, (minorField) => minorField.mid_field)
  minor_fields: MinorFieldEntity[];
}
