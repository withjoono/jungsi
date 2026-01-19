import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { RecruitmentUnitEntity } from './recruitment-unit.entity';

@Entity('ss_recruitment_unit_minimum_grade', {
  comment: '모집단위별 최저등급 정보 테이블',
})
export class RecruitmentUnitMinimumGradeEntity {
  @PrimaryGeneratedColumn({ comment: '최저등급 정보 고유 ID' })
  id: number;

  @OneToOne(() => RecruitmentUnitEntity, (unit) => unit.minimum_grade, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recruitment_unit_id' })
  recruitmentUnit: RecruitmentUnitEntity;

  @Column({
    type: 'enum',
    enum: ['Y', 'N'],
    comment: '최저학력기준 반영여부',
  })
  is_applied: 'Y' | 'N';

  @Column({
    type: 'text',
    nullable: true,
    comment: '수능 최저학력기준 설명',
  })
  description: string;
}
