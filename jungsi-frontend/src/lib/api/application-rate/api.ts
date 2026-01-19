/**
 * 경쟁률 크롤링 API 함수
 */

import { publicClient } from '../instances';
import type {
  ApplicationRateResponse,
  ApplicationRateChange,
  CrawlSource,
  GetApplicationRateQuery,
  TriggerCrawlResponse,
} from './types';

const BASE_URL = '/application-rate';

/**
 * 경쟁률 데이터 조회
 */
export async function getApplicationRates(
  query?: GetApplicationRateQuery,
): Promise<ApplicationRateResponse[]> {
  const response = await publicClient.get<{ data: ApplicationRateResponse[] }>(BASE_URL, {
    params: query,
  });
  return response.data.data;
}

/**
 * 특정 대학 경쟁률 상세 조회
 */
export async function getUniversityDetail(
  universityCode: string,
): Promise<ApplicationRateResponse | null> {
  const response = await publicClient.get<{ data: ApplicationRateResponse | null }>(
    `${BASE_URL}/university/${universityCode}`,
  );
  return response.data.data;
}

/**
 * 최근 경쟁률 변동 내역 조회
 */
export async function getRecentChanges(
  universityCode?: string,
  limit?: number,
): Promise<ApplicationRateChange[]> {
  const response = await publicClient.get<{ data: ApplicationRateChange[] }>(
    `${BASE_URL}/changes`,
    {
      params: { universityCode, limit },
    },
  );
  return response.data.data;
}

/**
 * 크롤링 소스 목록 조회
 */
export async function getCrawlSources(): Promise<CrawlSource[]> {
  const response = await publicClient.get<{ data: CrawlSource[] }>(`${BASE_URL}/sources`);
  return response.data.data;
}

/**
 * 수동 크롤링 실행
 */
export async function triggerCrawl(universityCode?: string): Promise<TriggerCrawlResponse> {
  const response = await publicClient.post<{ data: TriggerCrawlResponse }>(`${BASE_URL}/crawl`, null, {
    params: { universityCode },
  });
  return response.data.data;
}
