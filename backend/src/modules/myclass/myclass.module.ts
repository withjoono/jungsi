import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyclassController } from './myclass.controller';
import { MyclassService } from './myclass.service';
import { SchoolRecordSubjectLearningEntity } from '../../database/entities/schoolrecord/schoolrecord-subject-learning.entity';
import { MockexamRawScoreEntity } from '../../database/entities/mock-exam/mockexam-raw-score.entity';
import { MockexamScheduleEntity } from '../../database/entities/mock-exam/mockexam-schedule.entity';
import {
  HealthRecordEntity,
  ConsultationEntity,
  AttendanceEntity,
  TestEntity,
} from '../../database/entities/myclass';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchoolRecordSubjectLearningEntity,
      MockexamRawScoreEntity,
      MockexamScheduleEntity,
      HealthRecordEntity,
      ConsultationEntity,
      AttendanceEntity,
      TestEntity,
    ]),
  ],
  controllers: [MyclassController],
  providers: [MyclassService],
  exports: [MyclassService],
})
export class MyclassModule {}
