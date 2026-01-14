import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficerEvaluationService } from './services/officer-evaluation.service';
import { OfficerEvaluationController } from './controllers/officer-evaluation.controller';
import { OfficerEvaluationSurveyEntity } from 'src/database/entities/officer-evaluation/officer-evaluation-survey.entity';
import { OfficerEvaluationCommentEntity } from 'src/database/entities/officer-evaluation/officer-evaluation-comment.entity';
import { OfficerEvaluationScoreEntity } from 'src/database/entities/officer-evaluation/officer-evaluation-score.entity';
import { OfficerEvaluationEntity } from 'src/database/entities/officer-evaluation/officer-evaluation.entity';
import { MembersModule } from '../members/members.module';
import { OfficerListEntity } from 'src/database/entities/officer-evaluation/officer-list.entity';
import { OfficerTicketEntity } from 'src/database/entities/officer-evaluation/officer-ticket.entity';
import { SchoolRecordSubjectLearningEntity } from 'src/database/entities/schoolrecord/schoolrecord-subject-learning.entity';
import { SmsModule } from '../sms/sms.module';
import { OfficerService } from './services/officer.service';
import { OfficerController } from './controllers/officer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfficerEvaluationSurveyEntity,
      OfficerEvaluationCommentEntity,
      OfficerEvaluationScoreEntity,
      OfficerEvaluationEntity,
      OfficerListEntity,
      OfficerTicketEntity,
      SchoolRecordSubjectLearningEntity,
    ]),
    MembersModule,
    SmsModule,
  ],
  providers: [OfficerEvaluationService, OfficerService],
  controllers: [OfficerEvaluationController, OfficerController],
  exports: [OfficerEvaluationService],
})
export class OfficerModule {}
