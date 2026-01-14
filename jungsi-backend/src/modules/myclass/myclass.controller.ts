import { Controller, Get, Post, Query, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MyclassService } from './myclass.service';
import {
  GetGradesQueryDto,
  GetTestsQueryDto,
  TestFilterType,
  GetMockTestsQueryDto,
  GetHealthQueryDto,
  CreateHealthDto,
  WeekType,
} from './dtos';

@ApiTags('MyClass')
@ApiBearerAuth()
@Controller('myclass')
export class MyclassController {
  constructor(private readonly myclassService: MyclassService) {}

  // ============================================
  // 내신 성적 API
  // ============================================

  @Get('grades')
  @ApiOperation({
    summary: '학기별 내신 성적 조회',
    description: '사용자의 학기별 내신 성적을 조회합니다.',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    description: '학기 (예: "1학년 1학기")',
    example: '1학년 1학기',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getGrades(@Request() req: any, @Query() query: GetGradesQueryDto) {
    const memberId = req.user.memberId;
    const data = await this.myclassService.getGrades(memberId, query.semester);
    return { data };
  }

  // ============================================
  // 테스트 API
  // ============================================

  @Get('tests')
  @ApiOperation({
    summary: '테스트 목록 조회',
    description: '사용자의 테스트 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: TestFilterType,
    description: '필터 타입 (all, pending, completed)',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getTests(@Request() req: any, @Query() query: GetTestsQueryDto) {
    const memberId = req.user.memberId;
    const data = await this.myclassService.getTests(memberId, query.filter);
    return { data };
  }

  // ============================================
  // 모의고사 API
  // ============================================

  @Get('mock-tests')
  @ApiOperation({
    summary: '모의고사 성적 조회',
    description: '사용자의 모의고사 성적을 조회합니다.',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: '연도 (기본값: 현재 연도)',
    example: 2025,
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getMockTests(@Request() req: any, @Query() query: GetMockTestsQueryDto) {
    const memberId = req.user.memberId;
    const data = await this.myclassService.getMockTests(memberId, query.year);
    return { data };
  }

  // ============================================
  // 건강 관리 API
  // ============================================

  @Get('health')
  @ApiOperation({
    summary: '건강 기록 조회',
    description: '사용자의 주간 건강 기록을 조회합니다.',
  })
  @ApiQuery({
    name: 'week',
    required: false,
    enum: WeekType,
    description: '주간 선택 (current: 이번주, previous: 지난주)',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getHealth(@Request() req: any, @Query() query: GetHealthQueryDto) {
    const memberId = req.user.memberId;
    const data = await this.myclassService.getHealth(memberId, query.week);
    return { data };
  }

  @Post('health')
  @ApiOperation({
    summary: '건강 기록 등록',
    description: '사용자의 건강 기록을 등록합니다. 같은 날짜에 기록이 있으면 업데이트됩니다.',
  })
  @ApiResponse({ status: 200, description: '등록 성공' })
  async createHealth(@Request() req: any, @Body() dto: CreateHealthDto) {
    const memberId = req.user.memberId;
    const id = await this.myclassService.createHealth(memberId, dto);
    return { success: true, data: { id } };
  }

  // ============================================
  // 상담 기록 API
  // ============================================

  @Get('consultations')
  @ApiOperation({
    summary: '상담 기록 조회',
    description: '사용자의 상담 기록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getConsultations(@Request() req: any) {
    const memberId = req.user.memberId;
    const data = await this.myclassService.getConsultations(memberId);
    return { data };
  }

  // ============================================
  // 출결 기록 API
  // ============================================

  @Get('attendance')
  @ApiOperation({
    summary: '출결 기록 조회',
    description: '사용자의 출결 기록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getAttendance(@Request() req: any) {
    const memberId = req.user.memberId;
    const data = await this.myclassService.getAttendance(memberId);
    return { data };
  }
}
