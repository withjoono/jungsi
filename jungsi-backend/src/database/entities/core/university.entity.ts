import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AdmissionEntity } from './admission.entity';
import { RegularAdmissionEntity } from './regular-admission.entity';

@Entity('ss_university', { comment: '대학 정보 테이블' })
export class UniversityEntity {
  @PrimaryGeneratedColumn({ comment: '대학 고유 ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '지역' })
  region: string;

  @Column({ type: 'varchar', length: 100, comment: '대학명' })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true, comment: '대학코드' })
  code: string;

  @Column({
    type: 'enum',
    enum: ['국립', '사립', ''],
    comment: '대학설립형태',
  })
  establishment_type: '국립' | '사립' | '';

  @OneToMany(() => AdmissionEntity, (admission) => admission.university)
  admissions: AdmissionEntity[];

  @OneToMany(() => RegularAdmissionEntity, (regularAdmission) => regularAdmission.university, {
    cascade: true,
  })
  regular_admissions: RegularAdmissionEntity[];
}
