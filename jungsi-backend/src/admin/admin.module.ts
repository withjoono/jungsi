import { Module } from '@nestjs/common';
import { EssayModule } from 'src/modules/essay/essay.module';
import { SusiModule } from 'src/modules/susi/susi.module';
import { AdminSusiSubjectService } from './services/admin-susi-subject.service';
import { AdminSusiSubjectController } from './controllers/admin-susi-subject.controller';
import { AdminEssayController } from './controllers/admin-essay.controller';
import { AdminEssayService } from './services/admin-essay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSusiComprehensiveController } from './controllers/admin-susi-comprehensive.controller';
import { AdminSusiComprehensiveService } from './services/admin-susi-comprehensive.service';
import { SusiPassRecordEntity } from 'src/database/entities/susi/susi-pass-record.entity';
import { AdminSusiPassRecordController } from './controllers/admin-susi-pass-record.controller';
import { AdminSusiPassRecordService } from './services/admin-susi-pass-record.service';
import { MemberEntity } from 'src/database/entities/member/member.entity';
import { AdminStatisticController } from './controllers/admin-statistic.controller';
import { AdminStatisticService } from './services/admin-statistic.service';
import { MockexamRawToStandardEntity } from 'src/database/entities/mock-exam/mockexam-raw-to-standard.entity';
import { AdminMockExamController } from './controllers/admin-mock-exam.controller';
import { AdminMockExamService } from './services/admin-mock-exam.service';
import { PayOrderEntity } from 'src/database/entities/pay/pay-order.entity';
import { AdminPaymentController } from './controllers/admin-pay.controller';
import { AdminPaymentService } from './services/admin-pay.service';
import { PayContractEntity } from 'src/database/entities/pay/pay-contract.entity';
import { AdminMemberController } from './controllers/admin-member.controller';
import { AdminMemberService } from './services/admin-member.service';
import { PayProductEntity } from 'src/database/entities/pay/pay-product.entity';
import { PayServiceEntity } from 'src/database/entities/pay/pay-service.entity';
import { PayServiceProductEntity } from 'src/database/entities/pay/pay-service-product.entity';
import { PayCouponEntity } from 'src/database/entities/pay/pay-coupon.entity';
import { AdminProductManagementController } from './controllers/admin-product-management.controller';
import { AdminProductManagementService } from './services/admin-product-management.service';

@Module({
  imports: [
    EssayModule,
    SusiModule,
    TypeOrmModule.forFeature([
      SusiPassRecordEntity,
      MemberEntity,
      MockexamRawToStandardEntity,
      PayOrderEntity,
      PayContractEntity,
      PayProductEntity,
      PayServiceEntity,
      PayServiceProductEntity,
      PayCouponEntity,
    ]),
  ],
  controllers: [
    AdminEssayController,
    AdminSusiComprehensiveController,
    AdminSusiSubjectController,
    AdminSusiPassRecordController,
    AdminStatisticController,
    AdminMockExamController,
    AdminPaymentController,
    AdminMemberController,
    AdminProductManagementController,
  ],
  providers: [
    AdminEssayService,
    AdminSusiComprehensiveService,
    AdminSusiSubjectService,
    AdminSusiPassRecordService,
    AdminStatisticService,
    AdminMockExamService,
    AdminPaymentService,
    AdminMemberService,
    AdminProductManagementService,
  ],
})
export class AdminModule {}
