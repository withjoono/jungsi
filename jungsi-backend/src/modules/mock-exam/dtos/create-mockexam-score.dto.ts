import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMockExamRawScoreDto {
  @IsString()
  @IsNotEmpty()
  subject_code: string;

  @IsString()
  @IsNotEmpty()
  raw_score: string; // 원점수

  @IsNumber()
  @IsOptional()
  schedule_id?: number; // 2024년 6월 모의고사 아이디: 5
}

export class CreateMockExamStandardScoreDto {
  @IsString()
  @IsNotEmpty()
  subject_code: string;

  @IsNumber()
  @IsNotEmpty()
  standard_score: number; // 표준점수

  @IsNumber()
  @IsNotEmpty()
  grade: number; // 등급

  @IsNumber()
  @IsNotEmpty()
  percentile: number; // 백분위

  @IsNumber()
  @IsOptional()
  schedule_id?: number; // 2024년 6월 모의고사 아이디: 5
}
