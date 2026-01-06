import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NoticeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '공지사항 제목' })
  title: string;

  @ApiPropertyOptional({ example: '공지사항 내용' })
  content: string | null;

  @ApiProperty({ example: '2025-01-01' })
  date: string;

  @ApiProperty({ example: true })
  isImportant: boolean;
}
