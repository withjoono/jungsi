import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 과목 카테고리 enum
 */
export enum SubjectCategory {
  KOR = 'kor',
  MATH = 'math',
  ENG = 'eng',
  HISTORY = 'history',
  SOCIETY = 'society',
  SCIENCE = 'science',
  LANG = 'lang',
}

/**
 * 모의고사 점수 입력 DTO
 * SnakeToCamelInterceptor가 snake_case를 camelCase로 변환함
 */
export class MockExamScoreInputDto {
  @ApiProperty({
    description: '과목 카테고리',
    enum: SubjectCategory,
    example: 'kor',
  })
  @IsEnum(SubjectCategory)
  subjectCategory: SubjectCategory;

  @ApiProperty({
    description: '과목명',
    example: '국어',
  })
  @IsString()
  subjectName: string;

  @ApiProperty({
    description: '표준점수',
    example: '131',
  })
  @IsString()
  standardScore: string;

  @ApiProperty({
    description: '등급',
    example: 2,
  })
  @IsInt()
  grade: number;

  @ApiProperty({
    description: '백분위',
    example: 93,
  })
  @IsNumber()
  percentile: number;
}

/**
 * 환산점수 계산 요청 DTO
 * SnakeToCamelInterceptor가 snake_case를 camelCase로 변환함
 *
 * mockExamScores가 제공되지 않으면 DB에 저장된 사용자의 입력 점수를 사용
 */
