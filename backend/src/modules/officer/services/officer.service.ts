import { OfficerTicketEntity } from '../../../database/entities/officer-evaluation/officer-ticket.entity';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfficerEvaluationCommentEntity } from 'src/database/entities/officer-evaluation/officer-evaluation-comment.entity';
import { OfficerEvaluationScoreEntity } from 'src/database/entities/officer-evaluation/officer-evaluation-score.entity';
import { OfficerEvaluationSurveyEntity } from 'src/database/entities/officer-evaluation/officer-evaluation-survey.entity';
import { OfficerEvaluationEntity } from 'src/database/entities/officer-evaluation/officer-evaluation.entity';
import { Repository } from 'typeorm';
import { OfficerListEntity } from 'src/database/entities/officer-evaluation/officer-list.entity';
import { SchoolRecordSubjectLearningEntity } from 'src/database/entities/schoolrecord/schoolrecord-subject-learning.entity';
import { SmsService } from '../../sms/sms.service';
import { UpdateOfficerProfileResponseDto } from '../dtos/update-officer-profile.dto';

@Injectable()
export class OfficerService {
  private readonly logger = new Logger(OfficerService.name);
  constructor(
    @InjectRepository(OfficerEvaluationSurveyEntity)
    private officerEvaluationSurveyRepository: Repository<OfficerEvaluationSurveyEntity>,
    @InjectRepository(OfficerEvaluationCommentEntity)
    private officerEvaluationCommentRepository: Repository<OfficerEvaluationCommentEntity>,
    @InjectRepository(OfficerEvaluationScoreEntity)
    private officerEvaluationScoreRepository: Repository<OfficerEvaluationScoreEntity>,
    @InjectRepository(OfficerEvaluationEntity)
    private officerEvaluationRepository: Repository<OfficerEvaluationEntity>,
    @InjectRepository(OfficerListEntity)
    private officerRepository: Repository<OfficerListEntity>,
    @InjectRepository(OfficerTicketEntity)
    private officerTicketRepository: Repository<OfficerTicketEntity>,
    @InjectRepository(SchoolRecordSubjectLearningEntity)
    private schoolRecordSubjectLearningRepository: Repository<SchoolRecordSubjectLearningEntity>,

    private smsService: SmsService,
  ) {}

  /**
   * 사정관인지 체크
   */
  async checkOfficer(memberId: string): Promise<boolean> {
    const officer = await this.officerRepository.findOne({
      where: {
        member_id: Number(memberId),
      },
    });

    if (officer) {
      return true;
    }
    return false;
  }

  async getOfficerProfile(memberId: string): Promise<OfficerListEntity> {
    const officer = await this.officerRepository.findOne({
      where: {
        member_id: Number(memberId),
      },
    });

    if (!officer) {
      throw new BadRequestException('사정관이 아닙니다.');
    }

    return officer;
  }

  async updateOfficerProfile(
    memberId: string,
    data: UpdateOfficerProfileResponseDto,
  ): Promise<OfficerListEntity> {
    const officer = await this.officerRepository.findOne({
      where: {
        member_id: Number(memberId),
      },
    });

    if (!officer) {
      throw new BadRequestException('사정관이 아닙니다.');
    }

    if (data.name) {
      officer.officer_name = data.name;
    }
    if (data.university) {
      officer.university = data.university;
    }
    if (data.education) {
      officer.education = data.education;
    }
    await this.officerRepository.save(officer);
    return officer;
  }
}
