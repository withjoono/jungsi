import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MidFieldEntity } from './mid-field.entity';

@Entity('ss_major_field', {
  comment: '대학 대계열(예: 인문계열, 자연계열) 정보를 저장하는 테이블',
})
export class MajorFieldEntity {
  @PrimaryGeneratedColumn({ comment: '대계열 고유 ID' })
  id: number;

  @Column({
    type: 'varchar',
    unique: true,
    length: 100,
    comment: '대계열 이름',
  })
  name: string;

  @OneToMany(() => MidFieldEntity, (midField) => midField.major_field)
  mid_fields: MidFieldEntity[];
}
