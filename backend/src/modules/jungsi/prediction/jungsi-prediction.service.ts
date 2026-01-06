import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  PredictRequestDto,
  PredictResponseDto,
  RagQueryRequestDto,
  RagQueryResponseDto,
  CompetitionResponseDto,
  PredictionHealthResponseDto,
} from './dto/prediction.dto';

@Injectable()
export class JungsiPredictionService {
  private readonly logger = new Logger(JungsiPredictionService.name);
  private readonly apiClient: AxiosInstance;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('PREDICTION_API_URL', 'http://localhost:8000');

    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000, // 30초 (ML 예측은 시간이 걸릴 수 있음)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log(`Prediction API URL: ${this.apiUrl}`);
  }

  /**
   * 합격 예측
   * POST /api/v1/predict
   */
  async predict(dto: PredictRequestDto): Promise<PredictResponseDto> {
    try {
      const startTime = Date.now();

      const response = await this.apiClient.post('/api/v1/predict', {
        university_id: dto.universityId,
        admission_id: dto.admissionId,
        scores: {
          korean: dto.scores.korean,
          math: dto.scores.math,
          english: dto.scores.english,
          inquiry1: dto.scores.inquiry1,
          inquiry2: dto.scores.inquiry2,
          history: dto.scores.history,
          second_foreign: dto.scores.secondForeign,
        },
        track: dto.track,
      });

      const latencyMs = Date.now() - startTime;
      this.logger.log(`Prediction completed in ${latencyMs}ms`);

      return this.transformPredictResponse(response.data, latencyMs);
    } catch (error) {
      this.handleApiError(error, 'predict');
    }
  }

  /**
   * RAG 기반 질의응답
   * POST /api/v1/rag/query
   */
  async ragQuery(dto: RagQueryRequestDto): Promise<RagQueryResponseDto> {
    try {
      const response = await this.apiClient.post('/api/v1/rag/query', {
        query: dto.query,
        university_filter: dto.universityFilter,
        top_k: dto.topK ?? 5,
      });

      return this.transformRagResponse(response.data);
    } catch (error) {
      this.handleApiError(error, 'ragQuery');
    }
  }

  /**
   * 실시간 경쟁률 조회
   * GET /api/v1/competition
   */
  async getCompetition(
    universityId?: number,
    admissionId?: number,
  ): Promise<CompetitionResponseDto> {
    try {
      const params: Record<string, number> = {};
      if (universityId) params.university_id = universityId;
      if (admissionId) params.admission_id = admissionId;

      const response = await this.apiClient.get('/api/v1/competition', {
        params,
      });

      return this.transformCompetitionResponse(response.data);
    } catch (error) {
      this.handleApiError(error, 'getCompetition');
    }
  }

  /**
   * 예측 서비스 헬스체크
   * GET /api/v1/health
   */
  async checkHealth(): Promise<PredictionHealthResponseDto> {
    try {
      const response = await this.apiClient.get('/api/v1/health', {
        timeout: 5000, // 헬스체크는 5초 타임아웃
      });

      return {
        status: response.data.status ?? 'healthy',
        modelLoaded: response.data.model_loaded ?? true,
        dbConnected: response.data.db_connected ?? true,
        version: response.data.version,
      };
    } catch (error) {
      this.logger.warn(`Prediction service health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        modelLoaded: false,
        dbConnected: false,
      };
    }
  }

  /**
   * 서비스 가용성 확인
   */
  async isAvailable(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.status === 'healthy' && health.modelLoaded;
  }

  // ============================================
  // Private: Response Transformers
  // ============================================

  private transformPredictResponse(data: any, latencyMs: number): PredictResponseDto {
    return {
      prediction: {
        probability: data.probability ?? data.prediction?.probability ?? 0,
        riskLevel: this.mapRiskLevel(data.risk_level ?? data.prediction?.risk_level),
        expectedCompetition: data.expected_competition ?? 0,
        convertedScore: data.converted_score ?? 0,
        estimatedCutline: data.estimated_cutline ?? 0,
        analysis: data.analysis,
      },
      modelVersion: data.model_version ?? '1.0.0',
      latencyMs,
    };
  }

  private transformRagResponse(data: any): RagQueryResponseDto {
    return {
      answer: data.answer ?? '',
      sources: (data.sources ?? []).map((s: any) => ({
        document: s.document ?? s.source ?? '',
        score: s.score ?? s.relevance ?? 0,
        section: s.section ?? s.page,
      })),
      confidence: data.confidence ?? 0,
    };
  }

  private transformCompetitionResponse(data: any): CompetitionResponseDto {
    const items = data.data ?? data.competition ?? [];
    return {
      data: items.map((item: any) => ({
        universityName: item.university_name ?? '',
        admissionName: item.admission_name ?? item.department_name ?? '',
        currentRatio: item.current_ratio ?? item.competition_ratio ?? 0,
        quota: item.quota ?? item.recruitment_count ?? 0,
        applicants: item.applicants ?? item.applicant_count ?? 0,
        updatedAt: new Date(item.updated_at ?? item.crawled_at ?? Date.now()),
        source: item.source,
      })),
      lastCrawledAt: new Date(data.last_crawled_at ?? Date.now()),
    };
  }

  private mapRiskLevel(level: string | number): string {
    if (typeof level === 'number') {
      if (level >= 80) return '안정';
      if (level >= 60) return '적정';
      if (level >= 40) return '소신';
      return '위험';
    }

    const levelMap: Record<string, string> = {
      safe: '안정',
      stable: '안정',
      moderate: '적정',
      normal: '적정',
      challenge: '소신',
      risky: '위험',
      danger: '위험',
    };

    return levelMap[level?.toLowerCase()] ?? level ?? '미정';
  }

  // ============================================
  // Private: Error Handler
  // ============================================

  private handleApiError(error: unknown, operation: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNREFUSED') {
        this.logger.error(`Prediction service unavailable: ${this.apiUrl}`);
        throw new HttpException(
          '예측 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ECONNABORTED') {
        this.logger.error(`Prediction service timeout on ${operation}`);
        throw new HttpException(
          '예측 서비스 응답 시간이 초과되었습니다.',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }

      const status = axiosError.response?.status ?? 500;
      const message =
        (axiosError.response?.data as any)?.detail ??
        (axiosError.response?.data as any)?.message ??
        '예측 서비스 오류가 발생했습니다.';

      this.logger.error(`Prediction API error [${operation}]: ${status} - ${message}`);
      throw new HttpException(message, status);
    }

    this.logger.error(`Unexpected error in ${operation}: ${error}`);
    throw new HttpException('예기치 않은 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
