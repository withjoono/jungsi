import { ApiProperty } from '@nestjs/swagger';
import { EssayListEntity } from 'src/database/entities/essay/essay-list.entity';
import { EssayLowestGradeListEntity } from 'src/database/entities/essay/essay-lowest-grade-list.entity';

export class AdminEssayListResponse {
  @ApiProperty({
    description: '논술 통합 DB 목록',
  })
  list!: (EssayListEntity & EssayLowestGradeListEntity)[];

  @ApiProperty({
    description: '전체 Count',
  })
  totalCount!: number;
}
