import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export enum PlanType {
  LECTURE = 0,
  TEXTBOOK = 1,
}

export class CreatePlanDto {
  @ApiProperty({ description: '계획명' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '과목 (국어, 수학, 영어 등)' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: '학습 단계 (기초, 심화 등)' })
  @IsOptional()
  @IsString()
  step?: string;

  @ApiPropertyOptional({ description: '시작일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDay?: string;

  @ApiPropertyOptional({ description: '종료일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDay?: string;

  @ApiPropertyOptional({
    description: '유형 (textbook: 교재, lecture: 강의)',
    enum: ['textbook', 'lecture'],
  })
  @IsOptional()
  @IsString()
  type?: 'textbook' | 'lecture';

  @ApiPropertyOptional({ description: '교재명/강의명' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ description: '총 분량 (페이지/강의수)' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: '담당 선생님' })
  @IsOptional()
  @IsString()
  person?: string;

  @ApiPropertyOptional({ description: '완료 분량', default: 0 })
  @IsOptional()
  @IsNumber()
  finished?: number;
}

export class UpdatePlanDto extends CreatePlanDto {
  @ApiProperty({ description: '수정할 계획 ID' })
  @IsNumber()
  id: number;
}

export class UpdatePlanProgressDto {
  @ApiPropertyOptional({ description: '상위 계획 ID' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: '토글할 아이템 ID' })
  @IsNumber()
  itemId: number;

  @ApiProperty({ description: '증가/감소할 양' })
  @IsNumber()
  done: number;
}
