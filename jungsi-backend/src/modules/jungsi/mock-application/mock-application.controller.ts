import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { MockApplicationService } from './mock-application.service';
import {
  AdmissionInfoDto,
  FrequencyDistributionResponseDto,
  ApplicantListResponseDto,
  PaginatedAdmissionsResponseDto,
  MockApplicationAnalysisRequestDto,
  MockApplicationAnalysisResponseDto,
  AggregateRequestDto,
  AggregateResponseDto,
} from './dto/mock-application.dto';

@ApiTags('jungsi-mock-application')
@Controller('jungsi/mock-application')
export class MockApplicationController {
  constructor(private readonly mockApplicationService: MockApplicationService) {}

  // === 정적 라우트 (먼저 정의) ===

  @Public()
  @Get('status/loaded')
  @ApiOperation({ summary: '데이터 로드 상태 확인' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        loaded: { type: 'boolean' },
      },
    },
  })
  getLoadStatus(): { loaded: boolean } {
    return { loaded: this.mockApplicationService.isDataLoaded() };
  }

  @Public()
  @Get('universities')
  @ApiOperation({ summary: '대학 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '대학 목록',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  })
  getUniversities(): { code: string; name: string }[] {
    return this.mockApplicationService.getUniversities();
  }

  @Public()
  @Get('admissions')
  @ApiOperation({ summary: '모집단위 목록 조회 (페이지네이션)' })
  @ApiQuery({ name: 'universityName', required: false, description: '대학명/학과명 검색' })
  @ApiQuery({ name: 'group', required: false, description: '모집군 (가/나/다)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지 크기', example: 50 })
  @ApiResponse({ status: 200, description: '모집단위 목록', type: PaginatedAdmissionsResponseDto })
  getAdmissions(
    @Query('universityName') universityName?: string,
    @Query('group') group?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ): PaginatedAdmissionsResponseDto {
    return this.mockApplicationService.getAdmissions({
      universityName,
      group,
      page,
      limit,
    });
  }

  // === 분석 API (정적 라우트) ===

  @Public()
  @Post('analysis')
  @ApiOperation({
    summary: '모의지원 분석 데이터 조회',
    description:
      '대학코드, 대학명, 모집단위를 기반으로 도수분포표, 통계, 내 점수 분석 등의 데이터를 조회합니다.',
  })
  @ApiBody({ type: MockApplicationAnalysisRequestDto })
  @ApiResponse({
    status: 200,
    description: '분석 데이터',
    type: MockApplicationAnalysisResponseDto,
  })
  @ApiResponse({ status: 404, description: '해당 대학/모집단위의 모의지원 데이터가 없음' })
  getAnalysis(
    @Body() request: MockApplicationAnalysisRequestDto,
  ): MockApplicationAnalysisResponseDto {
    return this.mockApplicationService.getAnalysis(request);
  }

  @Public()
  @Post('analysis/aggregate')
  @ApiOperation({
    summary: '도수분포표 구간폭 재계산',
    description: '지정한 구간폭으로 도수분포표를 재계산합니다.',
  })
  @ApiBody({ type: AggregateRequestDto })
  @ApiResponse({
    status: 200,
    description: '재계산된 도수분포표',
    type: AggregateResponseDto,
  })
  @ApiResponse({ status: 404, description: '해당 대학/모집단위의 모의지원 데이터가 없음' })
  getAggregatedFrequency(@Body() request: AggregateRequestDto): AggregateResponseDto {
    return this.mockApplicationService.getAggregatedFrequency(request);
  }

  // === 동적 라우트 (나중에 정의) ===

  @Public()
  @Get(':rowId/frequency')
  @ApiOperation({ summary: '도수분포 조회 (시트2 데이터)' })
  @ApiParam({ name: 'rowId', description: '모집단위 행 ID' })
  @ApiResponse({
    status: 200,
    description: '도수분포 데이터',
    type: FrequencyDistributionResponseDto,
  })
  @ApiResponse({ status: 404, description: '모집단위를 찾을 수 없음' })
  getFrequencyDistribution(
    @Param('rowId', ParseIntPipe) rowId: number,
  ): FrequencyDistributionResponseDto {
    return this.mockApplicationService.getFrequencyDistribution(rowId);
  }

  @Public()
  @Get(':rowId/applicants')
  @ApiOperation({ summary: '지원자목록 조회 (시트3 데이터)' })
  @ApiParam({ name: 'rowId', description: '모집단위 행 ID' })
  @ApiResponse({ status: 200, description: '지원자 목록', type: ApplicantListResponseDto })
  @ApiResponse({ status: 404, description: '모집단위를 찾을 수 없음' })
  getApplicantList(@Param('rowId', ParseIntPipe) rowId: number): ApplicantListResponseDto {
    return this.mockApplicationService.getApplicantList(rowId);
  }

  @Public()
  @Get(':rowId/applicants-frequency')
  @ApiOperation({ summary: '지원자목록을 도수분포 형태로 변환 조회' })
  @ApiParam({ name: 'rowId', description: '모집단위 행 ID' })
  @ApiQuery({
    name: 'interval',
    required: false,
    description: '점수 구간 간격 (기본값: 1)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '도수분포 형태의 지원자 데이터',
    type: FrequencyDistributionResponseDto,
  })
  @ApiResponse({ status: 404, description: '모집단위를 찾을 수 없음' })
  getApplicantListAsFrequency(
    @Param('rowId', ParseIntPipe) rowId: number,
    @Query('interval', new DefaultValuePipe(1), ParseIntPipe) interval?: number,
  ): FrequencyDistributionResponseDto {
    return this.mockApplicationService.getApplicantListAsFrequency(rowId, interval);
  }

  @Public()
  @Get(':rowId')
  @ApiOperation({ summary: '모집단위 기본정보 조회' })
  @ApiParam({ name: 'rowId', description: '모집단위 행 ID' })
  @ApiResponse({ status: 200, description: '모집단위 기본정보', type: AdmissionInfoDto })
  @ApiResponse({ status: 404, description: '모집단위를 찾을 수 없음' })
  getAdmissionInfo(@Param('rowId', ParseIntPipe) rowId: number): AdmissionInfoDto {
    return this.mockApplicationService.getAdmissionInfo(rowId);
  }
}
