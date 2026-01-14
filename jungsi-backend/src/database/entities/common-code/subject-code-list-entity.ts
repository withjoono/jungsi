import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('earlyd_subject_code_list_tb')
export class SubjectCodeListEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'main_subject_code', type: 'varchar', length: 500 })
  main_subject_code: string;

  @Column({ name: 'main_subject_name', type: 'varchar', length: 500 })
  main_subject_name: string;

  @Column({ name: 'subject_code', type: 'varchar', length: 500 })
  subject_code: string;

  @Column({ name: 'subject_name', type: 'varchar', length: 500 })
  subject_name: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: '평가방식 (0: 석차등급, 1: 성취도)',
  })
  type: number | null;

  @Column({
    name: 'course_type',
    type: 'smallint',
    default: 0,
    comment: '과목 종류 (0: 공통일반, 1: 일반선택, 2: 진로선택, 3: 전문교과1, 4: 전문교과2)',
  })
  course_type: number;

  @Column({
    name: 'is_required',
    type: 'boolean',
    default: false,
    comment: '필수 과목 여부 (false: 선택, true: 필수)',
  })
  is_required: boolean;
}
