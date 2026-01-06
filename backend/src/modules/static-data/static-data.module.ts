import { Module } from '@nestjs/common';
import { StaticDataController } from './static-data.controller';
import { StaticDataService } from './static-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectCodeListEntity } from 'src/database/entities/common-code/subject-code-list-entity';
import { GeneralFieldEntity } from 'src/database/entities/core/general-field.entity';
import { MajorFieldEntity } from 'src/database/entities/core/major-field.entity';
import { MidFieldEntity } from 'src/database/entities/core/mid-field.entity';
import { MinorFieldEntity } from 'src/database/entities/core/minor-field.entity';
import { AdmissionSubtypeEntity } from 'src/database/entities/core/admission-subtype.entity';
import { UniversityEntity } from 'src/database/entities/core/university.entity';
import { AdmissionEntity } from 'src/database/entities/core/admission.entity';
import { RecruitmentUnitEntity } from 'src/database/entities/core/recruitment-unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubjectCodeListEntity,
      GeneralFieldEntity,
      MajorFieldEntity,
      MidFieldEntity,
      MinorFieldEntity,
      AdmissionSubtypeEntity,
      UniversityEntity,
      AdmissionEntity,
      RecruitmentUnitEntity,
    ]),
  ],
  controllers: [StaticDataController],
  providers: [StaticDataService],
})
export class StaticDataModule {}
