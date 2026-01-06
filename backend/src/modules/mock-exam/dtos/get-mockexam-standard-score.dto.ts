import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 등급 기반 과목 (표준점수 없음): 영어(S8), 한국사(S9)
// 이 과목들은 standard_score="0", percentile=0 으로 반환됨
// (실제 계산에서는 등급(grade) 값을 사용)
export const GRADE_BASED_SUBJECTS = ['S8', 'S9'];

export class GetMockExamStandardScoreDto {
  @ApiProperty({ description: '과목코드', example: 'S1' })
  @IsString()
  @IsNotEmpty()
  code: string; // 과목코드

  @ApiProperty({ description: '등급', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  grade: number; // 등급

  @ApiProperty({ description: '표준점수 (영어/한국사는 "0")', example: '131' })
  @IsString()
  @IsNotEmpty()
  standard_score: string; // 표준점수 (영어/한국사는 "0")

  @ApiProperty({ description: '백분위 (영어/한국사는 0)', example: 93 })
  @IsNumber()
  @IsNotEmpty()
  percentile: number; // 백분위 (영어/한국사는 0)
}

/**
 * 모의고사 표준점수 응답 DTO (나의 누적백분위 포함)
 */
export class GetMockExamStandardScoresResponseDto {
  @ApiProperty({
    description: '과목별 표준점수 목록',
    type: [GetMockExamStandardScoreDto],
  })
  data: GetMockExamStandardScoreDto[];

  @ApiProperty({
    description: '표점합 (국어 + 수학 + 탐구 상위 2과목)',
    example: 420,
  })
  standardScoreSum: number;

  @ApiProperty({
    description: '나의 누적백분위 (상위 %)',
    example: 0.09,
  })
  myCumulativePercentile: number;
}
