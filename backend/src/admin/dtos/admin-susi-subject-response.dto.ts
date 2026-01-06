import { ApiProperty } from '@nestjs/swagger';
import { SuSiSubjectEntity } from 'src/database/entities/susi/susi-subject.entity';

export class AdminSusiSubjectResponseDto {
  @ApiProperty({
    description: '수시 교과 통합DB 목록',
  })
  list!: SuSiSubjectEntity[];

  @ApiProperty({
    description: '전체 Count',
  })
  totalCount!: number;
}
