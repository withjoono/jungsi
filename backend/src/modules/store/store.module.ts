import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayServiceEntity } from 'src/database/entities/pay/pay-service.entity';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PayServiceEntity])],
  providers: [StoreService],
  controllers: [StoreController],
})
export class StoreModule {}
