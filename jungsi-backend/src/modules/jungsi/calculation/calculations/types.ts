/**
 * 백엔드용 모의고사 점수 인터페이스
 * 프론트엔드 IEnrichedMockExamScore 대체
 */
export interface MockExamScoreInput {
  subjectCategory: 'kor' | 'math' | 'eng' | 'history' | 'society' | 'science' | 'lang';
  subjectName: string;
  standardScore: string;
  grade: number;
  percentile: number;
}

/**
 * 대학별 환산점수 계산 결과
 */
export interface UniversityCalculatedScore {
  regularAdmissionId: number; // 정시 모집단위 ID
  universityId: number;
  universityName: string;
  recruitmentName: string; // 모집단위명
  admissionType: string; // 모집군 (가/나/다)
  admissionName: string; // 전형명
  scoreCalculation: string; // 환산식 코드명 (내부용)
  scoreCalculationCode: string; // 환산식 코드 (SC001 형태, 외부 노출용)
  major: string; // 계열 (인문/자연)
  success: boolean;
  result?: string; // 실패 사유 (미적기하필수, 확통필수 등)
  convertedScore?: number; // 환산점수
  standardScoreSum?: number; // 표점합
  cumulativePercentile?: number; // 상위누적백분위
  optimalScore?: number; // 동점수 평균 환산점수 (유불리 점수표에서 조회)
  scoreDifference?: number; // 유불리 (optimalScore - convertedScore, 양수면 유리, 음수면 불리)
  advantageDisadvantagePercentile?: number; // 유불리 백분위 차이
  minCut?: number; // 최소 컷라인 (50%컷)
  maxCut?: number; // 최대 컷라인 (70%컷)
  riskScore?: number; // 위험도 점수 (-15 ~ 10)
  calculatedAt: Date;
}

/**
 * 사용자 점수 계산 요청 DTO
 */
export interface CalculateScoresRequest {
  memberId: number;
  mockExamScores: MockExamScoreInput[];
  universityIds?: number[]; // 선택적: 특정 대학만 계산
}

/**
 * 사용자 점수 계산 결과
 */
export interface CalculateScoresResponse {
  memberId: number;
  calculatedAt: Date;
  totalUniversities: number;
  successCount: number;
  failedCount: number;
  scores: UniversityCalculatedScore[];
}

/**
 * 위험도 계산용 데이터 타입
 */
export interface SubjectRiskData {
  risk_1?: number;
  risk_2?: number;
  risk_3?: number;
  risk_4?: number;
  risk_5?: number;
  risk_6?: number;
  risk_7?: number;
  risk_8?: number;
  risk_9?: number;
  risk_10?: number;
}

/**
 * 누백대입표 타입 (사용자 누백 조회용)
 * 표점합 → 누적백분위 매핑
 */
export interface 누백대입표Type {
  [score: string]: string;
}

/**
 * 환산인자별 누백 데이터 타입
 * 표점합 기준으로 각 대학 환산인자의 누적백분위 저장
 */
export interface 환산인자누백Type {
  factors: string[]; // 환산인자명 목록 (557개)
  data: {
    [표점합: string]: {
      누백: number; // 사용자 기본 누백
      [환산인자: string]: number; // 환산인자별 누백
    };
  };
}

export interface 점수표Type {
  [과목: string]: {
    [표준점수: string]: {
      백분위: number;
      등급: number;
      '누적(%)': number;
      [학교: string]: number | string;
    };
  };
}

export interface 학교조건Type {
  [key: string]: {
    필수과목: {
      미적기하: boolean;
      확통: boolean;
      과탐: boolean;
      사탐: boolean;
    };
    환산식코드: number;
    탐구과목수: number;
    기본점수: number;
  };
}

export interface 과목점수Type {
  과목: string;
  표준점수?: number;
  등급?: number;
  백분위?: number;
}

export interface 정시점수계산Params {
  학교: string;
  이문과: string;
  국어: 과목점수Type;
  수학: 과목점수Type;
  영어: 과목점수Type;
  한국사: 과목점수Type;
  과탐1?: 과목점수Type;
  과탐2?: 과목점수Type;
  사탐1?: 과목점수Type;
  사탐2?: 과목점수Type;
  제2외국어?: 과목점수Type;
}

export interface 정시점수계산결과 {
  success: boolean;
  result?: string;
  내점수?: number;
  퍼센트순위?: number;
  표점합?: number;
}

export interface 환산점수계산Params {
  학교: string;
  이문과: string;
  국어환산점수: number;
  수학환산점수: number;
  영어환산점수: number;
  한국사환산점수: number;
  과탐1환산점수: number | null;
  과탐2환산점수: number | null;
  사탐1환산점수: number | null;
  사탐2환산점수: number | null;
  제2외국어환산점수: number | null;
  국어: 과목점수Type;
  수학: 과목점수Type;
  영어: 과목점수Type;
  한국사: 과목점수Type;
  과탐1?: 과목점수Type;
  과탐2?: 과목점수Type;
  사탐1?: 과목점수Type;
  사탐2?: 과목점수Type;
  제2외국어?: 과목점수Type;
}

export interface 유불리Type {
  [시트: string]: {
    점수환산: number;
    [학교: string]: number;
  }[];
}
