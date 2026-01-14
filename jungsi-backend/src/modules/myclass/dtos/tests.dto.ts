import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

export enum TestFilterType {
  ALL = 'all',
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export class GetTestsQueryDto {
  @ApiPropertyOptional({
    description: '필터 타입',
    enum: TestFilterType,
    example: TestFilterType.ALL,
  })
  @IsOptional()
  @IsEnum(TestFilterType)
  filter?: TestFilterType;
}

export class TestResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '수학 단원평가' })
  title: string;

  @ApiProperty({ example: '수학' })
  subject: string;

  @ApiProperty({ example: '2025-01-15' })
  date: string;

  @ApiPropertyOptional({ example: 85 })
  score: number | null;

  @ApiProperty({ example: 100 })
  totalScore: number;

  @ApiPropertyOptional({ example: 5 })
  rank: number | null;

  @ApiPropertyOptional({ example: 30 })
  totalStudents: number | null;

  @ApiProperty({ example: 'completed', enum: ['pending', 'completed', 'missed'] })
  status: string;
}
