/**
 * 모의고사 표준점수
 * Note: API 응답은 snake_case지만 axios 인터셉터에서 camelCase로 변환됨
 */
export interface IMockExamScore {
  code: string;
  grade: number;
  standardScore: string;  // camelCase (axios interceptor converts from standard_score)
  percentile: number;
}

/**
 * 모의고사 원점수
 */
export interface IMockExamRawScore {
  id: number;
  raw_score: string;
  subject_code: string;
}

/**
 * 모의고사 일정
 */
export interface IMockExamSchedule {
  id: number;
  mockexam_month: string;
  mockexam_year: string;
}

// 모의고사 원점수 저장
export interface ISaveMockExamRawScoresData {
  subject_code: string; // 과목 코드 (ex. S1, S3, S5 ...)
  raw_score: number; // 원점수
  schedule_id?: number; // 2024년 6월 모의고사 아이디: 5
}

// 모의고사 표준점수 저장
export interface ISaveMockExamStandardScoresData {
  subject_code: string; // 과목 코드 (ex. S1, S3, S5 ...)
  standard_score: number; // 표준점수
  percentile: number; // 백분위
  grade: number; // 학년
  schedule_id?: number; // 2024년 6월 모의고사 아이디: 5
}

/**
 * 모의고사 표준점수 (폼 초기화용)
 * Note: API 응답은 snake_case지만 axios 인터셉터에서 camelCase로 변환됨
 */
export interface IMockExamStandardScore {
  subjectCode: string;  // camelCase
  grade: number;
  standardScore: string;  // camelCase
  percentile: number;
}

/**
 * 모의고사 표준점수 API 응답 (나의 누적백분위 포함)
 */
export interface IMockExamStandardScoresResponse {
  data: IMockExamScore[];
  standardScoreSum: number;        // 표점합 (국어 + 수학 + 탐구 상위 2과목)
  myCumulativePercentile: number;  // 나의 누적백분위 (상위 %)
}
