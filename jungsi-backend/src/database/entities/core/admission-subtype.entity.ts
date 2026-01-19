import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { AdmissionEntity } from './admission.entity';

@Entity('ss_admission_subtype', { comment: '전형 세부유형 정보 테이블' })
export class AdmissionSubtypeEntity {
  @PrimaryGeneratedColumn({ comment: '전형 세부유형 고유 ID' })
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '전형 세부유형 이름 (예: 농어촌, 특기자)',
  })
  name: string;

  @ManyToMany(() => AdmissionEntity, (admission) => admission.subtypes)
  admissions: AdmissionEntity[];
}
