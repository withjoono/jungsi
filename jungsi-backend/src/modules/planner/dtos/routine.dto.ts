import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class CreateRoutineDto {
  @ApiProperty({ description: '루틴명' })
  @IsString()
  title: string;

  @ApiProperty({ description: '시작 시간 (HH:MM)', example: '06:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: '종료 시간 (HH:MM)', example: '07:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ description: '반복 여부', default: true })
  @IsBoolean()
  repeat: boolean;

  @ApiPropertyOptional({ description: '특정 날짜 (반복 아닌 경우, YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: '요일 배열 [일,월,화,수,목,금,토]',
    type: [Boolean],
    example: [false, true, true, true, true, true, false],
  })
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @IsBoolean({ each: true })
  days: boolean[];
}

export class UpdateRoutineDto extends CreateRoutineDto {
  @ApiProperty({ description: '수정할 루틴 ID' })
  @IsNumber()
  id: number;
}

export class DeleteRoutineDto {
  @ApiProperty({ description: '삭제할 루틴 ID' })
  @IsNumber()
  id: number;
}
