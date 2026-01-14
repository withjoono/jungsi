import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum WeekType {
  CURRENT = 'current',
  PREVIOUS = 'previous',
}

export enum MoodType {
  GOOD = 'good',
  NORMAL = 'normal',
  BAD = 'bad',
}

export class GetHealthQueryDto {
  @ApiPropertyOptional({
    description: '주간 선택',
    enum: WeekType,
    example: WeekType.CURRENT,
  })
  @IsOptional()
  @IsEnum(WeekType)
  week?: WeekType;
}

export class CreateHealthDto {
  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 7.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  @Type(() => Number)
  sleepHours?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  mealCount?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  exerciseMinutes?: number;

  @ApiPropertyOptional({ enum: MoodType, example: MoodType.GOOD })
  @IsOptional()
  @IsEnum(MoodType)
  mood?: MoodType;

  @ApiPropertyOptional({ example: '오늘 컨디션 좋음' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-01-15' })
  date: string;

  @ApiPropertyOptional({ example: 7.5 })
  sleepHours: number | null;

  @ApiPropertyOptional({ example: 3 })
  mealCount: number | null;

  @ApiPropertyOptional({ example: 30 })
  exerciseMinutes: number | null;

  @ApiPropertyOptional({ enum: MoodType, example: 'good' })
  mood: string | null;

  @ApiPropertyOptional({ example: '오늘 컨디션 좋음' })
  note: string | null;
}
