import { Controller, Get, Post, Query, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { ApplicationRateService } from './application-rate.service';
import {
  ApplicationRateResponseDto,
  ApplicationRateChangeDto,
  GetApplicationRateQueryDto,
  CrawlSourceDto,
} from './dto/application-rate.dto';

@ApiTags('경쟁률')
@Controller('application-rate')
export class ApplicationRateController {
  constructor(private readonly applicationRateService: ApplicationRateService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: '경쟁률 데이터 조회',
    description: '대학별 경쟁률 데이터를 조회합니다. 5분마다 자동 갱신됩니다.',
  })
  @ApiQuery({ name: 'universityCode', required: false, description: '대학 코드' })
  @ApiQuery({ name: 'departmentName', required: false, description: '모집단위명 검색' })
  @ApiQuery({ name: 'admissionType', required: false, description: '전형구분' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '경쟁률 데이터 조회 성공',
    type: [ApplicationRateResponseDto],
  })
  async getApplicationRates(
    @Query() query: GetApplicationRateQueryDto,
  ): Promise<ApplicationRateResponseDto[]> {
    return this.applicationRateService.getApplicationRates(query);
  }

  @Get('university/:universityCode')
  @Public()
  @ApiOperation({
    summary: '특정 대학 경쟁률 상세 조회',
    description: '특정 대학의 경쟁률 데이터를 상세 조회합니다.',
  })
  @ApiParam({ name: 'universityCode', description: '대학 코드' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '대학 경쟁률 상세 조회 성공',
    type: ApplicationRateResponseDto,
  })
  async getUniversityDetail(
    @Param('universityCode') universityCode: string,
  ): Promise<ApplicationRateResponseDto | null> {
    return this.applicationRateService.getUniversityDetail(universityCode);
  }

  @Get('changes')
  @Public()
  @ApiOperation({
    summary: '최근 경쟁률 변동 내역 조회',
    description: '최근 경쟁률이 변동된 내역을 조회합니다. 실시간 알림에 사용됩니다.',
  })
  @ApiQuery({ name: 'universityCode', required: false, description: '대학 코드' })
  @ApiQuery({ name: 'limit', required: false, description: '조회 개수 (기본: 50)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '변동 내역 조회 성공',
    type: [ApplicationRateChangeDto],
  })
  async getRecentChanges(
    @Query('universityCode') universityCode?: string,
    @Query('limit') limit?: number,
  ): Promise<ApplicationRateChangeDto[]> {
    return this.applicationRateService.getRecentChanges(universityCode, limit || 50);
  }

  @Get('sources')
  @Public()
  @ApiOperation({
    summary: '크롤링 소스 목록 조회',
    description: '현재 설정된 크롤링 대상 대학 목록을 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '크롤링 소스 목록 조회 성공',
    type: [CrawlSourceDto],
  })
  getSources(): CrawlSourceDto[] {
    return this.applicationRateService.getCrawlSources();
  }

  @Post('crawl')
  @Public()
  @ApiOperation({
    summary: '수동 크롤링 실행',
    description: '수동으로 크롤링을 실행합니다. 특정 대학만 크롤링하려면 universityCode를 지정합니다.',
  })
  @ApiQuery({ name: 'universityCode', required: false, description: '특정 대학만 크롤링' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '크롤링 실행 완료',
  })
  async triggerCrawl(@Query('universityCode') universityCode?: string) {
    return this.applicationRateService.triggerManualCrawl(universityCode);
  }
}
