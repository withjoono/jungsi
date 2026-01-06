import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodeController } from './common-code.controller';
import { SubjectCodesService } from './services/subject-code.service';
import { SubjectCodeListEntity } from 'src/database/entities/common-code/subject-code-list-entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectCodeListEntity])],
  providers: [SubjectCodesService],
  controllers: [CommonCodeController],
  exports: [SubjectCodesService],
})
export class CommonCodeModule {}
