import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AddLinkDto {
  @ApiProperty({
    description: '멘토(연동할 상대) 회원 ID',
    example: 123,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  mentorId: number;
}
