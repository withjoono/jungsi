import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('application_rates')
@Index(['universityCode', 'departmentName', 'admissionType'])
export class ApplicationRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'university_code', length: 20 })
  universityCode: string;

  @Column({ name: 'university_name', length: 100 })
  universityName: string;

  @Column({ name: 'department_name', length: 200 })
  departmentName: string;

  @Column({ name: 'admission_type', length: 100, nullable: true })
  admissionType: string;

  @Column({ name: 'recruitment_count', type: 'int', default: 0 })
  recruitmentCount: number;

  @Column({ name: 'application_count', type: 'int', default: 0 })
  applicationCount: number;

  @Column({ name: 'competition_rate', type: 'decimal', precision: 10, scale: 2, default: 0 })
  competitionRate: number;

  @Column({ name: 'source_url', length: 500 })
  sourceUrl: string;

  @Column({ name: 'crawled_at', type: 'timestamp' })
  crawledAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
