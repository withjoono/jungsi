import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RegularAdmissionEntity } from 'src/database/entities/core/regular-admission.entity';
import {
  CreateMemberRegularCombinationDto,
  UpdateMemberRegularCombinationDto,
} from '../dtos/regular-combination.dto';
import { MemberRegularCombinationEntity } from 'src/database/entities/member/member-regular-combination.entity';

@Injectable()
export class MemberRegularCombinationService {
  constructor(
    @InjectRepository(MemberRegularCombinationEntity)
    private combinationRepository: Repository<MemberRegularCombinationEntity>,
    @InjectRepository(RegularAdmissionEntity)
    private regularAdmissionRepository: Repository<RegularAdmissionEntity>,
  ) {}

  async create(
    memberId: string,
    createDto: CreateMemberRegularCombinationDto,
  ): Promise<MemberRegularCombinationEntity> {
    const combination = new MemberRegularCombinationEntity();
    combination.name = createDto.name;
    combination.member = { id: Number(memberId) } as any;

    const admissions = await this.regularAdmissionRepository.find({
      where: {
        id: In(createDto.ids),
      },
    });
    if (admissions.length !== createDto.ids.length) {
      throw new BadRequestException('Some recruitment units were not found');
    }

    combination.regular_admissions = admissions;

    return this.combinationRepository.save(combination);
  }

  async findAll(memberId: string): Promise<MemberRegularCombinationEntity[]> {
    return this.combinationRepository.find({
      where: { member: { id: Number(memberId) } },
      relations: ['regular_admissions', 'regular_admissions.university'],
      order: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number, memberId: string): Promise<MemberRegularCombinationEntity> {
    const combination = await this.combinationRepository.findOne({
      where: { id, member: { id: Number(memberId) } },
      relations: ['regular_admissions', 'regular_admissions.university'],
    });

    if (!combination) {
      throw new NotFoundException(`Combination with ID "${id}" not found`);
    }

    return combination;
  }

  async update(
    memberId: string,
    id: number,
    updateDto: UpdateMemberRegularCombinationDto,
  ): Promise<MemberRegularCombinationEntity> {
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
