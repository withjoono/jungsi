import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlannerController } from './planner.controller';
import { PlannerService } from './planner.service';
import {
  PlanEntity,
  PlannerItemEntity,
  RoutineEntity,
  PlannerClassEntity,
  PlannerManagementEntity,
  PlannerNoticeEntity,
} from '../../database/entities/planner';
import { MemberEntity } from '../../database/entities/member/member.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([
      PlanEntity,
      PlannerItemEntity,
      RoutineEntity,
      PlannerClassEntity,
      PlannerManagementEntity,
      PlannerNoticeEntity,
      MemberEntity,
    ]),
  ],
  controllers: [PlannerController],
  providers: [PlannerService],
  exports: [PlannerService],
})
export class PlannerModule {}
