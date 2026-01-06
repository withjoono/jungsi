import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

export enum RankPeriodType {
  DAILY = 'D',
  WEEKLY = 'W',
  MONTHLY = 'M',
}

export class GetRankQueryDto {
  @ApiPropertyOptional({
    description: '기간 타입 (D: 일간, W: 주간, M: 월간)',
    enum: RankPeriodType,
    example: RankPeriodType.WEEKLY,
  })
  @IsOptional()
  @IsEnum(RankPeriodType)
  str_dwm?: RankPeriodType;
}

export class RankResponseDto {
  @ApiProperty({ example: 5, description: '내 랭킹' })
  myRank: number;

  @ApiProperty({ example: 100, description: '전체 학생 수' })
  totalStudents: number;

  @ApiProperty({ example: 85, description: '내 성취도' })
  myAchievement: number;

  @ApiProperty({ example: 90, description: '일간 성취도' })
  dailyAchievement: number;

  @ApiProperty({ example: 85, description: '주간 성취도' })
  weeklyAchievement: number;

  @ApiProperty({ example: 80, description: '월간 성취도' })
  monthlyAchievement: number;
}

export class PlannerMentorResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiPropertyOptional({ example: '수학' })
  subject: string | null;

  @ApiPropertyOptional({ example: 'https://...' })
  profileImage: string | null;

  @ApiPropertyOptional({ example: '010-1234-5678' })
  phone: string | null;
}
