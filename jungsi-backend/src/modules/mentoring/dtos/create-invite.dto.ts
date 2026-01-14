import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt, Min, Max, IsIn } from 'class-validator';

export class CreateInviteDto {
  @ApiPropertyOptional({
    description: '반 ID (선택)',
    example: 'class-uuid-1234',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  classId?: string;

  @ApiPropertyOptional({
    description: '반 이름 (선택)',
    example: '3학년 1반',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  className?: string;

  @ApiPropertyOptional({
    description: '초대 유형 (student: 학생, parent: 학부모)',
    example: 'student',
    default: 'student',
  })
  @IsString()
  @IsOptional()
  @IsIn(['student', 'parent'])
  inviteType?: string;

  @ApiPropertyOptional({
    description: '최대 사용 횟수',
    example: 100,
    default: 100,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(1000)
  maxUseCount?: number;

  @ApiPropertyOptional({
    description: '유효 기간 (일 단위)',
    example: 7,
    default: 7,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(365)
  validDays?: number;
}
