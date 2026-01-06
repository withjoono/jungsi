import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EssayListEntity } from 'src/database/entities/essay/essay-list.entity';
import { EssayService } from './essay.service';
import { EssayLowestGradeListEntity } from 'src/database/entities/essay/essay-lowest-grade-list.entity';
import { EssayExcelParserService } from './parsers/excel-parser.service';

@Module({
  imports: [TypeOrmModule.forFeature([EssayListEntity, EssayLowestGradeListEntity])],
  providers: [EssayService, EssayExcelParserService],
  exports: [EssayService, EssayExcelParserService],
})
export class EssayModule {}
