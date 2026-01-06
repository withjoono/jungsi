import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

/**
 * 모집단위 기본정보 DTO
 */
export class AdmissionInfoDto {
  @ApiProperty({ description: '행 ID (다른 시트 연결용)' })
  rowId: number;

  @ApiProperty({ description: '대학코드' })
  universityCode: string;

  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ description: '모집군 (가/나/다)' })
  group: string;

  @ApiProperty({ description: '모집단위명' })
  recruitmentUnit: string;

  @ApiProperty({ description: '모집인원' })
  recruitmentNumber: number;

  @ApiProperty({ description: '경쟁률' })
  competitionRatio: number;

  @ApiProperty({ description: '충원합격순위' })
  additionalPassRank: number;

  @ApiProperty({ description: '총합격자' })
  totalPassers: number;

  @ApiProperty({ description: '모의지원자수' })
  mockApplicants: number;
}

/**
 * 도수분포 항목 DTO
 */
export class FrequencyDistributionItemDto {
  @ApiProperty({ description: '점수 하한' })
  scoreLower: number;

  @ApiProperty({ description: '점수 상한' })
  scoreUpper: number;

  @ApiProperty({ description: '해당 구간 지원자수' })
  applicantCount: number;

  @ApiProperty({ description: '누적 인원' })
  cumulativeCount: number;

  @ApiProperty({ description: '합격상태 (안정합격/추가합격/합격가능/불합격)' })
  passStatus: string;
}

/**
 * 도수분포 응답 DTO
 */
export class FrequencyDistributionResponseDto {
  @ApiProperty({ description: '모집단위 기본정보' })
  admissionInfo: AdmissionInfoDto;

  @ApiProperty({ description: '도수분포 목록', type: [FrequencyDistributionItemDto] })
  frequencyDistribution: FrequencyDistributionItemDto[];
}

/**
 * 지원자 항목 DTO
 */
export class ApplicantItemDto {
  @ApiProperty({ description: '순위' })
  rank: number;

  @ApiProperty({ description: '점수' })
  score: number;

  @ApiProperty({ description: '합격상태' })
  passStatus: string;

  @ApiPropertyOptional({ description: '비고 (50%컷, 70%컷 등)' })
  note?: string;
}

/**
 * 지원자목록 응답 DTO
 */
export class ApplicantListResponseDto {
  @ApiProperty({ description: '모집단위 기본정보' })
  admissionInfo: AdmissionInfoDto;

  @ApiProperty({ description: '지원자 목록', type: [ApplicantItemDto] })
  applicants: ApplicantItemDto[];

  @ApiProperty({ description: '50% 컷 점수' })
  cut50?: number;

  @ApiProperty({ description: '70% 컷 점수' })
  cut70?: number;
}

/**
 * 대학 목록 조회 쿼리 DTO
 */
export class GetAdmissionsQueryDto {
  @ApiPropertyOptional({ description: '대학명 검색' })
  universityName?: string;

  @ApiPropertyOptional({ description: '모집군 필터 (가/나/다)' })
  group?: string;

  @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: '페이지 크기', default: 50 })
  limit?: number;
}

/**
 * 페이지네이션된 모집단위 목록 응답 DTO
 */
export class PaginatedAdmissionsResponseDto {
  @ApiProperty({ description: '모집단위 목록', type: [AdmissionInfoDto] })
  data: AdmissionInfoDto[];

  @ApiProperty({ description: '전체 개수' })
  total: number;

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;
}

// ==============================
// 모의지원 분석 API 관련 DTO
// ==============================

/**
 * 모의지원 분석 요청 DTO
 */
export class MockApplicationAnalysisRequestDto {
  @ApiProperty({ description: '대학 코드' })
  @IsString()
  universityCode: string;

  @ApiProperty({ description: '대학명 (매칭에 사용)' })
  @IsString()
  universityName: string;

  @ApiProperty({ description: '모집단위(학과명)' })
  @IsString()
  recruitmentUnit: string;

  @ApiPropertyOptional({ description: '군 (가/나/다) - 참고용' })
  @IsString()
  @IsOptional()
  admissionType?: string;

  @ApiPropertyOptional({ description: '내 환산점수 (위치 표시용)' })
  @IsNumber()
  @IsOptional()
  myScore?: number;
}

/**
 * 기본정보 DTO (분석용)
 */
