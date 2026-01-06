import { ApiProperty } from '@nestjs/swagger';

export class MentorInfoDto {
  @ApiProperty({ description: '멘토 ID', example: 123 })
  id: number;

  @ApiProperty({ description: '멘토 이름', example: '홍길동', nullable: true })
  nickname: string | null;

  @ApiProperty({
    description: '멘토 타입 (student, teacher, parent)',
    example: 'student',
  })
  memberType: string;

  @ApiProperty({ description: '이메일', example: 'test@example.com' })
  email: string;
}

export class VerifyCodeResponseDto {
  @ApiProperty({
    description: '멘토 계정 ID',
    example: 123,
  })
  mentorId: number;

  @ApiProperty({
    description: '멘토 정보',
    type: MentorInfoDto,
  })
  mentorInfo: MentorInfoDto;
}
