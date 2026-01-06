import { Controller, Post, Get, Body, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JungsiPredictionService } from './jungsi-prediction.service';
import {
  PredictRequestDto,
  PredictResponseDto,
  RagQueryRequestDto,
  RagQueryResponseDto,
  CompetitionResponseDto,
  PredictionHealthResponseDto,
} from './dto/prediction.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { SnakeToCamelInterceptor } from '../../../common/interceptors/snake-to-camel.interceptor';
import { Public } from '../../../auth/decorators/public.decorator';

@ApiTags('정시 AI 예측')
@Controller('jungsi/prediction')
@UseGuards(JwtAuthGuard)
@UseInterceptors(SnakeToCamelInterceptor)
@ApiBearerAuth()
export class JungsiPredictionController {
  constructor(private readonly predictionService: JungsiPredictionService) {}

  /**
   * AI 합격 예측
   * POST /jungsi/prediction/predict
   */
  @Post('predict')
  @ApiOperation({
    summary: 'AI 합격 예측',
    description:
      '모의고사 점수와 지원 대학/모집단위 정보를 기반으로 AI가 합격 확률을 예측합니다.\n\n' +
      '**ML 모델**: XGBoost + LightGBM + CatBoost 앙상블\n' +
      '**입력 데이터**: 표준점수, 등급, 경쟁률, 과거 입결 데이터\n' +
      '**출력**: 합격 확률, 위험도, 예상 커트라인',
  })
  @ApiResponse({
    status: 200,
    description: '예측 성공',
    type: PredictResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 503, description: '예측 서비스 이용 불가' })
  async predict(@Body() dto: PredictRequestDto): Promise<PredictResponseDto> {
    return this.predictionService.predict(dto);
  }

  /**
   * RAG 기반 입시 질의응답
   * POST /jungsi/prediction/rag
   */
  @Post('rag')
  @ApiOperation({
    summary: 'RAG 기반 입시 질의응답',
    description:
      '입시 관련 질문에 대해 RAG(Retrieval-Augmented Generation) 기반으로 답변합니다.\n\n' +
      '**데이터 소스**: 대학별 입학전형 안내, 모집요강, 입결 분석 자료\n' +
      '**기술**: Google Cloud RAG + Vector Store + LLM',
  })
  @ApiResponse({
    status: 200,
    description: '질의 성공',
    type: RagQueryResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 503, description: 'RAG 서비스 이용 불가' })
  async ragQuery(@Body() dto: RagQueryRequestDto): Promise<RagQueryResponseDto> {
    return this.predictionService.ragQuery(dto);
  }

  /**
   * 실시간 경쟁률 조회
   * GET /jungsi/prediction/competition
   */
  @Get('competition')
  @Public()
  @ApiOperation({
    summary: '실시간 경쟁률 조회',
    description:
      '어디가, 진학사, 유웨이에서 크롤링한 실시간 경쟁률 데이터를 조회합니다.\n\n' +
      '**데이터 소스**: 어디가(adiga.go.kr), 진학사, 유웨이\n' +
      '**업데이트 주기**: 정시 원서접수 기간 중 1시간마다 갱신',
  })
  @ApiQuery({
    name: 'universityId',
    required: false,
    description: '대학 ID (필터)',
  })
  @ApiQuery({
    name: 'admissionId',
    required: false,
    description: '모집단위 ID (필터)',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: CompetitionResponseDto,
  })
  @ApiResponse({ status: 503, description: '경쟁률 서비스 이용 불가' })
  async getCompetition(
    @Query('universityId') universityId?: number,
    @Query('admissionId') admissionId?: number,
  ): Promise<CompetitionResponseDto> {
    return this.predictionService.getCompetition(universityId, admissionId);
  }

  /**
   * 예측 서비스 헬스체크
   * GET /jungsi/prediction/health
   */
  @Get('health')
  @Public()
  @ApiOperation({
    summary: '예측 서비스 상태 확인',
    description:
      'AI 예측 서비스의 상태를 확인합니다.\n\n' +
      '모델 로드 상태, DB 연결 상태, 서비스 버전 정보를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '상태 조회 성공',
    type: PredictionHealthResponseDto,
  })
  async checkHealth(): Promise<PredictionHealthResponseDto> {
    return this.predictionService.checkHealth();
  }
}
