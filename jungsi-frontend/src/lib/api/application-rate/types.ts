/**
 * 경쟁률 크롤링 API 타입 정의
 */

export interface ApplicationRateItem {
  universityName: string;
  departmentName: string;
  admissionType?: string;
  recruitmentCount: number;
  applicationCount: number;
  competitionRate: number;
}

export interface ApplicationRateSummary {
  totalRecruitment: number;
  totalApplication: number;
  overallRate: number;
  lastCrawledAt: string;
}

export interface ApplicationRateResponse {
  universityCode: string;
  universityName: string;
  summary: ApplicationRateSummary;
  items: ApplicationRateItem[];
}

export interface ApplicationRateChange {
  universityName: string;
  departmentName: string;
  previousCount: number;
  currentCount: number;
  changeAmount: number;
  previousRate: number;
  currentRate: number;
  recordedAt: string;
}

export interface CrawlSource {
  universityCode: string;
  universityName: string;
  sourceUrl: string;
  isActive: boolean;
}

export interface GetApplicationRateQuery {
  universityCode?: string;
  departmentName?: string;
  admissionType?: string;
}

export interface TriggerCrawlResponse {
  message: string;
  crawledCount: number;
}
