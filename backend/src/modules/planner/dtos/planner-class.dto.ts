import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class SetPlannerClassDto {
  @ApiProperty({ description: '플래너 ID' })
  @IsNumber()
  plannerId: number;

  @ApiProperty({ description: '시작일 (YYYYMMDD)', example: '20240101' })
  @IsString()
  startDate: string;

  @ApiPropertyOptional({ description: '종료일 (YYYYMMDD)', example: '20241231' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ description: '클래스명' })
  @IsString()
  className: string;

  @ApiProperty({ description: '클래스 코드' })
  @IsString()
  classCode: string;
}

export class GetPlannersQueryDto {
  @ApiPropertyOptional({
    description: '조회 구분 (A: 전체 조회)',
    enum: ['A'],
  })
  @IsOptional()
  @IsString()
  dvsn?: string;
}

export class GetClassMembersQueryDto {
  @ApiProperty({ description: '플래너 ID' })
  @IsNumber()
  plannerId: number;
}
