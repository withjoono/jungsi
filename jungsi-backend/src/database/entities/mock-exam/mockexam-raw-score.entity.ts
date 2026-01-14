import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  Index,
  JoinColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';
import { MockexamScheduleEntity } from './mockexam-schedule.entity';

// 모의고사 원점수
@Entity('mockexam_raw_score_tb')
@Unique('unique_mock_raw_score', ['subject_code', 'member', 'schedule'])
@Index('FKrnh66ujfb1ufu3cns2fsgllje', ['member'])
@Index('FK7u12dq9x1x8ln2t2559lcnphu', ['schedule'])
export class MockexamRawScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  raw_score: string;

  @Column({ type: 'varchar', length: 500 })
  subject_code: string;

  @ManyToOne(() => MemberEntity, (member) => member.mockexam_row_scores, {
    nullable: true,
  })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => MockexamScheduleEntity, (schedule) => schedule.mockexam_raw_scores, {
    nullable: true,
  })
  @JoinColumn({ name: 'schedule_id' })
  schedule: MockexamScheduleEntity;
}
