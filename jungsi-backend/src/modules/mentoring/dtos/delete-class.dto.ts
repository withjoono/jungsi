import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteClassDto {
  @ApiProperty({ description: '삭제할 반 ID' })
  @IsString()
  classId: string;
}
