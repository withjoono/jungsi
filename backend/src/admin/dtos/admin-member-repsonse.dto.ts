import { ApiProperty } from '@nestjs/swagger';
import { MemberEntity } from 'src/database/entities/member/member.entity';

export class AdminMemberResponseDto {
  @ApiProperty({
    description: '모든 유저 목록',
  })
  list!: MemberEntity[];

  @ApiProperty({
    description: '전체 Count',
  })
  totalCount!: number;
}
