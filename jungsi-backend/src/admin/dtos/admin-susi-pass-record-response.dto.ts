import { ApiProperty } from '@nestjs/swagger';
import { SusiPassRecordEntity } from 'src/database/entities/susi/susi-pass-record.entity';

export class AdminSusiPassRecordResponseDto {
  @ApiProperty({
    description: '합불사례 데이터 조회',
  })
  list!: SusiPassRecordEntity[];

  @ApiProperty({
    description: '전체 Count',
  })
  totalCount!: number;
}
