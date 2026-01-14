import { ApiProperty } from '@nestjs/swagger';

export class CreateInviteResponseDto {
  @ApiProperty({
    description: '생성된 초대 코드',
    example: 'ABC123XYZ789',
  })
  inviteCode: string;

  @ApiProperty({
    description: '초대 링크 URL',
    example: 'https://turtleskool.com/invite/ABC123XYZ789',
  })
  inviteUrl: string;

  @ApiProperty({
    description: '만료 일시',
    example: '2024-01-08T12:00:00.000Z',
  })
  expireAt: Date;

  @ApiProperty({
    description: '최대 사용 횟수',
    example: 100,
  })
  maxUseCount: number;
}
