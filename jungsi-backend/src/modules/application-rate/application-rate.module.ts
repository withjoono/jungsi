import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ApplicationRateController } from './application-rate.controller';
import { ApplicationRateService } from './application-rate.service';
import { ApplicationRate } from './entities/application-rate.entity';
import { ApplicationRateHistory } from './entities/application-rate-history.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([ApplicationRate, ApplicationRateHistory]),
  ],
  controllers: [ApplicationRateController],
  providers: [ApplicationRateService],
  exports: [ApplicationRateService],
})
export class ApplicationRateModule {}
