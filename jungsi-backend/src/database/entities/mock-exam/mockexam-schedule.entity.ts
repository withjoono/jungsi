import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique } from 'typeorm';
import { MockexamScoreEntity } from './mockexam-score.entity';
import { MockexamRawScoreEntity } from './mockexam-raw-score.entity';
import { MockexamStandardScoreEntity } from './mockexam-standard-score.entity';

// 모의고사 일정
@Entity('js_pyunggawon_month')
@Unique('unique_mock_schedule', ['mockexam_month', 'mockexam_year'])
export class MockexamScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  mockexam_month: string;

  @Column({ type: 'varchar', length: 50 })
  mockexam_year: string;

  @OneToMany(() => MockexamScoreEntity, (mockexamMarks) => mockexamMarks.schedule)
  mockexam_scores: MockexamScoreEntity[];

  @OneToMany(() => MockexamRawScoreEntity, (mockexamRawScore) => mockexamRawScore.schedule)
  mockexam_raw_scores: MockexamRawScoreEntity[];

  @OneToMany(
    () => MockexamStandardScoreEntity,
    (mockexamStandardScore) => mockexamStandardScore.schedule,
  )
  mockexam_standard_scores: MockexamStandardScoreEntity[];
}
