import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// 예측 요청/응답 DTO
// ============================================

export class MockExamScoreInputDto {
  @ApiProperty({ description: '국어 표준점수', example: 131 })
  @IsNumber()
  korean: number;

  @ApiProperty({ description: '수학 표준점수', example: 140 })
  @IsNumber()
  math: number;

  @ApiProperty({ description: '영어 등급', example: 1 })
  @IsNumber()
  english: number;

  @ApiProperty({ description: '탐구1 표준점수', example: 68 })
  @IsNumber()
  inquiry1: number;

  @ApiProperty({ description: '탐구2 표준점수', example: 65 })
  @IsNumber()
  inquiry2: number;

  @ApiPropertyOptional({ description: '한국사 등급', example: 1 })
  @IsOptional()
  @IsNumber()
  history?: number;

  @ApiPropertyOptional({ description: '제2외국어 표준점수' })
  @IsOptional()
  @IsNumber()
  secondForeign?: number;
}

export class PredictRequestDto {
  @ApiProperty({ description: '대학 ID', example: 123 })
  @IsNumber()
  universityId: number;

  @ApiProperty({ description: '모집단위 ID', example: 456 })
  @IsNumber()
  admissionId: number;

  @ApiProperty({ description: '모의고사 점수', type: MockExamScoreInputDto })
  @ValidateNested()
  @Type(() => MockExamScoreInputDto)
  scores: MockExamScoreInputDto;

  @ApiPropertyOptional({ description: '계열 (자연/인문)', example: '자연' })
  @IsOptional()
  @IsString()
  track?: string;
}

export class PredictionResultDto {
  @ApiProperty({ description: '합격 확률 (0-100)', example: 75.5 })
  probability: number;

  @ApiProperty({ description: '위험도 (안정/적정/소신/위험)', example: '적정' })
  riskLevel: string;

  @ApiProperty({ description: '예상 경쟁률', example: 5.2 })
  expectedCompetition: number;

  @ApiProperty({ description: '환산점수', example: 850.5 })
  convertedScore: number;

  @ApiProperty({ description: '예상 커트라인', example: 820.0 })
  estimatedCutline: number;

  @ApiPropertyOptional({ description: '추가 분석 정보' })
  @IsOptional()
  @IsObject()
  analysis?: Record<string, any>;
}

export class PredictResponseDto {
  @ApiProperty({ description: '예측 결과', type: PredictionResultDto })
  prediction: PredictionResultDto;

  @ApiProperty({ description: '모델 버전', example: '1.0.0' })
  modelVersion: string;

  @ApiProperty({ description: '예측 시간 (ms)', example: 150 })
  latencyMs: number;
}

// ============================================
// RAG 쿼리 DTO
// ============================================

export class RagQueryRequestDto {
  @ApiProperty({ description: '질문', example: '서울대 컴퓨터공학과 입시 전략' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: '대학 필터', example: ['서울대', '연세대'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  universityFilter?: string[];

  @ApiPropertyOptional({ description: '최대 결과 수', example: 5 })
  @IsOptional()
  @IsNumber()
  topK?: number;
}

export class RagSourceDto {
  @ApiProperty({ description: '출처 문서', example: '2024년 서울대 입학전형 안내' })
  document: string;

  @ApiProperty({ description: '관련도 점수', example: 0.95 })
  score: number;

  @ApiPropertyOptional({ description: '페이지/섹션' })
  @IsOptional()
  section?: string;
}

export class RagQueryResponseDto {
  @ApiProperty({ description: '답변' })
  answer: string;

  @ApiProperty({ description: '출처 목록', type: [RagSourceDto] })
  sources: RagSourceDto[];

  @ApiProperty({ description: '신뢰도', example: 0.85 })
  confidence: number;
}

// ============================================
// 경쟁률 DTO
// ============================================

export class CompetitionDataDto {
  @ApiProperty({ description: '대학명', example: '서울대학교' })
  universityName: string;

  @ApiProperty({ description: '모집단위명', example: '컴퓨터공학부' })
  admissionName: string;

  @ApiProperty({ description: '현재 경쟁률', example: 5.2 })
  currentRatio: number;

  @ApiProperty({ description: '모집인원', example: 30 })
  quota: number;

  @ApiProperty({ description: '지원자수', example: 156 })
  applicants: number;

  @ApiProperty({ description: '업데이트 시간' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: '출처 (어디가/진학사/유웨이)' })
  source?: string;
}

export class CompetitionResponseDto {
  @ApiProperty({ description: '경쟁률 데이터 목록', type: [CompetitionDataDto] })
  data: CompetitionDataDto[];

  @ApiProperty({ description: '마지막 크롤링 시간' })
  lastCrawledAt: Date;
}

// ============================================
// 헬스체크 DTO
// ============================================

export class PredictionHealthResponseDto {
  @ApiProperty({ description: '서비스 상태', example: 'healthy' })
  status: string;

  @ApiProperty({ description: '모델 로드 상태', example: true })
  modelLoaded: boolean;

  @ApiProperty({ description: 'DB 연결 상태', example: true })
  dbConnected: boolean;

  @ApiPropertyOptional({ description: '버전 정보' })
  version?: string;
}
