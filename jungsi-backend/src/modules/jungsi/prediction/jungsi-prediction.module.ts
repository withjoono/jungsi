import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JungsiPredictionController } from './jungsi-prediction.controller';
import { JungsiPredictionService } from './jungsi-prediction.service';
import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [JungsiPredictionController],
  providers: [JungsiPredictionService],
  exports: [JungsiPredictionService],
})
export class JungsiPredictionModule {}