export class CalculateScoresRequestDto {
  @ApiPropertyOptional({
    description: '모의고사 점수 목록 (선택사항, 미입력시 DB에 저장된 점수 사용)',
    type: [MockExamScoreInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MockExamScoreInputDto)
  mockExamScores?: MockExamScoreInputDto[];

  @ApiPropertyOptional({
    description: '특정 대학 ID 목록 (선택사항, 미입력시 전체 대학 계산)',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  universityIds?: number[];
}

/**
 * 대학별 환산점수 결과 DTO
 */
export class UniversityCalculatedScoreDto {
  @ApiProperty({ description: '대학 ID', example: 1 })
  universityId: number;

  @ApiProperty({ description: '대학명', example: '서울대학교' })
  universityName: string;

  @ApiProperty({ description: '환산식 코드', example: 'SC001' })
  scoreCalculationCode: string;

  @ApiProperty({ description: '계열', example: '인문' })
  major: string;

  @ApiProperty({ description: '계산 성공 여부', example: true })
  success: boolean;

  @ApiPropertyOptional({
    description: '실패 사유',
    example: '미적기하필수',
  })
  result?: string;

  @ApiPropertyOptional({ description: '환산점수', example: 850.5 })
  convertedScore?: number;

  @ApiPropertyOptional({ description: '표점합', example: 520 })
  standardScoreSum?: number;

  @ApiPropertyOptional({
    description: '최적 선택과목 조합 점수',
    example: 860.5,
  })
  optimalScore?: number;

  @ApiPropertyOptional({
    description: '유불리 점수 차이 (optimalScore - convertedScore). 양수면 유리, 음수면 불리',
    example: 10.0,
  })
  scoreDifference?: number;

  @ApiProperty({ description: '계산 일시' })
  calculatedAt: Date;
}

/**
 * 환산점수 계산 응답 DTO
 */
export class CalculateScoresResponseDto {
  @ApiProperty({ description: '회원 ID', example: 123 })
  memberId: number;

  @ApiProperty({ description: '계산 일시' })
  calculatedAt: Date;

  @ApiProperty({ description: '전체 대학 수', example: 150 })
  totalUniversities: number;

  @ApiProperty({ description: '성공 개수', example: 140 })
  successCount: number;

  @ApiProperty({ description: '실패 개수', example: 10 })
  failedCount: number;

  @ApiProperty({
    description: '대학별 환산점수 목록',
    type: [UniversityCalculatedScoreDto],
  })
  scores: UniversityCalculatedScoreDto[];
}

/**
 * 표준점수 -> 등급/백분위 변환 요청 DTO (단일 과목)
 */
export class ConvertScoreInputDto {
  @ApiProperty({
    description: '과목명 (국어, 미적, 기하, 확통, 영어, 한국사, 물리학 Ⅰ 등)',
    example: '국어',
  })
  @IsString()
  subjectName: string;

  @ApiProperty({
    description: '표준점수 (영어/한국사/제2외국어는 등급 입력)',
    example: 120,
  })
  @IsNumber()
  standardScore: number;
}

/**
 * 표준점수 -> 등급/백분위 변환 요청 DTO
 */
export class ConvertScoreRequestDto {
  @ApiProperty({
    description: '과목별 표준점수 목록',
    type: [ConvertScoreInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConvertScoreInputDto)
  @ArrayMinSize(1)
  scores: ConvertScoreInputDto[];
}

/**
 * 변환 결과 (단일 과목)
 */
export class ConvertedScoreResultDto {
  @ApiProperty({ description: '과목명', example: '국어' })
  subjectName: string;

  @ApiProperty({ description: '입력한 표준점수', example: 120 })
  standardScore: number;

  @ApiProperty({ description: '백분위', example: 88 })
  percentile: number;

  @ApiProperty({ description: '등급', example: 2 })
  grade: number;

  @ApiProperty({ description: '변환 성공 여부', example: true })
  success: boolean;

  @ApiPropertyOptional({ description: '에러 메시지' })
  errorMessage?: string;
}

/**
 * 표준점수 -> 등급/백분위 변환 응답 DTO
 */
export class ConvertScoreResponseDto {
  @ApiProperty({
    description: '변환 결과 목록',
    type: [ConvertedScoreResultDto],
  })
  results: ConvertedScoreResultDto[];
}

/**
 * 저장된 점수 조회 응답 DTO
 */
export class SavedScoreResponseDto {
  @ApiProperty({ description: 'ID', example: 1 })
  id: number;

  @ApiProperty({ description: '대학 ID', example: 1 })
  universityId: number;

  @ApiProperty({ description: '대학명', example: '서울대학교' })
  universityName: string;

  @ApiProperty({ description: '환산식 코드', example: 'SC001' })
  scoreCalculationCode: string;

  @ApiProperty({ description: '계열', example: '인문' })
  major: string;

  @ApiProperty({ description: '환산점수', example: 850.5 })
  convertedScore: number;

  @ApiProperty({ description: '표점합', example: 520 })
  standardScoreSum: number;

  @ApiProperty({ description: '최적 선택과목 조합 점수', example: 860.5 })
  optimalScore: number;

  @ApiProperty({
    description: '유불리 점수 차이 (optimalScore - convertedScore). 양수면 유리, 음수면 불리',
    example: 10.0,
  })
  scoreDifference: number;

  @ApiProperty({ description: '계산 일시' })
  calculatedAt: Date;

  @ApiProperty({ description: '생성 일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정 일시' })
  updatedAt: Date;
}

/**
 * 연도별 입결 데이터 DTO
 */
export class YearlyPreviousResultDto {
  @ApiProperty({ description: '년도', example: 2025 })
  year: number;

  @ApiPropertyOptional({ description: '모집인원(최종)', example: 20 })
  recruitmentNumber: number | null;

  @ApiPropertyOptional({ description: '경쟁률', example: 5.5 })
  competitionRatio: number | null;

  @ApiPropertyOptional({ description: '충원합격순위', example: 15 })
  additionalPassRank: number | null;

  @ApiPropertyOptional({ description: '환산점수 50%컷', example: 850.5 })
  minCut: number | null;

  @ApiPropertyOptional({ description: '환산점수 70%컷', example: 820.3 })
  maxCut: number | null;

  @ApiPropertyOptional({ description: '환산점수 총점(수능)', example: 1000 })
  convertedScoreTotal: number | null;

  @ApiPropertyOptional({ description: '백분위 50%컷', example: 95.5 })
  percentile50: number | null;

  @ApiPropertyOptional({ description: '백분위 70%컷', example: 92.3 })
  percentile70: number | null;
}

/**
 * 과거 입결 데이터 조회 응답 DTO
 */
export class PreviousResultsResponseDto {
  @ApiProperty({ description: '정시 모집단위 ID', example: 123 })
  regularAdmissionId: number;

  @ApiProperty({ description: '대학명', example: '서울대학교' })
  universityName: string;

  @ApiProperty({ description: '모집단위명', example: '컴퓨터공학부' })
  recruitmentName: string;

  @ApiProperty({ description: '전형 타입 (가/나/다)', example: '가' })
  admissionType: string;

  @ApiProperty({
    description: '연도별 입결 데이터 (2025, 2024, 2023)',
    type: [YearlyPreviousResultDto],
  })
  results: YearlyPreviousResultDto[];
}

// ============================================
// 입결분석 API (프론트엔드 스펙 대응)
// ============================================

/**
 * 입결분석 연도별 데이터 DTO
 * 프론트엔드 IRegularAdmissionDetail.previousResults 대응
 */
export class AdmissionPreviousResultItemDto {
  @ApiProperty({ description: '고유 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '년도', example: 2024 })
  year: number;

  @ApiPropertyOptional({ description: '모집인원(최종)', example: 15 })
  recruitmentNumber: number | null;

  @ApiPropertyOptional({
    description: '경쟁률 (소수점 2자리)',
    example: '5.23',
  })
  competitionRatio: string | null;

  @ApiPropertyOptional({ description: '충원합격순위', example: 8 })
  additionalAcceptanceRank: number | null;

  @ApiPropertyOptional({
    description: '환산점수 총점',
    example: '1000.00',
  })
  convertedScoreTotal: string | null;

  @ApiPropertyOptional({
    description: '환산점수 50%컷',
    example: '876.50',
  })
  convertedScore50Cut: string | null;

  @ApiPropertyOptional({
    description: '환산점수 70%컷',
    example: '854.30',
  })
  convertedScore70Cut: string | null;

  @ApiPropertyOptional({
    description: '백분위 50%컷',
    example: '85.20',
  })
  percentile50Cut: string | null;

  @ApiPropertyOptional({
    description: '백분위 70%컷',
    example: '78.50',
  })
  percentile70Cut: string | null;
}

/**
 * 입결분석 API 응답 DTO
 * GET /jungsi/admissions/{admissionId}/previous-results
 */
export class AdmissionPreviousResultsResponseDto {
  @ApiProperty({ description: '정시 전형 ID', example: 1234 })
  admissionId: number;

  @ApiProperty({ description: '대학명', example: '강남대학교' })
  universityName: string;

  @ApiProperty({ description: '모집단위명', example: '글로벌경영학부' })
  recruitmentName: string;

  @ApiProperty({
    description: '연도별 입결 데이터',
    type: [AdmissionPreviousResultItemDto],
  })
  previousResults: AdmissionPreviousResultItemDto[];
}
