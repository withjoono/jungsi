import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JungsiCalculationService } from './services/jungsi-calculation.service';
import {
  CalculateScoresRequestDto,
  CalculateScoresResponseDto,
  SavedScoreResponseDto,
  ConvertScoreRequestDto,
  ConvertScoreResponseDto,
  PreviousResultsResponseDto,
  AdmissionPreviousResultsResponseDto,
} from './dto/calculate-scores.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { SnakeToCamelInterceptor } from '../../../common/interceptors/snake-to-camel.interceptor';
import { Public } from '../../../auth/decorators/public.decorator';

interface RequestWithMemberId extends Request {
  memberId: number;
}

@ApiTags('정시 환산점수')
@Controller('jungsi')
@UseGuards(JwtAuthGuard)
@UseInterceptors(SnakeToCamelInterceptor)
@ApiBearerAuth()
export class JungsiCalculationController {
  constructor(private readonly calculationService: JungsiCalculationService) {}

  /**
   * 환산점수 계산 및 저장
   * POST /jungsi/calculate
   */
  @Post('calculate')
  @ApiOperation({
    summary: '정시 환산점수 계산',
    description: '사용자의 모의고사 점수를 기반으로 모든 대학의 환산점수를 계산하고 저장합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '계산 성공',
    type: CalculateScoresResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async calculateScores(
    @Req() req: RequestWithMemberId,
    @Body() dto: CalculateScoresRequestDto,
  ): Promise<CalculateScoresResponseDto> {
    const memberId = req.memberId;
    const result = await this.calculationService.calculateAndSaveScores(
      memberId,
      dto.mockExamScores,
      dto.universityIds,
    );

    // scoreCalculation은 내부용이므로 API 응답에서 제외
    return {
      ...result,
      scores: result.scores.map(({ scoreCalculation, ...rest }) => rest),
    };
  }

  /**
   * 저장된 환산점수 조회
   * GET /jungsi/scores
   */
  @Get('scores')
  @ApiOperation({
    summary: '저장된 환산점수 조회',
    description: '사용자의 저장된 모든 대학 환산점수를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [SavedScoreResponseDto],
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getSavedScores(@Req() req: RequestWithMemberId): Promise<SavedScoreResponseDto[]> {
    const memberId = req.memberId;
    const scores = await this.calculationService.getSavedScores(memberId);

    return scores.map((score) => ({
      id: score.id,
      universityId: score.university_id,
      universityName: score.university_name,
      scoreCalculationCode: score.score_calculation_code,
      major: score.major,
      convertedScore: Number(score.converted_score) || 0,
      standardScoreSum: Number(score.standard_score_sum) || 0,
      optimalScore: Number(score.optimal_score) || 0,
      scoreDifference: Number(score.score_difference) || 0,
      calculatedAt: score.calculated_at,
      createdAt: score.created_at,
      updatedAt: score.updated_at,
    }));
  }

  /**
   * 특정 대학 환산점수 조회
   * GET /jungsi/scores/:universityId
   */
  @Get('scores/:universityId')
  @ApiOperation({
    summary: '특정 대학 환산점수 조회',
    description: '특정 대학의 저장된 환산점수를 조회합니다.',
  })
  @ApiParam({ name: 'universityId', description: '대학 ID' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: SavedScoreResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '점수 없음' })
  async getSavedScoreByUniversity(
    @Req() req: RequestWithMemberId,
    @Param('universityId', ParseIntPipe) universityId: number,
  ): Promise<SavedScoreResponseDto | null> {
    const memberId = req.memberId;
    const score = await this.calculationService.getSavedScoreByUniversity(memberId, universityId);

    if (!score) {
      return null;
    }

    return {
      id: score.id,
      universityId: score.university_id,
      universityName: score.university_name,
      scoreCalculationCode: score.score_calculation_code,
      major: score.major,
      convertedScore: Number(score.converted_score) || 0,
      standardScoreSum: Number(score.standard_score_sum) || 0,
      optimalScore: Number(score.optimal_score) || 0,
      scoreDifference: Number(score.score_difference) || 0,
      calculatedAt: score.calculated_at,
      createdAt: score.created_at,
      updatedAt: score.updated_at,
    };
  }

  /**
   * 환산점수 재계산 (기존 점수 삭제 후 새로 계산)
   * POST /jungsi/recalculate
   */
  @Post('recalculate')
  @ApiOperation({
    summary: '환산점수 재계산',
    description: '기존 저장된 점수를 삭제하고 새로운 모의고사 점수로 다시 계산합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '재계산 성공',
    type: CalculateScoresResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async recalculateScores(
    @Req() req: RequestWithMemberId,
    @Body() dto: CalculateScoresRequestDto,
  ): Promise<CalculateScoresResponseDto> {
    const memberId = req.memberId;

    // 기존 점수 삭제
    await this.calculationService.deleteScores(memberId, dto.universityIds);

    // 새로 계산
    const result = await this.calculationService.calculateAndSaveScores(
      memberId,
      dto.mockExamScores,
      dto.universityIds,
    );

    // scoreCalculation은 내부용이므로 API 응답에서 제외
    return {
      ...result,
      scores: result.scores.map(({ scoreCalculation, ...rest }) => rest),
    };
  }

  /**
   * 저장된 환산점수 삭제
   * DELETE /jungsi/scores
   */
  @Delete('scores')
  @ApiOperation({
    summary: '저장된 환산점수 삭제',
    description: '사용자의 모든 저장된 환산점수를 삭제합니다.',
  })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async deleteScores(@Req() req: RequestWithMemberId): Promise<{ deleted: boolean }> {
    const memberId = req.memberId;
    await this.calculationService.deleteScores(memberId);
    return { deleted: true };
  }

  // ============================================
  // 표준점수 -> 등급/백분위 변환 API
  // ============================================

  /**
   * 표준점수를 등급/백분위로 변환
   * POST /jungsi/convert
   * 인증 없이 사용 가능
   */
  @Post('convert')
  @Public()
  @ApiOperation({
    summary: '표준점수 → 등급/백분위 변환',
    description:
      '표준점수를 입력하면 해당 과목의 등급과 백분위로 변환합니다. 인증 없이 사용 가능합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '변환 성공',
    type: ConvertScoreResponseDto,
  })
  async convertScores(@Body() dto: ConvertScoreRequestDto): Promise<ConvertScoreResponseDto> {
    const results = await this.calculationService.convertStandardScores(dto.scores);
    return { results };
  }

  /**
   * 변환 가능한 과목 목록 조회
   * GET /jungsi/convert/subjects
   * 인증 없이 사용 가능
   */
  @Get('convert/subjects')
  @Public()
  @ApiOperation({
    summary: '변환 가능한 과목 목록 조회',
    description: '표준점수 → 등급/백분위 변환이 가능한 과목 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      type: 'object',
      properties: {
        subjects: {
          type: 'array',
          items: { type: 'string' },
          example: ['국어', '미적', '기하', '영어', '물리학 Ⅰ'],
        },
      },
    },
  })
  async getAvailableSubjects(): Promise<{ subjects: string[] }> {
    const subjects = await this.calculationService.getAvailableSubjects();
    return { subjects };
  }

  // ============================================
  // 과거 입결 데이터 조회 API
  // ============================================

  /**
   * 정시 모집단위의 과거 입결 데이터 조회
   * GET /jungsi/previous-results/:regularAdmissionId
   * 인증 없이 사용 가능
   */
  @Get('previous-results/:regularAdmissionId')
  @Public()
  @ApiOperation({
    summary: '정시 모집단위 과거 입결 조회',
    description:
      '특정 정시 모집단위의 2025, 2024, 2023년 입결 데이터를 조회합니다. ' +
      '각 연도별로 모집인원, 경쟁률, 충원합격순위, 환산점수(50%/70%), 총점, 백분위(50%/70%) 정보를 제공합니다.',
  })
  @ApiParam({
    name: 'regularAdmissionId',
    description: '정시 모집단위 ID',
    type: Number,
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: PreviousResultsResponseDto,
  })
  @ApiResponse({ status: 404, description: '모집단위를 찾을 수 없음' })
  async getPreviousResults(
    @Param('regularAdmissionId', ParseIntPipe) regularAdmissionId: number,
  ): Promise<PreviousResultsResponseDto> {
    return this.calculationService.getPreviousResults(regularAdmissionId);
  }

  // ============================================
  // 입결분석 API (프론트엔드 스펙 대응)
  // ============================================

  /**
   * 정시 전형 연도별 입결 데이터 조회
   * GET /jungsi/admissions/:admissionId/previous-results
   * 입결확인 페이지의 "최근 입결 분석" 섹션에서 사용
   */
  @Get('admissions/:admissionId/previous-results')
  @Public()
  @ApiOperation({
    summary: '정시 전형 연도별 입결 데이터 조회',
    description:
      '입결확인 페이지의 "최근 입결 분석" 섹션에서 사용되는 데이터를 조회합니다.\n\n' +
      '**사용처:**\n' +
      '- 최근 입결 분석 테이블\n' +
      '- 환산점수 입결 그래프 (50%컷/70%컷 막대, 내 점수 가로선)\n' +
      '- 상위누백 입결 그래프 (50%컷/70%컷 막대, 내 백분위 가로선)',
  })
  @ApiParam({
    name: 'admissionId',
    description: '정시 전형 ID',
    type: Number,
    example: 1234,
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: AdmissionPreviousResultsResponseDto,
  })
  @ApiResponse({ status: 404, description: '해당 전형을 찾을 수 없습니다.' })
  async getAdmissionPreviousResults(
    @Param('admissionId', ParseIntPipe) admissionId: number,
  ): Promise<AdmissionPreviousResultsResponseDto> {
    return this.calculationService.getAdmissionPreviousResults(admissionId);
  }
}
