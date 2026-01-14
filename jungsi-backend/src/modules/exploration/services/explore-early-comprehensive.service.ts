import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { RecruitmentUnitEntity } from 'src/database/entities/core/recruitment-unit.entity';

@Injectable()
export class ExploreEarlyComprehensiveService {
  constructor(
    @InjectRepository(RecruitmentUnitEntity)
    private readonly recruitmentUnitRepository: Repository<RecruitmentUnitEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getStep1(year: string, basicType: '일반' | '특별', minorFieldId: string) {
    const cacheKey = `explore-early-comprehensive:step1:${year}-${basicType}-${minorFieldId}`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const queryBuilder = this.recruitmentUnitRepository
      .createQueryBuilder('recruitmentUnit')
      .leftJoinAndSelect('recruitmentUnit.admission', 'admission')
      .leftJoinAndSelect('admission.university', 'university')
      .leftJoinAndSelect('admission.category', 'category')
      .leftJoinAndSelect('admission.subtypes', 'subtypes')
      .leftJoinAndSelect('recruitmentUnit.general_field', 'generalField')
      .leftJoinAndSelect('recruitmentUnit.scores', 'scores')
      .where('recruitmentUnit.minor_field_id = :minorFieldId', {
        minorFieldId,
      })
      .andWhere('admission.year = :year', { year })
      .andWhere('admission.basic_type = :basicType', { basicType })
      .andWhere('admission.category.id = :categoryId', { categoryId: 2 });

    const recruitmentUnits = await queryBuilder.getMany();

    const items = recruitmentUnits.map((unit) => ({
      id: unit.id,
      name: unit.name,
      recruitment_number: unit.recruitment_number,
      university: unit.admission.university,
      admission: unit.admission,
      general_field: {
        id: unit.general_field.id,
        name: unit.general_field.name,
      },
      scores: unit.scores
        ? {
            grade_50_cut: unit.scores.grade_50_cut,
            grade_70_cut: unit.scores.grade_70_cut,
            convert_50_cut: unit.scores.convert_50_cut,
            convert_70_cut: unit.scores.convert_70_cut,
            risk_plus_5: unit.scores.risk_plus_5,
            risk_plus_4: unit.scores.risk_plus_4,
            risk_plus_3: unit.scores.risk_plus_3,
            risk_plus_2: unit.scores.risk_plus_2,
            risk_plus_1: unit.scores.risk_plus_1,
            risk_minus_1: unit.scores.risk_minus_1,
            risk_minus_2: unit.scores.risk_minus_2,
            risk_minus_3: unit.scores.risk_minus_3,
            risk_minus_4: unit.scores.risk_minus_4,
            risk_minus_5: unit.scores.risk_minus_5,
          }
        : null,
    }));

    await this.cacheManager.set(cacheKey, { items }, 120 * 15 * 1000); // 15분 캐시

    return { items };
  }

  async getStep2(recruitmentUnitIds: number[]) {
    if (recruitmentUnitIds.length === 0) {
      return { items: [] };
    }

    const queryBuilder = this.recruitmentUnitRepository
      .createQueryBuilder('recruitmentUnit')
      .leftJoinAndSelect('recruitmentUnit.admission', 'admission')
      .leftJoinAndSelect('recruitmentUnit.general_field', 'general_field')
      .leftJoinAndSelect('admission.university', 'university')
      .leftJoinAndSelect('admission.category', 'category')
      .leftJoinAndSelect('admission.method', 'method')
      .where('recruitmentUnit.id IN (:...ids)', { ids: recruitmentUnitIds });

    const recruitmentUnits = await queryBuilder.getMany();

    const items = recruitmentUnits.map((unit) => ({
      id: unit.id,
      university: unit.admission.university,
      general_field: unit.general_field,
      admission: {
        id: unit.admission.id,
        name: unit.admission.name,
        year: unit.admission.year,
        basic_type: unit.admission.basic_type,
        method: unit.admission.method,
        category: unit.admission.category,
      },
      name: unit.name,
      recruitment_number: unit.recruitment_number,
    }));

    return { items };
  }

  async getStep3(recruitmentUnitIds: number[]) {
    const queryBuilder = this.recruitmentUnitRepository
      .createQueryBuilder('recruitmentUnit')
      .leftJoinAndSelect('recruitmentUnit.admission', 'admission')
      .leftJoinAndSelect('admission.university', 'university')
      .leftJoinAndSelect('recruitmentUnit.general_field', 'generalField')
      .leftJoinAndSelect('recruitmentUnit.minimum_grade', 'minimumGrade')
      .where('recruitmentUnit.id IN (:...ids)', { ids: recruitmentUnitIds });

    const recruitmentUnits = await queryBuilder.getMany();

    const items = recruitmentUnits.map((unit) => ({
      id: unit.id,
      university: unit.admission.university,
      admission: {
        id: unit.admission.id,
        name: unit.admission.name,
        year: unit.admission.year,
        basic_type: unit.admission.basic_type,
      },
      name: unit.name,
      recruitment_number: unit.recruitment_number,
      minimum_grade: unit.minimum_grade
        ? {
            is_applied: unit.minimum_grade.is_applied,
            description: unit.minimum_grade.description,
          }
        : null,
    }));

    return { items };
  }

  async getStep4(recruitmentUnitIds: number[]) {
    const queryBuilder = this.recruitmentUnitRepository
      .createQueryBuilder('recruitmentUnit')
      .leftJoinAndSelect('recruitmentUnit.admission', 'admission')
      .leftJoinAndSelect('admission.university', 'university')
      .leftJoinAndSelect('recruitmentUnit.general_field', 'generalField')
      .leftJoinAndSelect('recruitmentUnit.interview', 'interview')
      .where('recruitmentUnit.id IN (:...ids)', { ids: recruitmentUnitIds });

    const recruitmentUnits = await queryBuilder.getMany();

    const items = recruitmentUnits.map((unit) => ({
      id: unit.id,
      name: unit.name,
      recruitment_number: unit.recruitment_number,
      university: unit.admission.university,
      admission: {
        id: unit.admission.id,
        name: unit.admission.name,
        year: unit.admission.year,
        basic_type: unit.admission.basic_type,
      },
      general_field: {
        id: unit.general_field.id,
        name: unit.general_field.name,
      },
      interview: unit.interview
        ? {
            is_reflected: unit.interview.is_reflected,
            interview_type: unit.interview.interview_type,
            materials_used: unit.interview.materials_used,
            interview_process: unit.interview.interview_process,
            evaluation_content: unit.interview.evaluation_content,
            interview_date: unit.interview.interview_date,
            interview_time: unit.interview.interview_time,
          }
        : null,
    }));

    return { items };
  }

  async getDetail(recruitmentUnitId: number) {
    const recruitmentUnit = await this.recruitmentUnitRepository.findOne({
      where: { id: recruitmentUnitId },
      relations: [
        'admission',
        'admission.university',
        'admission.category',
        'admission.method',
        'admission.subtypes',
        'general_field',
        'minor_field',
        'minor_field.mid_field',
        'minor_field.mid_field.major_field',
        'minimum_grade',
        'interview',
        'scores',
      ],
    });

    if (!recruitmentUnit) {
      throw new NotFoundException(`Recruitment unit with ID "${recruitmentUnitId}" not found`);
    }

    return {
      id: recruitmentUnit.id,
      name: recruitmentUnit.name,
      recruitment_number: recruitmentUnit.recruitment_number,
      university: recruitmentUnit.admission.university,
      admission: {
        id: recruitmentUnit.admission.id,
        name: recruitmentUnit.admission.name,
        year: recruitmentUnit.admission.year,
        basic_type: recruitmentUnit.admission.basic_type,
        category: recruitmentUnit.admission.category,
        subtypes: recruitmentUnit.admission.subtypes,
      },
      admission_method: recruitmentUnit.admission.method,
      general_field: recruitmentUnit.general_field,
      fields: {
        major: recruitmentUnit.minor_field?.mid_field?.major_field,
        mid: recruitmentUnit.minor_field?.mid_field,
        minor: recruitmentUnit.minor_field,
      },
      minimum_grade: recruitmentUnit.minimum_grade,
      interview: recruitmentUnit.interview,
      scores: recruitmentUnit.scores,
    };
  }
}
