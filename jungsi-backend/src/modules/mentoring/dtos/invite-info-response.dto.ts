import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteInfoResponseDto {
  @ApiProperty({
    description: '초대 코드',
    example: 'ABC123XYZ789',
  })
  inviteCode: string;

  @ApiProperty({
    description: '선생님 ID',
    example: 1,
  })
  teacherId: number;

  @ApiProperty({
    description: '선생님 이름',
    example: '홍길동',
  })
  teacherName: string;

  @ApiPropertyOptional({
    description: '반 ID',
    example: 'class-uuid-1234',
  })
  classId?: string;

  @ApiPropertyOptional({
    description: '반 이름',
    example: '3학년 1반',
  })
  className?: string;

  @ApiProperty({
    description: '초대 유형 (student: 학생, parent: 학부모)',
    example: 'student',
  })
  inviteType: string;

  @ApiProperty({
    description: '사용 횟수',
    example: 5,
  })
  useCount: number;

  @ApiProperty({
    description: '최대 사용 횟수',
    example: 100,
  })
  maxUseCount: number;

  @ApiProperty({
    description: '활성 상태',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '만료 일시',
    example: '2024-01-08T12:00:00.000Z',
  })
  expireAt: Date;

  @ApiProperty({
    description: '생성 일시',
    example: '2024-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '유효 여부 (만료/비활성화/최대사용 체크)',
    example: true,
  })
  isValid: boolean;
}
