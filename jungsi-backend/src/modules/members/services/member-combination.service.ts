import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecruitmentUnitEntity } from 'src/database/entities/core/recruitment-unit.entity';
import { MemberRecruitmentUnitCombinationEntity } from 'src/database/entities/member/member-recruitment-unit-combination.entity';
import { In, Repository } from 'typeorm';
import {
  CreateMemberRecruitmentUnitCombinationDto,
  UpdateMemberRecruitmentUnitCombinationDto,
} from '../dtos/combination.dto';

@Injectable()
export class MemberRecruitmentUnitCombinationService {
  constructor(
    @InjectRepository(MemberRecruitmentUnitCombinationEntity)
    private combinationRepository: Repository<MemberRecruitmentUnitCombinationEntity>,
    @InjectRepository(RecruitmentUnitEntity)
    private recruitmentUnitRepository: Repository<RecruitmentUnitEntity>,
  ) {}

  async create(
    memberId: string,
    createDto: CreateMemberRecruitmentUnitCombinationDto,
  ): Promise<MemberRecruitmentUnitCombinationEntity> {
    const combination = new MemberRecruitmentUnitCombinationEntity();
    combination.name = createDto.name;
    combination.member = { id: Number(memberId) } as any;

    const recruitmentUnits = await this.recruitmentUnitRepository.find({
      where: {
        id: In(createDto.recruitment_unit_ids),
      },
    });
    if (recruitmentUnits.length !== createDto.recruitment_unit_ids.length) {
      throw new BadRequestException('Some recruitment units were not found');
    }

    combination.recruitment_units = recruitmentUnits;

    return this.combinationRepository.save(combination);
  }

  async findAll(memberId: string): Promise<MemberRecruitmentUnitCombinationEntity[]> {
    return this.combinationRepository.find({
      where: { member: { id: Number(memberId) } },
      relations: [
        'recruitment_units',
        'recruitment_units.admission',
        'recruitment_units.admission.university',
        'recruitment_units.admission.category',
        'recruitment_units.general_field',
        'recruitment_units.interview',
      ],
      order: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number, memberId: string): Promise<MemberRecruitmentUnitCombinationEntity> {
    const combination = await this.combinationRepository.findOne({
      where: { id, member: { id: Number(memberId) } },
      relations: ['recruitment_units'],
    });

    if (!combination) {
      throw new NotFoundException(`Combination with ID "${id}" not found`);
    }

    return combination;
  }

  async update(
    memberId: string,
    id: number,
    updateDto: UpdateMemberRecruitmentUnitCombinationDto,
  ): Promise<MemberRecruitmentUnitCombinationEntity> {
    const combination = await this.findOne(id, memberId);

    combination.name = updateDto.name;

    return this.combinationRepository.save(combination);
  }

  async remove(memberId: string, id: number): Promise<void> {
    const result = await this.combinationRepository.delete({
      id,
      member: { id: Number(memberId) },
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Combination with ID "${id}" not found`);
    }
  }
}
