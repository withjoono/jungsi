import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PlannerService } from './planner.service';
import {
  CreatePlanDto,
  UpdatePlanDto,
  CreatePlannerItemDto,
  UpdatePlannerItemDto,
  CreateRoutineDto,
  UpdateRoutineDto,
  SetPlannerClassDto,
  PrimaryType,
  GetRankQueryDto,
  RankResponseDto,
  NoticeResponseDto,
  PlannerMentorResponseDto,
} from './dtos';

@ApiTags('Planner')
@ApiBearerAuth()
@Controller('planner')
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) {}

  // ============================================
  // 장기 학습계획 (Plan) API
  // ============================================

  @Get('plan')
  @ApiOperation({
    summary: '장기 학습계획 목록 조회',
    description: '사용자의 장기 학습계획 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getPlans(@Request() req: any) {
    const memberId = req.user.memberId;
    const data = await this.plannerService.getPlans(memberId);
    return { success: true, data };
  }

  @Post('plan')
  @ApiOperation({
    summary: '장기 학습계획 생성/수정',
    description: 'id가 없으면 생성, 있으면 수정합니다.',
  })
  @ApiResponse({ status: 200, description: '생성/수정 성공' })
  async createOrUpdatePlan(@Request() req: any, @Body() dto: CreatePlanDto | UpdatePlanDto) {
    const memberId = req.user.memberId;

    if ('id' in dto && dto.id) {
      await this.plannerService.updatePlan(memberId, dto as UpdatePlanDto);
      return { success: true };
    } else {
      const id = await this.plannerService.createPlan(memberId, dto as CreatePlanDto);
      return { success: true, data: id };
    }
  }

  @Get('plan/progress')
  @ApiOperation({
    summary: '장기 학습계획 진행률 업데이트',
    description: '계획의 완료량을 토글 업데이트합니다.',
  })
  @ApiQuery({ name: 'id', required: false, description: '상위 계획 ID' })
  @ApiQuery({ name: 'itemId', required: true, description: '토글할 아이템 ID' })
  @ApiQuery({ name: 'done', required: true, description: '증가/감소할 양' })
  @ApiResponse({ status: 200, description: '업데이트 성공' })
  async updatePlanProgress(
    @Request() req: any,
    @Query('id') id?: string,
    @Query('itemId') itemId?: string,
    @Query('done') done?: string,
  ) {
    const memberId = req.user.memberId;
    await this.plannerService.updatePlanProgress(memberId, {
      id: id ? parseInt(id, 10) : undefined,
      itemId: parseInt(itemId, 10),
      done: parseInt(done, 10),
    });
    return { success: true };
  }

  @Delete('plan/:id')
  @ApiOperation({
    summary: '장기 학습계획 삭제',
    description: '지정된 학습계획을 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '삭제할 계획 ID' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  async deletePlan(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const memberId = req.user.memberId;
    await this.plannerService.deletePlan(memberId, id);
    return { success: true };
  }

  // ============================================
  // 일정 아이템 (PlannerItem) API
  // ============================================

  @Get('item')
  @ApiOperation({
    summary: '일정 아이템 목록 조회',
    description: '사용자의 일정 아이템 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getPlannerItems(@Request() req: any) {
    const memberId = req.user.memberId;
    const data = await this.plannerService.getPlannerItems(memberId);
    return { success: true, data };
  }

  @Post('item')
  @ApiOperation({
    summary: '일정 아이템 생성/수정',
    description: 'id가 없으면 생성, 있으면 수정합니다.',
  })
  @ApiResponse({ status: 200, description: '생성/수정 성공' })
  async createOrUpdatePlannerItem(
    @Request() req: any,
    @Body() dto: CreatePlannerItemDto | UpdatePlannerItemDto,
  ) {
    const memberId = req.user.memberId;

    if ('id' in dto && dto.id) {
      await this.plannerService.updatePlannerItem(memberId, dto as UpdatePlannerItemDto);
      return { success: true };
    } else {
      const id = await this.plannerService.createPlannerItem(memberId, dto as CreatePlannerItemDto);
      return { success: true, data: id };
    }
  }

  @Delete('item/:id')
  @ApiOperation({
    summary: '일정 아이템 삭제',
    description: '지정된 일정 아이템을 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '삭제할 일정 ID' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  async deletePlannerItem(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const memberId = req.user.memberId;
    await this.plannerService.deletePlannerItem(memberId, id);
    return { success: true };
  }

  // ============================================
  // 루틴 (Routine) API
  // ============================================

  @Get('routine')
  @ApiOperation({
    summary: '루틴 목록 조회',
    description: '사용자의 루틴 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getRoutines(@Request() req: any) {
    const memberId = req.user.memberId;
    const data = await this.plannerService.getRoutines(memberId);
    return { success: true, data };
  }

  @Post('routine')
  @ApiOperation({
    summary: '루틴 생성',
    description: '새로운 루틴을 생성합니다.',
  })
  @ApiResponse({ status: 200, description: '생성 성공' })
  async createRoutine(@Request() req: any, @Body() dto: CreateRoutineDto) {
    const memberId = req.user.memberId;
    const id = await this.plannerService.createRoutine(memberId, dto);
    return { success: true, data: id };
  }

  @Post('routine/update')
  @ApiOperation({
    summary: '루틴 수정',
    description: '기존 루틴을 수정합니다.',
  })
  @ApiResponse({ status: 200, description: '수정 성공' })
  async updateRoutine(@Request() req: any, @Body() dto: UpdateRoutineDto) {
    const memberId = req.user.memberId;
    await this.plannerService.updateRoutine(memberId, dto);
    return { success: true };
  }

  @Delete('routine/:id')
  @ApiOperation({
    summary: '루틴 삭제',
    description: '지정된 루틴을 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '삭제할 루틴 ID' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  async deleteRoutine(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const memberId = req.user.memberId;
    await this.plannerService.deleteRoutine(memberId, id);
    return { success: true };
  }

  // ============================================
  // 주간 성취도 그래프 API
  // ============================================

  @Get('progress/weekly')
  @ApiOperation({
    summary: '주간 성취도 조회',
    description: '이번 주 요일별 평균 성취도를 조회합니다.',
  })
  @ApiQuery({
    name: 'primaryType',
    enum: PrimaryType,
    description: '유형 (학습 또는 수업)',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getWeeklyProgress(@Request() req: any, @Query('primaryType') primaryType: PrimaryType) {
    const memberId = req.user.memberId;
    const data = await this.plannerService.getWeeklyProgress(memberId, primaryType);
    return { success: true, data };
  }

  // ============================================
  // 플래너 관리 API (관리자용)
  // ============================================

  @Get('class/list')
  @ApiOperation({
    summary: '플래너(멘토) 목록 조회',
    description: '플래너(멘토) 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'dvsn',
    required: false,
    enum: ['A'],
    description: '조회 구분 (A: 전체 조회)',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getPlanners(@Request() req: any, @Query('dvsn') dvsn?: string) {
    const memberId = req.user.memberId;
    const data = await this.plannerService.getPlanners(memberId, dvsn);
    return { success: true, data };
  }

  @Post('class')
  @ApiOperation({
    summary: '플래너 클래스 설정',
    description: '플래너 클래스를 생성/수정합니다.',
  })
  @ApiResponse({ status: 200, description: '설정 성공' })
  async setPlannerClass(@Body() dto: SetPlannerClassDto) {
    await this.plannerService.setPlannerClass(dto);
    return { success: true };
  }

  @Get('class/members')
  @ApiOperation({
    summary: '클래스 멤버 조회',
    description: '플래너 클래스의 멤버 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'plannerId', description: '플래너 ID' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getClassMembers(@Query('plannerId', ParseIntPipe) plannerId: number) {
    const data = await this.plannerService.getClassMembers(plannerId);
    return { success: true, data };
  }

  // ============================================
  // MyClass 페이지용 API
  // ============================================

  @Get('planners')
  @ApiOperation({
    summary: '담당 선생님(플래너) 목록 조회',
    description: '현재 사용자에게 배정된 담당 선생님(플래너/멘토) 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [PlannerMentorResponseDto],
  })
  async getPlannersMentor(@Request() req: any) {
    const memberId = req.user.memberId;
    const data = await this.plannerService.getPlannersMentor(memberId);
    return { success: true, data };
  }

  @Get('notice')
  @ApiOperation({
    summary: '공지사항 목록 조회',
    description: '담당 플래너가 등록한 공지사항 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [NoticeResponseDto],
  })
  async getNotices(@Request() req: any) {
    const memberId = req.user.memberId;
    const data = await this.plannerService.getNotices(memberId);
    return { success: true, data };
  }

  @Get('rank')
  @ApiOperation({
    summary: '성취도 랭킹 조회',
    description: '같은 클래스 내에서의 성취도 랭킹을 조회합니다.',
  })
  @ApiQuery({
    name: 'str_dwm',
    required: false,
    enum: ['D', 'W', 'M'],
    description: '기간 타입 (D: 일간, W: 주간, M: 월간)',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: RankResponseDto,
  })
  async getRank(@Request() req: any, @Query() query: GetRankQueryDto) {
    const memberId = req.user.memberId;
    const data = await this.plannerService.getRank(memberId, query.str_dwm);
    return { success: true, data };
  }
}
