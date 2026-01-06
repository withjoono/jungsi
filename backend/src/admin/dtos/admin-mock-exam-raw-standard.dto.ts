import { ApiProperty } from '@nestjs/swagger';
import { MockexamRawToStandardEntity } from 'src/database/entities/mock-exam/mockexam-raw-to-standard.entity';

export class AdminMockExamRawToStandardResponseDto {
  @ApiProperty({
    description: '원점수 변환 데이터 조회',
  })
  list!: MockexamRawToStandardEntity[];

  @ApiProperty({
    description: '전체 Count',
  })
  totalCount!: number;
}
