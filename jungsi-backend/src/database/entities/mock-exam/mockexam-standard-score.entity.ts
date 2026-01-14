import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { MemberEntity } from '../member/member.entity';
import { MockexamScheduleEntity } from './mockexam-schedule.entity';

// 모의고사 원점수
@Entity('mockexam_standard_score_tb')
@Unique('unique_mock_standard_score', ['subject_code', 'member', 'schedule'])
export class MockexamStandardScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  standard_score: number | null;

  @Column({ type: 'int' })
  grade: number;

  @Column({ type: 'int', nullable: true })
  percentile: number | null;

  @Column({ type: 'varchar', length: 500 })
  subject_code: string;

  @ManyToOne(() => MemberEntity, (member) => member.mockexam_standard_scores, {
    nullable: true,
  })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => MockexamScheduleEntity, (schedule) => schedule.mockexam_standard_scores, {
    nullable: true,
  })
  @JoinColumn({ name: 'schedule_id' })
  schedule: MockexamScheduleEntity;
}
