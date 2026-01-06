import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SusiSubjectService } from './services/susi-subject.service';
import { SusiSubjectController } from './controllers/susi-subject.controller';
import { SuSiSubjectEntity } from 'src/database/entities/susi/susi-subject.entity';
import { SusiComprehensiveService } from './services/susi-comprehensive.service';
import { SusiComprehensiveEntity } from 'src/database/entities/susi/susi-comprehensive.entity';
import { SusiPassRecordEntity } from 'src/database/entities/susi/susi-pass-record.entity';
import { RecruitmentUnitPassFailRecordsEntity } from 'src/database/entities/core/recruitment-unit-pass-fail-record.entity';
import { SusiPassRecordController } from './controllers/susi-pass-record.controller';
import { SusiPassRecordService } from './services/susi-pass-record-service';
import { SusiComprehensiveController } from './controllers/susi-comprehensive.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SuSiSubjectEntity, // 교과
      SusiComprehensiveEntity, // 학종
      SusiPassRecordEntity, // 합불사례

      RecruitmentUnitPassFailRecordsEntity,
    ]),
  ],
  controllers: [SusiSubjectController, SusiComprehensiveController, SusiPassRecordController],
  providers: [SusiSubjectService, SusiComprehensiveService, SusiPassRecordService],
  exports: [SusiSubjectService, SusiComprehensiveService],
})
export class SusiModule {}
