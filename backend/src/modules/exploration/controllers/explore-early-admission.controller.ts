import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ExploreEarlySubjectService } from '../services/explore-early-subject.service';
import { ApiOperation } from '@nestjs/swagger';
import { ExploreIdsQueryDto } from '../dtos/explore.dto';
import { ExploreEarlyComprehensiveService } from '../services/explore-early-comprehensive.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('explore/early')
export class ExploreEarlyAdmissionController {
  constructor(
    private readonly exploreEarlySubjectService: ExploreEarlySubjectService,
    private readonly exploreEarlyComprehensiveService: ExploreEarlyComprehensiveService,
  ) {}

  @Get('subject/step-1')
  @Public()
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 탐색 Step-1',
  })
  exploreSubjectStep1(@Query('basic_type') basicType, @Query('year') year) {
    return this.exploreEarlySubjectService.getStep1(year, basicType);
  }

  @Get('subject/step-2')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 탐색 Step-2',
  })
  exploreSubjectStep2(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreEarlySubjectService.getStep2(dto.ids);
  }

  @Get('subject/step-3')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 탐색 Step-3',
  })
  exploreSubjectStep3(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreEarlySubjectService.getStep3(dto.ids);
  }

  @Get('subject/step-4')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 탐색 Step-4',
  })
  exploreSubjectStep4(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreEarlySubjectService.getStep4(dto.ids);
  }

  @Get('subject/step-5')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 탐색 Step-5',
  })
  exploreSubjectStep5(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreEarlySubjectService.getStep5(dto.ids);
  }

  @Get('subject/detail/:recruitmentUnitId')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 상세조회',
  })
  exploreSubjectDetail(@Param('recruitmentUnitId', ParseIntPipe) recruitmentUnitId: number) {
    return this.exploreEarlySubjectService.getDetail(recruitmentUnitId);
  }

  @Get('comprehensive/step-1')
  @Public()
  @ApiOperation({
    summary: '[수시 전형 탐색] 학종 전형 탐색 Step-1',
  })
  exploreComprehensiveStep1(
    @Query('basic_type') basicType,
    @Query('year') year,
    @Query('minorFieldId') minorFieldId,
  ) {
    return this.exploreEarlyComprehensiveService.getStep1(year, basicType, minorFieldId);
  }

  @Get('comprehensive/step-2')
  @ApiOperation({
    summary: '[수시 전형 탐색] 학종 전형 탐색 Step-2',
  })
  exploreComprehensiveStep2(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreEarlyComprehensiveService.getStep2(dto.ids);
  }

  @Get('comprehensive/step-3')
  @ApiOperation({
    summary: '[수시 전형 탐색] 학종 전형 탐색 Step-3',
  })
  exploreComprehensiveStep3(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreEarlyComprehensiveService.getStep3(dto.ids);
  }

  @Get('comprehensive/step-4')
  @ApiOperation({
    summary: '[수시 전형 탐색] 학종 전형 탐색 Step-4',
  })
  exploreComprehensiveStep4(@Query() dto: ExploreIdsQueryDto) {
    return this.exploreEarlyComprehensiveService.getStep4(dto.ids);
  }

  @Get('comprehensive/detail/:recruitmentUnitId')
  @ApiOperation({
    summary: '[수시 전형 탐색] 교과 전형 상세조회',
  })
  exploreComprehensiveDetail(@Param('recruitmentUnitId', ParseIntPipe) recruitmentUnitId: number) {
    return this.exploreEarlyComprehensiveService.getDetail(recruitmentUnitId);
  }
}
