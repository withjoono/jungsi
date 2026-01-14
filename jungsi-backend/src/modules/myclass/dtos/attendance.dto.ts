import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-01-15' })
  date: string;

  @ApiPropertyOptional({ example: '08:30' })
  checkIn: string | null;

  @ApiPropertyOptional({ example: '22:00' })
  checkOut: string | null;

  @ApiProperty({ example: 'present', enum: ['present', 'late', 'absent', 'excused'] })
  status: string;
}
