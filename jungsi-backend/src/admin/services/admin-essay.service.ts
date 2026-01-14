import { Injectable } from '@nestjs/common';
import { EssayService } from 'src/modules/essay/essay.service';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { AdminEssayListResponse } from '../dtos/admin-essay-list-response.dto';

@Injectable()
export class AdminEssayService {
  constructor(private readonly essayService: EssayService) {}

  async getAdminEssayList(
    commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminEssayListResponse> {
    const { list, totalCount } =
      await this.essayService.getEssayListWithLowestGrade(commonSearchQueryDto);
    return { list, totalCount };
  }
}
