import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecruitmentUnitPassFailRecordsEntity } from 'src/database/entities/core/recruitment-unit-pass-fail-record.entity';

@Injectable()
export class SusiPassRecordService {
  constructor(
    @InjectRepository(RecruitmentUnitPassFailRecordsEntity)
    private readonly passRecordRepository: Repository<RecruitmentUnitPassFailRecordsEntity>,
  ) {}

  getPassRecordsByRecruitmentUnitId(recruitmentUnitId: number) {
    const items = this.passRecordRepository.find({
      where: { recruitmentUnit: { id: recruitmentUnitId } },
    });

    return items;
  }
}
