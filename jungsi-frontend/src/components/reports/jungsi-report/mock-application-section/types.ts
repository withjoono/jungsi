// 모의지원현황 데이터 타입 정의

export interface MockApplicationBasicInfo {
  universityCode: string;
  universityName: string;
  admissionType: string; // 가/나/다군
  recruitmentUnit: string; // 학과명
  recruitmentCount: number;
  competitionRate: number;
  additionalPassRank: number;
  totalPassCount: number;
  mockApplicantCount: number;
  stats?: {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    safePassThreshold: number | null;
    passThreshold: number | null;
  };
}

export interface FrequencyDistributionItem {
  scoreLower: number;
  scoreUpper: number;
  applicantCount: number;
  cumulativeCount: number;
  passStatus: string;
}

export interface ApplicantItem {
  rank: number;
  score: number;
  passStatus: string;
  note: string | null;
}

export interface MockApplicationData {
  basicInfo: Record<string, MockApplicationBasicInfo>;
  frequencyDistribution: Record<string, FrequencyDistributionItem[]>;
  applicants: Record<string, ApplicantItem[]>;
}

// 히스토그램 차트용 데이터 타입
export interface HistogramBin {
  range: string;
  scoreLower: number;
  scoreUpper: number;
  count: number;
  passStatus: string;
}
