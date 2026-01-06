import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export enum PrimaryType {
  STUDY = '학습',
  CLASS = '수업',
}

export class CreatePlannerItemDto {
  @ApiProperty({ description: '유형', enum: PrimaryType })
  @IsEnum(PrimaryType)
  primaryType: PrimaryType;

  @ApiPropertyOptional({ description: '과목' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: '선생님 (수업인 경우)' })
  @IsOptional()
  @IsString()
  teacher?: string;

  @ApiProperty({ description: '제목' })
  @IsString()
  title: string;

  @ApiProperty({ description: '시작 일시 (ISO 8601 형식)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '종료 일시 (ISO 8601 형식)' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: '반복 규칙 (iCalendar 형식, 예: FREQ=WEEKLY;BYDAY=MO,WE,FR)',
  })
  @IsOptional()
  @IsString()
  rRule?: string;

  @ApiPropertyOptional({ description: '반복 예외 날짜 (쉼표로 구분)' })
  @IsOptional()
  @IsString()
  exDate?: string;

  @ApiPropertyOptional({ description: '지각 여부' })
  @IsOptional()
  @IsBoolean()
  late?: boolean;

  @ApiPropertyOptional({ description: '결석 여부' })
  @IsOptional()
  @IsBoolean()
  absent?: boolean;

  @ApiPropertyOptional({ description: '설명/메모' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '성취도 (0-100)' })
  @IsOptional()
  @IsNumber()
  progress?: number;

  @ApiPropertyOptional({ description: '점수' })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ description: '등수' })
  @IsOptional()
  @IsNumber()
  rank?: number;

  @ApiPropertyOptional({ description: '멘토 평가 등급' })
  @IsOptional()
  @IsNumber()
  mentorRank?: number;

  @ApiPropertyOptional({ description: '멘토 코멘트' })
  @IsOptional()
  @IsString()
  mentorDesc?: string;

  @ApiPropertyOptional({ description: '멘토 테스트 결과' })
  @IsOptional()
  @IsString()
  mentorTest?: string;

  @ApiPropertyOptional({ description: '학습 유형' })
  @IsOptional()
  @IsString()
  studyType?: string;

  @ApiPropertyOptional({ description: '학습 내용' })
  @IsOptional()
  @IsString()
  studyContent?: string;

  @ApiPropertyOptional({ description: '시작 페이지' })
  @IsOptional()
  @IsNumber()
  startPage?: number;

  @ApiPropertyOptional({ description: '종료 페이지' })
  @IsOptional()
  @IsNumber()
  endPage?: number;

  @ApiPropertyOptional({ description: '시작 강의 번호' })
  @IsOptional()
  @IsNumber()
  startSession?: number;

  @ApiPropertyOptional({ description: '종료 강의 번호' })
  @IsOptional()
  @IsNumber()
  endSession?: number;
}

export class UpdatePlannerItemDto extends CreatePlannerItemDto {
  @ApiProperty({ description: '수정할 일정 ID' })
  @IsNumber()
  id: number;
}

export class DeletePlannerItemDto {
  @ApiProperty({ description: '삭제할 일정 ID' })
  @IsNumber()
  id: number;
}
