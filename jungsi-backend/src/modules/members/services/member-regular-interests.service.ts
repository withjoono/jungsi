import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MemberRegularInterestsEntity } from 'src/database/entities/member/member-regular-interests';
import { RegularAdmissionEntity } from 'src/database/entities/core/regular-admission.entity';

@Injectable()
export class MemberRegularInterestsService {
  constructor(
    @InjectRepository(MemberRegularInterestsEntity)
    private readonly memberRegularInterestsRepository: Repository<MemberRegularInterestsEntity>,
    @InjectRepository(RegularAdmissionEntity)
    private readonly regularAdmissionRepository: Repository<RegularAdmissionEntity>,
  ) {}

  async addInterest(
    memberId: number,
    admissionType: '가' | '나' | '다',
    targetIds: number[],
  ): Promise<MemberRegularInterestsEntity[]> {
    const existingInterests = await this.memberRegularInterestsRepository.find({
      where: {
        member_id: memberId,
        admission_type: admissionType,
        target_id: In(targetIds),
      },
    });

    const existingTargetIds = existingInterests.map((interest) => Number(interest.target_id));
    const newTargetIds = targetIds.filter((id) => !existingTargetIds.includes(id));

    const newInterests = newTargetIds.map((targetId) =>
      this.memberRegularInterestsRepository.create({
        member_id: memberId,
        admission_type: admissionType,
        target_id: targetId,
      }),
    );

    return await this.memberRegularInterestsRepository.save(newInterests);
  }

  async removeInterest(
    memberId: number,
    admissionType: '가' | '나' | '다',
    targetIds: number[],
  ): Promise<void> {
    await this.memberRegularInterestsRepository.delete({
      member_id: memberId,
      admission_type: admissionType,
      target_id: In(targetIds),
    });
  }

  // 정시 관심목록 조회
  async getRegularInterests(
    memberId: number,
    admissionType: '가' | '나' | '다',
  ): Promise<RegularAdmissionEntity[]> {
    const interestItems = await this.memberRegularInterestsRepository.find({
      where: { member_id: memberId, admission_type: admissionType },
    });

    const data = await this.regularAdmissionRepository.find({
      where: { id: In(interestItems.map((n) => Number(n.target_id))) },
      relations: ['university'],
    });

    return data;
  }
}
