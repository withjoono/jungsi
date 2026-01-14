import { ApiProperty } from '@nestjs/swagger';

export class GenerateCodeResponseDto {
  @ApiProperty({
    description: '생성된 6자리 코드',
    example: 'ABC123',
  })
  code: string;

  @ApiProperty({
    description: '코드 만료 시간',
    example: '2024-01-01T12:05:00.000Z',
  })
  expireAt: Date;
}
