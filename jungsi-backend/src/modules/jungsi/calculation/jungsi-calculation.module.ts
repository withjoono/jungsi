import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JungsiCalculationController } from './jungsi-calculation.controller';
import { JungsiCalculationService } from './services/jungsi-calculation.service';
import { JungsiDataService } from './services/jungsi-data.service';
import { PercentileLookupService } from './services/percentile-lookup.service';
import { RegularAdmissionEntity } from '../../../database/entities/core/regular-admission.entity';
import { MemberCalculatedScoreEntity } from '../../../database/entities/member/member-calculated-score.entity';
import { MemberJungsiInputScoreEntity } from '../../../database/entities/member/member-jungsi-input-score.entity';
import { MemberJungsiRecruitmentScoreEntity } from '../../../database/entities/member/member-jungsi-recruitment-score.entity';
import { MemberJungsiFactorScoreEntity } from '../../../database/entities/member/member-jungsi-factor-score.entity';
import { RegularAdmissionPreviousResultEntity } from '../../../database/entities/core/regular-admission-previous-result.entity';
import { MockexamStandardScoreEntity } from '../../../database/entities/mock-exam/mockexam-standard-score.entity';
import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([
      RegularAdmissionEntity,
      MemberCalculatedScoreEntity,
      MemberJungsiInputScoreEntity,
      MemberJungsiRecruitmentScoreEntity,
      MemberJungsiFactorScoreEntity,
      RegularAdmissionPreviousResultEntity,
      MockexamStandardScoreEntity,
    ]),
  ],
  controllers: [JungsiCalculationController],
  providers: [JungsiCalculationService, JungsiDataService, PercentileLookupService],
  exports: [JungsiCalculationService, JungsiDataService, PercentileLookupService],
})
export class JungsiCalculationModule {}
