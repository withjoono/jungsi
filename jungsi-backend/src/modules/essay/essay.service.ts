import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EssayListEntity } from 'src/database/entities/essay/essay-list.entity';
import { EssayLowestGradeListEntity } from 'src/database/entities/essay/essay-lowest-grade-list.entity';
import { CommonSearchUtils } from 'src/common/utils/common-search.utils';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { AdminEssayListResponse } from 'src/admin/dtos/admin-essay-list-response.dto';

@Injectable()
export class EssayService {
  constructor(
    @InjectRepository(EssayListEntity)
    private readonly essayListRepository: Repository<EssayListEntity>,
    @InjectRepository(EssayLowestGradeListEntity)
    private readonly essayLowestGradeListRepository: Repository<EssayLowestGradeListEntity>,
  ) {}

  async getEssayListWithLowestGrade(
    commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminEssayListResponse> {
    const param = CommonSearchUtils.convertRequestDtoToMapForSearch(
      commonSearchQueryDto,
      this.essayListRepository,
    );

    // 스프링과 일치시키기 위해 원시 sql문 방식 사용
    let sqlQuery = `
      SELECT A.*
           , B.content
           , B.lowest_cal
           , B.lowest_count
           , B.lowest_english
           , B.lowest_history
           , B.lowest_korean
           , B.lowest_math
           , B.lowest_migi
           , B.lowest_science
           , B.lowest_society
           , B.lowest_sum
           , B.lowest_use
      FROM essay_list_tb A
      LEFT JOIN essay_lowest_grade_list_tb B ON A.id = B.essay_id
    `;

    if (param.search) {
      sqlQuery += ` WHERE ${param.search}`;
    }

    if (param.searchSort) {
      sqlQuery += ` ORDER BY ${param.searchSort.field} ${param.searchSort.sort}`;
    }

    sqlQuery += ` LIMIT ${(param.page - 1) * param.pageSize}, ${param.pageSize}`;

    const list = await this.essayListRepository.query(sqlQuery);

    let countQuery = `
      SELECT COUNT(A.id) as totalCount
      FROM essay_list_tb A
      LEFT JOIN essay_lowest_grade_list_tb B ON A.id = B.essay_id
    `;

    if (param.search) {
      countQuery += ` WHERE ${param.search}`;
    }

    const result = await this.essayListRepository.query(countQuery);
    const totalCount = result[0].totalCount;

    return {
      list: list as (EssayListEntity & EssayLowestGradeListEntity)[],
      totalCount,
    };
  }
}
