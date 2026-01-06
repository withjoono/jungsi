import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from '../members/members.module';
import { MockexamScheduleEntity } from 'src/database/entities/mock-exam/mockexam-schedule.entity';
import { MockexamRawScoreEntity } from 'src/database/entities/mock-exam/mockexam-raw-score.entity';
import { MockexamScoreEntity } from 'src/database/entities/mock-exam/mockexam-score.entity';
import { MockExamService } from './mock-exam.service';
import { MockexamController } from './mock-exam.controller';
import { MockexamRawToStandardEntity } from 'src/database/entities/mock-exam/mockexam-raw-to-standard.entity';
import { MockexamStandardScoreEntity } from 'src/database/entities/mock-exam/mockexam-standard-score.entity';
import { JungsiCalculationModule } from '../jungsi/calculation/jungsi-calculation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MockexamScheduleEntity,
      MockexamRawScoreEntity,
      MockexamScoreEntity,
      MockexamRawToStandardEntity,
      MockexamStandardScoreEntity,
    ]),
    MembersModule,
    JungsiCalculationModule,
  ],
  providers: [MockExamService],
  controllers: [MockexamController],
  exports: [MockExamService],
})
export class MockexamModule {}
