import { SubjectCodeListEntity } from 'src/database/entities/common-code/subject-code-list-entity';
import { AdmissionSubtypeEntity } from 'src/database/entities/core/admission-subtype.entity';
import { GeneralFieldEntity } from 'src/database/entities/core/general-field.entity';
import { MajorFieldEntity } from 'src/database/entities/core/major-field.entity';
import { MidFieldEntity } from 'src/database/entities/core/mid-field.entity';
import { MinorFieldEntity } from 'src/database/entities/core/minor-field.entity';

export class StaticDataDto {
  subjectCodes: SubjectCodeListEntity[]; // 교과 코드
  generalFields: GeneralFieldEntity[]; // 일반 계열(인문,자연,의치한약수 등)
  majorFields: MajorFieldEntity[]; // 대계열
  midFields: MidFieldEntity[]; // 중계열
  minorFields: MinorFieldEntity[]; // 소계열
  admissionSubtypes: AdmissionSubtypeEntity[]; // 특별 전형 필터
  // 검색어 추천(대학, 전형, 모집단위)
  universityNames: string[];
  admissionNames: string[];
  recruitmentUnitNames: string[];
}
