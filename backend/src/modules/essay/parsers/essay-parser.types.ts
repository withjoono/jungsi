/**
 * Essay Parser Types
 * 논술 파서 타입 정의
 */

export interface ParsedEssay {
  integrationCode: string;
  collegeCode: string;
  admissionSeriesCode: string;
  typeTime: string;
  essaySubject: string;
  examinationTendency: string;
  recruitmentUnit: string;
  susi: string;
  competitionRate: string;
  essayType: string;
  typeRate: string;
  studentRecruitmentNum: number;
  admissionDate: string;
  admissionTime: string;
  commonScience: number;
  mulone: number;
  hwaone: number;
  sangone: number;
  jiown: number;
  mulonetwo: number;
  hwaonetwo: number;
  sangonetwo: number;
  jiowntwo: number;
  selectScienceSubject: number;
  commonMath: number;
  suoneSutwo: number;
  pbSt: number;
  dfIn: number;
  geometry: number;
  selectMathSubject: number;
  suNosul: string;
  crossSupport: number;
  scienceDesignation: number;
  exceptNonsul: number;
  munMathen: number;
  rthreeEtcFlag: number;
  rthreeRegionFlag: number;
  rthreeEtcCode: string;
  rthreeRegionInfo: string;
}

export interface ParsedEssayLowestGrade {
  collegeCode: string;
  essayId: number;
  lowestMath: number;
  lowestMigi: number;
  lowestKorean: number;
  lowestEnglish: number;
  content: string;
  lowestSociety: number;
  lowestScience: number;
  lowestCount: number;
  lowestSum: number;
  lowestUse: number;
  lowestHistory: number;
  lowestCal: number;
}

export interface ParsedEssayAvailableMath {
  collegeCode: string;
  admissionSeriesCode: string;
  commonMath: number;
  suoneSutwo: number;
  pbSt: number;
  dfIn: number;
  geometry: number;
}

export interface ParsedEssayPercentile {
  collegeName: string;
  collegeCode: string;
  admissionSeriesCode: string;
  percentileTop: number;
  percentileBottom: number;
  scheduleId: number;
}

export interface ParsedEssayResult {
  essays: ParsedEssay[];
  lowestGrades: ParsedEssayLowestGrade[];
}
