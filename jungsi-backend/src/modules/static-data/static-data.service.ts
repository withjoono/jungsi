import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { StaticDataDto } from './static-data.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SubjectCodeListEntity } from 'src/database/entities/common-code/subject-code-list-entity';
import { Repository } from 'typeorm';
import { GeneralFieldEntity } from 'src/database/entities/core/general-field.entity';
import { MajorFieldEntity } from 'src/database/entities/core/major-field.entity';
import { MidFieldEntity } from 'src/database/entities/core/mid-field.entity';
import { MinorFieldEntity } from 'src/database/entities/core/minor-field.entity';
import { AdmissionSubtypeEntity } from 'src/database/entities/core/admission-subtype.entity';
import { UniversityEntity } from 'src/database/entities/core/university.entity';
import { AdmissionEntity } from 'src/database/entities/core/admission.entity';
import { RecruitmentUnitEntity } from 'src/database/entities/core/recruitment-unit.entity';

@Injectable()
export class StaticDataService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(SubjectCodeListEntity)
    private subjectCodeRepository: Repository<SubjectCodeListEntity>,
    @InjectRepository(GeneralFieldEntity)
    private generalFieldRepository: Repository<GeneralFieldEntity>,
    @InjectRepository(MajorFieldEntity)
    private majorFieldRepository: Repository<MajorFieldEntity>,
    @InjectRepository(MidFieldEntity)
    private midFieldRepository: Repository<MidFieldEntity>,
    @InjectRepository(MinorFieldEntity)
    private minorFieldRepository: Repository<MinorFieldEntity>,
    @InjectRepository(AdmissionSubtypeEntity)
    private admissionSubtypeRepository: Repository<AdmissionSubtypeEntity>,
    @InjectRepository(UniversityEntity)
    private universityRepository: Repository<UniversityEntity>,
    @InjectRepository(AdmissionEntity)
    private admissionRepository: Repository<AdmissionEntity>,
    @InjectRepository(RecruitmentUnitEntity)
    private recruitmentUnitRepository: Repository<RecruitmentUnitEntity>,
  ) {}

  async getStaticData(): Promise<StaticDataDto> {
    const cachedData = await this.cacheManager.get<StaticDataDto>('staticData');
    if (cachedData) {
      return cachedData;
    }

    const [
      subjectCodes,
      generalFields,
      majorFields,
      midFields,
      minorFields,
      admissionSubtypes,
      universities,
      admissions,
      recruitmentUnits,
    ] = await Promise.all([
      this.subjectCodeRepository.find(),
      this.generalFieldRepository.find(),
      this.majorFieldRepository.find(),
      this.midFieldRepository.find(),
      this.minorFieldRepository.find(),
      this.admissionSubtypeRepository.find(),
      this.universityRepository.find(),
      this.admissionRepository.find(),
      this.recruitmentUnitRepository.find(),
    ]);

    const staticData: StaticDataDto = {
      subjectCodes,
      generalFields,
      majorFields,
      midFields,
      minorFields,
      admissionSubtypes,
      universityNames: [...new Set(universities.map((u) => u.name))],
      admissionNames: [...new Set(admissions.map((a) => a.name))],
      recruitmentUnitNames: [...new Set(recruitmentUnits.map((r) => r.name))],
    };

    // 캐시에 데이터 저장 (1시간 동안 유효)
    await this.cacheManager.set('staticData', staticData, 3600000);

    return staticData;
  }

  async refreshStaticData(): Promise<void> {
    await this.cacheManager.del('staticData');
    await this.getStaticData();
  }
}
