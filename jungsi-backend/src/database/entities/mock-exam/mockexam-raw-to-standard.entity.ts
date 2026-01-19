import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('js_raw_to_standard')
export class MockexamRawToStandardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  code: string;

  @Column({ type: 'int', nullable: true })
  grade: number | null;

  @Column({ type: 'float' })
  percentile: number;

  @Column({ length: 500 })
  raw_score_common: string;

  @Column({ length: 500 })
  raw_score_select: string;

  @Column({ length: 500 })
  standard_score: string;

  @Column({ type: 'float' })
  top_cumulative: number;
}
