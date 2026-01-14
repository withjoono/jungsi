import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from 'src/database/entities/member/member.entity';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { AdminMemberResponseDto } from '../dtos/admin-member-repsonse.dto';
import { CommonSearchUtils } from 'src/common/utils/common-search.utils';

@Injectable()
export class AdminMemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
  ) {}

  async getAllMembers(commonSearchQueryDto: CommonSearchQueryDto): Promise<AdminMemberResponseDto> {
    const param = CommonSearchUtils.convertRequestDtoToMapForSearch(
      commonSearchQueryDto,
      this.memberRepository,
    );

    const queryBuilder = this.memberRepository.createQueryBuilder('A');

    if (param.search) {
      queryBuilder.where(param.search);
    }

    if (param.searchSort) {
      queryBuilder.orderBy(param.searchSort.field, param.searchSort.sort);
    }

    queryBuilder.skip((param.page - 1) * param.pageSize).take(param.pageSize);

    const [list, totalCount] = await queryBuilder.getManyAndCount();
    return {
      list: list,
      totalCount,
    };
  }
}
