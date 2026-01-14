import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class ApplicationRateItemDto {
  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ description: '모집단위명' })
  departmentName: string;

  @ApiPropertyOptional({ description: '전형구분' })
  admissionType?: string;

  @ApiProperty({ description: '모집인원' })
  recruitmentCount: number;

  @ApiProperty({ description: '지원인원' })
  applicationCount: number;

  @ApiProperty({ description: '경쟁률' })
  competitionRate: number;
}

export class ApplicationRateSummaryDto {
  @ApiProperty({ description: '총 모집인원' })
  totalRecruitment: number;

  @ApiProperty({ description: '총 지원인원' })
  totalApplication: number;

  @ApiProperty({ description: '전체 경쟁률' })
  overallRate: number;

  @ApiProperty({ description: '마지막 크롤링 시간' })
  lastCrawledAt: Date;
}

export class ApplicationRateResponseDto {
  @ApiProperty({ description: '대학 코드' })
  universityCode: string;

  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ type: ApplicationRateSummaryDto })
  summary: ApplicationRateSummaryDto;

  @ApiProperty({ type: [ApplicationRateItemDto] })
  items: ApplicationRateItemDto[];
}

export class ApplicationRateChangeDto {
  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ description: '모집단위명' })
  departmentName: string;

  @ApiProperty({ description: '이전 지원인원' })
  previousCount: number;

  @ApiProperty({ description: '현재 지원인원' })
  currentCount: number;

  @ApiProperty({ description: '변동량' })
  changeAmount: number;

  @ApiProperty({ description: '이전 경쟁률' })
  previousRate: number;

  @ApiProperty({ description: '현재 경쟁률' })
  currentRate: number;

  @ApiProperty({ description: '기록 시간' })
  recordedAt: Date;
}

export class CrawlSourceDto {
  @ApiProperty({ description: '대학 코드' })
  @IsString()
  universityCode: string;

  @ApiProperty({ description: '대학명' })
  @IsString()
  universityName: string;

  @ApiProperty({ description: '크롤링 URL' })
  @IsString()
  sourceUrl: string;

  @ApiPropertyOptional({ description: '활성화 여부' })
  @IsOptional()
  isActive?: boolean;
}

export class GetApplicationRateQueryDto {
  @ApiPropertyOptional({ description: '대학 코드' })
  @IsOptional()
  @IsString()
  universityCode?: string;

  @ApiPropertyOptional({ description: '모집단위명 검색' })
  @IsOptional()
  @IsString()
  departmentName?: string;

  @ApiPropertyOptional({ description: '전형구분' })
  @IsOptional()
  @IsString()
  admissionType?: string;
}
