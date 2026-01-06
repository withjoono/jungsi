import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('application_rate_history')
@Index(['universityCode', 'departmentName', 'recordedAt'])
export class ApplicationRateHistory {
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

  @Column({ name: 'previous_application_count', type: 'int', default: 0 })
  previousApplicationCount: number;

  @Column({ name: 'competition_rate', type: 'decimal', precision: 10, scale: 2, default: 0 })
  competitionRate: number;

  @Column({ name: 'previous_competition_rate', type: 'decimal', precision: 10, scale: 2, default: 0 })
  previousCompetitionRate: number;

  @Column({ name: 'change_amount', type: 'int', default: 0 })
  changeAmount: number;

  @Column({ name: 'recorded_at', type: 'timestamp' })
  recordedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
