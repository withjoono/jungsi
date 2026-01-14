import { Controller, Get, Param } from '@nestjs/common';
import { StoreService } from './store.service';
import { PayServiceEntity } from 'src/database/entities/pay/pay-service.entity';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // 판매중인 상품 하나 조회
  @Get('available/:id')
  @Public()
  async findOneAvailable(@Param('id') id: number): Promise<PayServiceEntity> {
    return await this.storeService.findOneAvailable(id);
  }

  // 판매중인 상품목록 조회
  @Get('available')
  @Public()
  async findAvailable(): Promise<PayServiceEntity[]> {
    return await this.storeService.findAvailable();
  }
}
