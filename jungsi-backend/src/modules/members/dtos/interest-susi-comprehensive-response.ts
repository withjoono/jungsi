import { MemberInterestsEntity } from 'src/database/entities/member/member-interests';
import { SusiComprehensiveEntity } from 'src/database/entities/susi/susi-comprehensive.entity';

// 모집단위 관련 데이터 조회
export class InterestSusiComprehensiveResponse {
  susi_comprehensive: SusiComprehensiveEntity;
  evaluation_id?: MemberInterestsEntity['evaluation_id'];
}
