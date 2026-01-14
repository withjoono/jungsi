import { ApiProperty } from '@nestjs/swagger';

export class LinkedMemberDto {
  @ApiProperty({ description: '회원 ID', example: 123 })
  id: number;

  @ApiProperty({ description: '이름', example: '홍길동', nullable: true })
  nickname: string | null;

  @ApiProperty({
    description: '회원 타입 (student, teacher, parent)',
    example: 'student',
  })
  memberType: string;

  @ApiProperty({ description: '이메일', example: 'test@example.com' })
  email: string;

  @ApiProperty({
    description: '연락처',
    example: '010-1234-5678',
  })
  phone: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profileImageUrl: string | null;

  @ApiProperty({
    description: '가입일',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  createdAt: Date | null;

  @ApiProperty({
    description: '자기소개',
    example: '안녕하세요',
    nullable: true,
  })
  introduction: string | null;
}
