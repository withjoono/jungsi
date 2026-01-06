import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberInterestsEntity } from 'src/database/entities/member/member-interests';
import { In, Repository } from 'typeorm';
import { InterestSusiSubjectResponse } from '../dtos/interest-susi-subject-response';
import { SuSiSubjectEntity } from 'src/database/entities/susi/susi-subject.entity';
import { SusiComprehensiveEntity } from 'src/database/entities/susi/susi-comprehensive.entity';
import { InterestSusiComprehensiveResponse } from '../dtos/interest-susi-comprehensive-response';
import { RecruitmentUnitEntity } from 'src/database/entities/core/recruitment-unit.entity';

@Injectable()
export class MemberInterestsService {
  constructor(
    @InjectRepository(MemberInterestsEntity)
    private readonly memberInterestsRepository: Repository<MemberInterestsEntity>,
    @InjectRepository(SuSiSubjectEntity)
    private readonly susiSubjectRepository: Repository<SuSiSubjectEntity>,
    @InjectRepository(SusiComprehensiveEntity)
    private readonly susiComprehensiveRepository: Repository<SusiComprehensiveEntity>,
    @InjectRepository(RecruitmentUnitEntity)
    private readonly recruitmentUnitRepository: Repository<RecruitmentUnitEntity>,
  ) {}

  async addInterest(
    memberId: number,
    targetTable:
      | 'susi_comprehensive_tb'
      | 'susi_subject_tb'
      | 'early_subject'
      | 'early_comprehensive',
    targetIds: number[],
    evaluation_id?: number,
  ): Promise<MemberInterestsEntity[]> {
    const existingInterests = await this.memberInterestsRepository.find({
      where: {
        member_id: memberId,
        target_table: targetTable,
        target_id: In(targetIds),
      },
    });

    const existingTargetIds = existingInterests.map((interest) => Number(interest.target_id));
    const newTargetIds = targetIds.filter((id) => !existingTargetIds.includes(id));

    const newInterests = newTargetIds.map((targetId) =>
      this.memberInterestsRepository.create({
        member_id: memberId,
        target_table: targetTable,
        target_id: targetId,
        evaluation_id: evaluation_id,
      }),
    );

    return await this.memberInterestsRepository.save(newInterests);
  }

  async removeInterest(
    memberId: number,
    targetTable:
      | 'susi_comprehensive_tb'
      | 'susi_subject_tb'
      | 'early_subject'
      | 'early_comprehensive',
    targetIds: number[],
  ): Promise<void> {
    await this.memberInterestsRepository.delete({
      member_id: memberId,
      target_table: targetTable,
      target_id: In(targetIds),
    });
  }

  // 수시교과 관심목록 조회
  async getSusiSubject(memberId: number): Promise<InterestSusiSubjectResponse[]> {
    const interestItems = await this.memberInterestsRepository.find({
      where: { member_id: memberId, target_table: 'early_subject' },
    });

    const data = await this.susiSubjectRepository.find({
      where: { id: In(interestItems.map((n) => Number(n.target_id))) },
      select: {
        id: true,
        university_name: true,
        type_name: true,
        recruitment_unit_name: true,
        // + 전형총점?
        converted_score_cut: true,
        converted_score_total: true,
        non_subject_cut: true,

        risk_level_minus1: true,
        risk_level_minus2: true,
        risk_level_minus3: true,
        risk_level_minus4: true,
        risk_level_minus5: true,
        risk_level_plus1: true,
        risk_level_plus2: true,
        risk_level_plus3: true,
        risk_level_plus4: true,
        risk_level_plus5: true,
      },
    });

    return data as InterestSusiSubjectResponse[];
  }

  // 수시학종 관심목록 조회
  async getSusiComprehensive(memberId: number): Promise<InterestSusiComprehensiveResponse[]> {
    const interestItems = await this.memberInterestsRepository.find({
      where: { member_id: memberId, target_table: 'susi_comprehensive_tb' },
    });

    const data = await this.susiComprehensiveRepository.find({
      where: { id: In(interestItems.map((n) => Number(n.target_id))) },
    });
    return data.map((d) => {
      return {
        susi_comprehensive: d,
        evaluation_id: interestItems.filter((n) => Number(n.target_id) === d.id)[0].evaluation_id,
      };
    }) as InterestSusiComprehensiveResponse[];
  }

  // 관심목록 조회
  async getIntersetRecruitmentUnits(
    memberId: number,
    admissionType:
      | 'susi_subject_tb'
      | 'susi_comprehensive_tb'
      | 'early_subject'
      | 'early_comprehensive',
  ) {
    const interestItems = await this.memberInterestsRepository.find({
      where: { member_id: memberId, target_table: admissionType },
    });

    const recruitmentUnits = await this.recruitmentUnitRepository.find({
      where: { id: In(interestItems.map((n) => Number(n.target_id))) },
      relations: [
        'admission',
        'admission.university',
        'admission.method',
        'general_field',
        'minor_field',
        'minor_field.mid_field',
        'minor_field.mid_field.major_field',
        'scores',
      ],
    });

    return recruitmentUnits.map((unit) => {
      const interestItem = interestItems.find((item) => Number(item.target_id) === unit.id);

      return {
        evaluation_id: interestItem?.evaluation_id,
        recruitmentUnit: {
          id: unit.id,
          name: unit.name,
          recruitment_number: unit.recruitment_number,
          general_field: unit.general_field,
          fields: {
            major: unit?.minor_field?.mid_field?.major_field,
            mid: unit?.minor_field?.mid_field,
            minor: unit?.minor_field,
          },
          university: {
            id: unit.admission.university.id,
            name: unit.admission.university.name,
            region: unit.admission.university.region,
            code: unit.admission.university.code,
            establishment_type: unit.admission.university.establishment_type,
          },
          admission: {
            id: unit.admission.id,
            name: unit.admission.name,
            year: unit.admission.year,
            basic_type: unit.admission.basic_type,
          },
          admission_method: {
            method_description: unit.admission.method.method_description,
            subject_ratio: unit.admission.method.subject_ratio,
            document_ratio: unit.admission.method.document_ratio,
            interview_ratio: unit.admission.method.interview_ratio,
            practical_ratio: unit.admission.method.practical_ratio,
            other_details: unit.admission.method.other_details,
            second_stage_first_ratio: unit.admission.method.second_stage_first_ratio,
            second_stage_interview_ratio: unit.admission.method.second_stage_interview_ratio,
            second_stage_other_ratio: unit.admission.method.second_stage_other_ratio,
            second_stage_other_details: unit.admission.method.second_stage_other_details,
            eligibility: unit.admission.method.eligibility,
            school_record_evaluation_score: unit.admission.method.school_record_evaluation_score,
            school_record_evaluation_elements:
              unit.admission.method.school_record_evaluation_elements,
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
        },
      };
    });
  }
}
