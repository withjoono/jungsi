import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from '../members/members.module';
import { SmsModule } from '../sms/sms.module';
import { AdmissionCategoryEntity } from 'src/database/entities/core/admission-category.entity';
import { AdmissionSubtypeEntity } from 'src/database/entities/core/admission-subtype.entity';
import { MajorFieldEntity } from 'src/database/entities/core/major-field.entity';
import { MidFieldEntity } from 'src/database/entities/core/mid-field.entity';
import { MinorFieldEntity } from 'src/database/entities/core/minor-field.entity';
import { UniversityEntity } from 'src/database/entities/core/university.entity';
import { RecruitmentUnitEntity } from 'src/database/entities/core/recruitment-unit.entity';
import { GeneralFieldEntity } from 'src/database/entities/core/general-field.entity';
import { RecruitmentUnitInterviewEntity } from 'src/database/entities/core/recruitment-unit-interview.entity';
import { RecruitmentUnitMinimumGradeEntity } from 'src/database/entities/core/recruitment-unit-minimum_grade.entity';
import { RecruitmentUnitScoreEntity } from 'src/database/entities/core/recruitment-unit-score.entity';
import { RecruitmentUnitPreviousResultEntity } from 'src/database/entities/core/recruitment-unit-previous-result.entity';
import { AdmissionEntity } from 'src/database/entities/core/admission.entity';
import { AdmissionMethodEntity } from 'src/database/entities/core/admission-method.entity';
import { CoreUniversityController } from './controllers/core-university.controller';
import { CoreUniversityService } from './services/core-university.service';
import { CoreAdmissionSubtypeController } from './controllers/core-admission-subtype.controller';
import { CoreAdmissionSubtypeService } from './services/core-admission-subtype.service';
import { CoreAdmissionCategoryService } from './services/core-admission-category.service';
import { CoreAdmissionCategoryController } from './controllers/core-admission-category.controller';
import { CoreFieldsController } from './controllers/core-fields.controller';
import { CoreFieldsService } from './services/core-fields.service';
import { CoreAdmissionService } from './services/core-admission.service';
import { CoreAdmissionController } from './controllers/core-admission.controller';
import { CoreRecruitmentUnitService } from './services/core-recruitment.service';
import { CoreRecruitmentController } from './controllers/core-recruitment.controller';
import { RegularAdmissionEntity } from 'src/database/entities/core/regular-admission.entity';
import { RegularAdmissionPreviousResultEntity } from 'src/database/entities/core/regular-admission-previous-result.entity';
import { CoreRegularAdmissionService } from './services/core-regular-admission.service';
import { CoreRegularAdmissionController } from './controllers/core-regular-admission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 전형 관련
      AdmissionEntity, // 전형 (일반전형, 학교장추천전형, 고른기회전형 등)
      AdmissionMethodEntity, // 전형방법 (서류/교과 비율, 지원자격 등)
      AdmissionCategoryEntity, // 학생부종합, 학생부교과 등
      AdmissionSubtypeEntity, // 농어촌, 특기자 등

      // 계열 관련
      MajorFieldEntity, // 대계열
      MidFieldEntity, // 중계열
      MinorFieldEntity, // 소계열
      GeneralFieldEntity, // 일반, 자연, 의치한약수 등

      // 대학 관련
      UniversityEntity,

      // 모집단위 관련
      RecruitmentUnitEntity,
      RecruitmentUnitInterviewEntity, // 면접정보
      RecruitmentUnitMinimumGradeEntity, // 최저
      RecruitmentUnitScoreEntity, // 성적정보(교과컷, 환산컷, 위험도 등등)
      RecruitmentUnitPreviousResultEntity, // 과거 입결 정보

      // 정시 관련
      RegularAdmissionEntity,
      RegularAdmissionPreviousResultEntity,
    ]),
    MembersModule,
    SmsModule,
  ],
  providers: [
    CoreUniversityService,
    CoreAdmissionService,
    CoreAdmissionSubtypeService,
    CoreAdmissionCategoryService,
    CoreFieldsService,
    CoreRecruitmentUnitService,
    CoreRegularAdmissionService,
  ],
  controllers: [
    CoreUniversityController,
    CoreAdmissionController,
    CoreAdmissionSubtypeController,
    CoreAdmissionCategoryController,
    CoreFieldsController,
    CoreRecruitmentController,
    CoreRegularAdmissionController,
  ],
  exports: [],
})
export class CoreModule {}
