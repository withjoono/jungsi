import { Module } from '@nestjs/common';
import { MockApplicationController } from './mock-application.controller';
import { MockApplicationService } from './mock-application.service';

@Module({
  controllers: [MockApplicationController],
  providers: [MockApplicationService],
  exports: [MockApplicationService],
})
export class MockApplicationModule {}
