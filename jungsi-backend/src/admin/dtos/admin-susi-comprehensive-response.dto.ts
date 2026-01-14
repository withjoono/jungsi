import { ApiProperty } from '@nestjs/swagger';
import { SusiComprehensiveEntity } from 'src/database/entities/susi/susi-comprehensive.entity';

export class AdminSusiComprehensiveResponseDto {
  @ApiProperty({
    description: '수시 학종 통합DB 목록',
  })
  list!: SusiComprehensiveEntity[];

  @ApiProperty({
    description: '전체 Count',
  })
  totalCount!: number;
}
