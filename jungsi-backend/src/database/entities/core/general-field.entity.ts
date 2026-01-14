import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RecruitmentUnitEntity } from './recruitment-unit.entity';

@Entity('ts_general_fields', {
  comment: '대학 입학전형의 일반 계열 정보 테이블',
})
export class GeneralFieldEntity {
  @PrimaryGeneratedColumn({ comment: '일반 계열 고유 ID' })
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '일반 계열 이름',
  })
  name: string;

  @OneToMany(() => RecruitmentUnitEntity, (unit) => unit.general_field)
  recruitment_units: RecruitmentUnitEntity[];
}
