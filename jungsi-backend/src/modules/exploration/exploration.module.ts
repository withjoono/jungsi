import { Module } from '@nestjs/common';
import { ExploreEarlyAdmissionController } from './controllers/explore-early-admission.controller';
import { ExploreEarlySubjectService } from './services/explore-early-subject.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionEntity } from 'src/database/entities/core/admission.entity';
import { RecruitmentUnitEntity } from 'src/database/entities/core/recruitment-unit.entity';
import { ExploreEarlyComprehensiveService } from './services/explore-early-comprehensive.service';
import { ExploreSearchController } from './controllers/explore-search.controller';
import { ExploreSearchService } from './services/explore-search.service';
import { UniversityEntity } from 'src/database/entities/core/university.entity';
import { RegularAdmissionEntity } from 'src/database/entities/core/regular-admission.entity';
import { ExploreRegularService } from './services/explore-regular-admission.service';
import { ExploreRegularController } from './controllers/explore-regular-admission.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdmissionEntity,
      RecruitmentUnitEntity,
      UniversityEntity,
      RegularAdmissionEntity,
    ]),
  ],
  controllers: [ExploreEarlyAdmissionController, ExploreSearchController, ExploreRegularController],
  providers: [
    ExploreEarlySubjectService,
    ExploreEarlyComprehensiveService,
    ExploreSearchService,
    ExploreRegularService,
  ],
})
export class ExplorationModule {}
