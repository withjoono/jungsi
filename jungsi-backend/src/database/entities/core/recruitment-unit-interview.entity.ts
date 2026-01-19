import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { RecruitmentUnitEntity } from './recruitment-unit.entity';

@Entity('ss_recruitment_unit_interview', {
  comment: '모집단위별 면접 정보 테이블',
})
export class RecruitmentUnitInterviewEntity {
  @PrimaryGeneratedColumn({ comment: '면접 정보 고유 ID' })
  id: number;

  @OneToOne(() => RecruitmentUnitEntity, (unit) => unit.interview, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recruitment_unit_id' })
  recruitment_unit: RecruitmentUnitEntity;

  @Column({
    type: 'boolean',
    default: false,
    comment: '면접 점수 반영여부 (true: 반영, false: 미반영)',
  })
  is_reflected: boolean;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '면접 유형',
  })
  interview_type: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '면접시 활용자료',
  })
  materials_used: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '면접 진행방식',
  })
  interview_process: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '면접 평가내용',
  })
  evaluation_content: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '면접날짜',
  })
  interview_date: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '면접시간',
  })
  interview_time: string;
}
