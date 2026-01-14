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

// 모의고사 표준점수
@Entity('mockexam_marks_tb')
@Unique('mockexam_marks_tb_UN', ['subject_code', 'member', 'schedule'])
@Index('FKnxd2cq5t1ueyg5tg39s1gt10v', ['member'])
@Index('FKesul5u5vlua3mvqg1jlda6xa', ['schedule'])
export class MockexamScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  marks_score: string;

  @Column({ type: 'varchar', length: 500 })
  subject_code: string;

  @ManyToOne(() => MemberEntity, (member) => member.mockexam_scores, {
    nullable: true,
  })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => MockexamScheduleEntity, (schedule) => schedule.mockexam_scores, {
    nullable: true,
  })
  @JoinColumn({ name: 'schedule_id' })
  schedule: MockexamScheduleEntity;
}
