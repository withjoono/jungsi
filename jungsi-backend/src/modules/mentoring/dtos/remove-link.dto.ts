import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class RemoveLinkDto {
  @ApiProperty({
    description: '연동 해제할 회원 ID',
    example: 123,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  linkedMemberId: number;
}
