import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMockTestsQueryDto {
  @ApiPropertyOptional({
    description: '연도',
    example: 2025,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;
}

export class MockTestResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025년 3월 모의고사' })
  testName: string;

  @ApiProperty({ example: '2025-03-07' })
  testDate: string;

  @ApiPropertyOptional({ example: 92 })
  korean: number | null;

  @ApiPropertyOptional({ example: 88 })
  math: number | null;

  @ApiPropertyOptional({ example: 95 })
  english: number | null;

  @ApiPropertyOptional({ example: 45 })
  history: number | null;

  @ApiPropertyOptional({ example: 48 })
  science1: number | null;

  @ApiPropertyOptional({ example: 46 })
  science2: number | null;

  @ApiPropertyOptional({ example: 414 })
  totalScore: number | null;

  @ApiPropertyOptional({ example: 95.5 })
  percentile: number | null;

  @ApiPropertyOptional({ example: 1 })
  grade: number | null;
}
