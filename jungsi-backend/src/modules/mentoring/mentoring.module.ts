import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentoringController } from './mentoring.controller';
import { MentoringService } from './mentoring.service';
import { TempCodeEntity } from '../../database/entities/mentoring/temp-code.entity';
import { AccountLinkEntity } from '../../database/entities/mentoring/account-link.entity';
import { AdminClassEntity } from '../../database/entities/mentoring/admin-class.entity';
import { MentoringInviteEntity } from '../../database/entities/mentoring/invite.entity';
import { MemberEntity } from '../../database/entities/member/member.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([
      TempCodeEntity,
      AccountLinkEntity,
      AdminClassEntity,
      MentoringInviteEntity,
      MemberEntity,
    ]),
  ],
  controllers: [MentoringController],
  providers: [MentoringService],
  exports: [MentoringService],
})
export class MentoringModule {}