export class MockApplicationBasicInfoDto {
  @ApiProperty({ description: '대학 코드' })
  universityCode: string;

  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ description: '군 (가군/나군/다군)' })
  admissionType: string;

  @ApiProperty({ description: '모집단위(학과명)' })
  recruitmentUnit: string;

  @ApiProperty({ description: '모집인원' })
  recruitmentCount: number;

  @ApiProperty({ description: '경쟁률' })
  competitionRate: number;

  @ApiProperty({ description: '추가합격순위' })
  additionalPassRank: number;

  @ApiProperty({ description: '총 합격자 수' })
  totalPassCount: number;

  @ApiProperty({ description: '모의지원자 수' })
  mockApplicantCount: number;
}

/**
 * 통계 정보 DTO
 */
export class StatisticsDto {
  @ApiProperty({ description: '평균 점수' })
  mean: number;

  @ApiProperty({ description: '표준편차' })
  stdDev: number;

  @ApiProperty({ description: '최저 점수' })
  min: number;

  @ApiProperty({ description: '최고 점수' })
  max: number;

  @ApiPropertyOptional({ description: '안정합격 기준점' })
  safePassThreshold: number | null;

  @ApiPropertyOptional({ description: '합격 기준점' })
  passThreshold: number | null;
}

/**
 * 정규분포 곡선 좌표 DTO
 */
export class NormalDistributionPointDto {
  @ApiProperty({ description: 'X 좌표' })
  x: number;

  @ApiProperty({ description: 'Y 좌표 (확률밀도)' })
  y: number;
}

/**
 * 정규분포 곡선 DTO
 */
export class NormalDistributionCurveDto {
  @ApiProperty({ description: 'X축 최소값' })
  xMin: number;

  @ApiProperty({ description: 'X축 최대값' })
  xMax: number;

  @ApiProperty({ description: '곡선 좌표 배열', type: [NormalDistributionPointDto] })
  points: NormalDistributionPointDto[];
}

/**
 * 점수 범위 DTO
 */
export class ScoreRangeDto {
  @ApiProperty({ description: '점수 구간 하한' })
  scoreLower: number;

  @ApiProperty({ description: '점수 구간 상한' })
  scoreUpper: number;
}

/**
 * 내 점수 분석 DTO
 */
export class MyScoreAnalysisDto {
  @ApiProperty({ description: '내 점수' })
  score: number;

  @ApiProperty({ description: '예상 등수' })
  rank: number;

  @ApiProperty({ description: '백분위' })
  percentile: number;

  @ApiProperty({ description: '합격 예측 (안정합격/합격가능/불합격 위험)' })
  passStatus: string;

  @ApiProperty({ description: '내 점수가 속한 구간' })
  scoreRange: ScoreRangeDto;

  @ApiProperty({ description: '평균 대비 점수 차이' })
  comparedToMean: number;
}

/**
 * 모의지원 분석 응답 DTO
 */
export class MockApplicationAnalysisResponseDto {
  @ApiProperty({ description: '기본 정보' })
  basicInfo: MockApplicationBasicInfoDto;

  @ApiProperty({ description: '통계 정보' })
  statistics: StatisticsDto;

  @ApiProperty({ description: '도수분포표 데이터', type: [FrequencyDistributionItemDto] })
  frequencyDistribution: FrequencyDistributionItemDto[];

  @ApiPropertyOptional({ description: '정규분포 곡선 좌표' })
  normalDistributionCurve?: NormalDistributionCurveDto;

  @ApiPropertyOptional({ description: '내 점수 분석 결과' })
  myScoreAnalysis?: MyScoreAnalysisDto;
}

/**
 * 도수분포표 구간폭 재계산 요청 DTO
 */
export class AggregateRequestDto {
  @ApiProperty({ description: '대학 코드' })
  @IsString()
  universityCode: string;

  @ApiProperty({ description: '대학명' })
  @IsString()
  universityName: string;

  @ApiProperty({ description: '모집단위' })
  @IsString()
  recruitmentUnit: string;

  @ApiProperty({ description: '구간폭 (1, 2, 5, 10, 20 등)' })
  @IsNumber()
  intervalSize: number;
}

/**
 * 도수분포표 구간폭 재계산 응답 DTO
 */
export class AggregateResponseDto {
  @ApiProperty({ description: '구간폭' })
  intervalSize: number;

  @ApiProperty({ description: '도수분포표 데이터', type: [FrequencyDistributionItemDto] })
  frequencyDistribution: FrequencyDistributionItemDto[];
}
