import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AdmissionEntity } from './admission.entity';

@Entity('ts_admission_categories', { comment: '중심전형분류 정보 테이블' })
export class AdmissionCategoryEntity {
  @PrimaryGeneratedColumn({ comment: '중심전형분류 고유 ID' })
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '중심전형분류 이름 (예: 학생부종합, 학생부교과)',
  })
  name: string;

  @OneToMany(() => AdmissionEntity, (admission) => admission.category)
  admissions: AdmissionEntity[];
}
