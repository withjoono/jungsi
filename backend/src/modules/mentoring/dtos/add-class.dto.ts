import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class AddClassDto {
  @ApiProperty({ description: '반 이름', example: '3학년 1반' })
  @IsString()
  @MaxLength(100)
  className: string;
}
