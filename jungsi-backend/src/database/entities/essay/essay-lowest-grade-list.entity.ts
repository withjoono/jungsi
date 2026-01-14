import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('essay_lowest_grade_list_tb')
export class EssayLowestGradeListEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 1000 })
  college_code: string;

  @Column({ type: 'varchar', length: 1000 })
  content: string;

  @Column({ type: 'bigint', nullable: true })
  essay_id: number | null;

  @Column({ type: 'int' })
  lowest_cal: number;

  @Column({ type: 'int' })
  lowest_count: number;

  @Column({ type: 'int' })
  lowest_english: number;

  @Column({ type: 'int' })
  lowest_history: number;

  @Column({ type: 'int' })
  lowest_korean: number;

  @Column({ type: 'int' })
  lowest_math: number;

  @Column({ type: 'int' })
  lowest_migi: number;

  @Column({ type: 'int' })
  lowest_science: number;

  @Column({ type: 'int' })
  lowest_society: number;

  @Column({ type: 'int' })
  lowest_sum: number;

  @Column({ type: 'int' })
  lowest_use: number;
}
