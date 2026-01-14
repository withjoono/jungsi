import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddStudentDto {
  @ApiProperty({ description: '추가할 학생의 회원 ID' })
  @IsNumber()
  studentId: number;

  @ApiProperty({ description: '반 ID (그룹 ID)', required: false })
  @IsOptional()
  @IsString()
  classId?: string;
}
