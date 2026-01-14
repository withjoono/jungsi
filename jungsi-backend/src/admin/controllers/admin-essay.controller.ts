import { Controller, Get, Query } from '@nestjs/common';
import { CommonSearchQueryDto } from 'src/common/dtos/common-search-query.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AdminEssayService } from '../services/admin-essay.service';
import { AdminEssayListResponse } from '../dtos/admin-essay-list-response.dto';

@ApiTags('[관리자] 논술 통합DB')
@Controller('admin/earlyd/essay')
export class AdminEssayController {
  constructor(private readonly adminEssayService: AdminEssayService) {}

  @Get()
  @Roles(['ROLE_ADMIN'])
  @ApiOperation({
    summary: '논술 통합 DB 조회',
    description: '관리자 권한으로 논술 통합 DB 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'searchKey',
    description: "검색조건(',' 단위로 분리)",
    required: false,
    example: 'nickname, email',
    type: String,
  })
  @ApiQuery({
    name: 'searchWord',
    description: '검색어',
    required: false,
    example: '입력한 검색어',
    type: String,
  })
  @ApiQuery({
    name: 'searchSort',
    required: false,
    description: '검색 정렬 필터(정렬 항목, 정렬 기준)',
    example: '{"field": "email", "sort": "asc"}',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    description: '현재페이지',
    required: false,
    example: 1,
    type: String,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '페이지크기',
    required: false,
    example: 10,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '논술 통합 DB 조회 성공',
    type: AdminEssayListResponse,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getAdminEssayList(
    @Query() commonSearchQueryDto: CommonSearchQueryDto,
  ): Promise<AdminEssayListResponse> {
    return this.adminEssayService.getAdminEssayList(commonSearchQueryDto);
  }
}
