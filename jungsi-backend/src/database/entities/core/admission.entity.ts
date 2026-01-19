import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Unique,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AdmissionCategoryEntity } from './admission-category.entity';
import { AdmissionSubtypeEntity } from './admission-subtype.entity';
import { AdmissionMethodEntity } from './admission-method.entity';
import { RecruitmentUnitEntity } from './recruitment-unit.entity';
import { UniversityEntity } from './university.entity';

@Entity('ss_admission', { comment: '대학 입학전형 정보 테이블' })
@Unique('uk_ts_admissions_name_year_university_category', [
  'name',
  'year',
  'university',
  'category',
])
export class AdmissionEntity {
  @PrimaryGeneratedColumn({ comment: '전형 고유 ID' })
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '전형 이름 (예: 일반전형, 학교장추천전형, 고른기회전형)',
  })
  name: string;

  @Column({ type: 'int', comment: '전형 년도 (예: 2024, 2025)' })
  year: number;

  @Column({
    type: 'enum',
    enum: ['일반', '특별'],
    comment: '전형 기본유형 (일반 또는 특별)',
  })
  basic_type: '일반' | '특별';

  @ManyToOne(() => UniversityEntity, (university) => university.admissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'university_id' })
  university: UniversityEntity;

  @ManyToOne(() => AdmissionCategoryEntity, (category) => category.admissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: AdmissionCategoryEntity;

  @OneToOne(() => AdmissionMethodEntity, (method) => method.admission, {
    cascade: true,
  })
  method: AdmissionMethodEntity;

  @ManyToMany(() => AdmissionSubtypeEntity, (subtype) => subtype.admissions)
  @JoinTable({
    name: 'ss_admission_subtype_relations',
    joinColumn: { name: 'admission_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subtype_id', referencedColumnName: 'id' },
  })
  subtypes: AdmissionSubtypeEntity[];

  @OneToMany(() => RecruitmentUnitEntity, (unit) => unit.admission)
  recruitment_units: RecruitmentUnitEntity[];
}
