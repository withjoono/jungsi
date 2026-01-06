import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { AdmissionEntity } from 'src/database/entities/core/admission.entity';
import { RecruitmentUnitEntity } from 'src/database/entities/core/recruitment-unit.entity';

@Injectable()
export class ExploreEarlySubjectService {
  constructor(
    @InjectRepository(AdmissionEntity)
    private readonly admissionRepository: Repository<AdmissionEntity>,
    @InjectRepository(RecruitmentUnitEntity)
    private readonly recruitmentUnitRepository: Repository<RecruitmentUnitEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getStep1(year: string, basicType: '일반' | '특별') {
    const cacheKey = `explore-early-subject:step1:${year}-${basicType}`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const queryBuilder = this.admissionRepository
      .createQueryBuilder('admission')
      .leftJoinAndSelect('admission.university', 'university')
      .leftJoinAndSelect('admission.category', 'category')
      .leftJoinAndSelect('admission.subtypes', 'subtypes')
      .leftJoinAndSelect('admission.recruitment_units', 'recruitmentUnit')
      .leftJoinAndSelect('recruitmentUnit.general_field', 'generalField')
      .leftJoinAndSelect('recruitmentUnit.scores', 'scores')
      .where('admission.year = :year', { year })
      .andWhere('admission.basic_type = :basicType', { basicType })
      .andWhere('admission.category.id = :categoryId', { categoryId: 1 });

    const admissions = await queryBuilder.getMany();
    const groupedData = this.groupAdmissionData(admissions);

    await this.cacheManager.set(cacheKey, { items: groupedData }, 120 * 60 * 1000); // 120분 캐시

    return { items: groupedData };
  }

  async getStep2(recruitmentUnitIds: number[]) {
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
      general_field: {
        id: unit.general_field.id,
        name: unit.general_field.name,
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

  async getStep3(recruitmentUnitIds: number[]) {
    const queryBuilder = this.recruitmentUnitRepository
      .createQueryBuilder('recruitmentUnit')
      .leftJoinAndSelect('recruitmentUnit.admission', 'admission')
      .leftJoinAndSelect('admission.university', 'university')
      .leftJoinAndSelect('admission.method', 'method')
      .leftJoinAndSelect('recruitmentUnit.general_field', 'generalField')
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
      general_field: {
        id: unit.general_field.id,
        name: unit.general_field.name,
      },
      name: unit.name,
      method: {
        method_description: unit.admission.method.method_description,
        subject_ratio: unit.admission.method.subject_ratio,
        document_ratio: unit.admission.method.document_ratio,
        interview_ratio: unit.admission.method.interview_ratio,
        practical_ratio: unit.admission.method.practical_ratio,
      },
    }));

    return { items };
  }

  async getStep4(recruitmentUnitIds: number[]) {
    const queryBuilder = this.recruitmentUnitRepository
      .createQueryBuilder('recruitmentUnit')
      .leftJoinAndSelect('recruitmentUnit.admission', 'admission')
      .leftJoinAndSelect('admission.university', 'university')
      .leftJoinAndSelect('recruitmentUnit.general_field', 'generalField')
      .leftJoinAndSelect('recruitmentUnit.scores', 'scores')
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

    return { items };
  }

  async getStep5(recruitmentUnitIds: number[]) {
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
        'previous_results',
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
      previous_results: recruitmentUnit.previous_results,
    };
  }

  private groupAdmissionData(admissions: AdmissionEntity[]) {
    const groupedMap = new Map();

    admissions.forEach((admission) => {
      admission.recruitment_units.forEach((recruitmentUnit) => {
        const key = `${admission.id}-${recruitmentUnit.general_field.id}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            id: admission.id,
            university: admission.university,
            name: admission.name,
            year: admission.year,
            basic_type: admission.basic_type,
            category: admission.category,
            subtype_ids: admission.subtypes.map((n) => n.id),
            general_type: recruitmentUnit.general_field,
            min_cut: null,
            max_cut: null,
            recruitment_unit_ids: [],
          });
        }

        const group = groupedMap.get(key);
        const scores = recruitmentUnit.scores;

        let grade_cut = null;
        if (scores) {
          // 문자열을 숫자로 변환
          grade_cut = parseFloat(scores.grade_50_cut + '');
        }

        if (!isNaN(grade_cut) && grade_cut >= 1 && grade_cut <= 9) {
          if (group.min_cut === null || grade_cut < group.min_cut) {
            group.min_cut = grade_cut;
          }
          if (group.max_cut === null || grade_cut > group.max_cut) {
            group.max_cut = grade_cut;
          }
        }

        group.recruitment_unit_ids.push(recruitmentUnit.id);
      });
    });

    return Array.from(groupedMap.values()).map((group) => {
      if (group.min_cut !== null && group.max_cut !== null) {
        if (group.min_cut === group.max_cut) {
          group.max_cut = Math.min(group.max_cut + 0.05, 9);
        }
        return {
          ...group,
          min_cut: parseFloat(group.min_cut.toFixed(2)),
          max_cut: parseFloat(group.max_cut.toFixed(2)),
        };
      }
      return {
        ...group,
        min_cut: null,
        max_cut: null,
      };
    });
  }
}
