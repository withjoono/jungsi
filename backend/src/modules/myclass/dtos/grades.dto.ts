import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetGradesQueryDto {
  @ApiPropertyOptional({
    description: '학기 (예: "1학년 1학기", "1학년 2학기")',
    example: '1학년 1학기',
  })
  @IsOptional()
  @IsString()
  semester?: string;
}

export class GradeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '국어' })
  subject: string;

  @ApiProperty({ example: 3 })
  unit: number;

  @ApiProperty({ example: 15 })
  rank: number;

  @ApiProperty({ example: 2 })
  grade: number;

  @ApiProperty({ example: 92 })
  score: number;

  @ApiProperty({ example: 75.5 })
  average: number;

  @ApiProperty({ example: 12.3 })
  stddev: number;

  @ApiProperty({ example: '1학년 1학기' })
  semester: string;
}
