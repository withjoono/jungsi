import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayOrderEntity } from 'src/database/entities/pay/pay-order.entity';
import { PaymentController } from './pay.controller';
import { PaymentService } from './pay.service';
import { PayCancelLogEntity } from 'src/database/entities/pay/pay-cancel-log.entity';
import { PayCouponEntity } from 'src/database/entities/pay/pay-coupon.entity';
import { PayServiceEntity } from 'src/database/entities/pay/pay-service.entity';
import { PayContractEntity } from 'src/database/entities/pay/pay-contract.entity';
import { OfficerTicketEntity } from 'src/database/entities/officer-evaluation/officer-ticket.entity';
import { CouponService } from './services/coupon.service';
import { ContractService } from './services/contract.service';
import { IamPortService } from './services/iamport.service';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PayOrderEntity,
      PayCancelLogEntity,
      PayCouponEntity,
      PayServiceEntity,
      PayContractEntity,
      OfficerTicketEntity,
    ]),
    HttpModule,
    forwardRef(() => MembersModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, CouponService, ContractService, IamPortService],
  exports: [PaymentService],
})
export class PaymentModule {}
