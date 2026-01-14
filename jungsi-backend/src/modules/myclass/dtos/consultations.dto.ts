import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConsultationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-01-10' })
  date: string;

  @ApiProperty({ example: 'student', enum: ['student', 'parent'] })
  type: string;

  @ApiProperty({ example: '홍길동 멘토' })
  mentor: string;

  @ApiPropertyOptional({ example: '진로 상담 진행. 수학 성적 향상 방안 논의.' })
  summary: string | null;

  @ApiPropertyOptional({ example: '2025-01-24' })
  nextDate: string | null;
}
