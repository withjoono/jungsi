import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberEntity } from '../member/member.entity';
import { PlannerClassEntity } from './planner-class.entity';

/**
 * 플래너 학생관리 엔티티 (멘토-학생 연결)
 */
@Entity('planner_management_tb')
@Index(['classId', 'studentId'], { unique: true })
@Index(['studentId'])
export class PlannerManagementEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'class_id', type: 'bigint' })
  classId: number;

  @Column({ name: 'student_id', type: 'bigint' })
  studentId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // 관계
  @ManyToOne(() => PlannerClassEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: PlannerClassEntity;

  @ManyToOne(() => MemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: MemberEntity;
}
