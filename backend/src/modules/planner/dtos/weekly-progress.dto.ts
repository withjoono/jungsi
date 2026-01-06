import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PrimaryType } from './planner-item.dto';

export class GetWeeklyProgressQueryDto {
  @ApiProperty({
    description: '유형 (학습 또는 수업)',
    enum: PrimaryType,
  })
  @IsEnum(PrimaryType)
  primaryType: PrimaryType;
}

export interface WeeklyProgressResponse {
  primaryType: string | null;
  memberId: number | null;
  startDateDay: string | null;
  comnCd: number;
  comnNm: string;
  avgProgress: number;
}
