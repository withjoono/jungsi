/**
 * 경쟁률 크롤링 데이터 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApplicationRates,
  getUniversityDetail,
  getRecentChanges,
  getCrawlSources,
  triggerCrawl,
  type GetApplicationRateQuery,
} from '@/lib/api/application-rate';

const QUERY_KEYS = {
  applicationRates: ['applicationRates'] as const,
  universityDetail: (code: string) => ['applicationRates', 'university', code] as const,
  recentChanges: (code?: string) => ['applicationRates', 'changes', code] as const,
  crawlSources: ['applicationRates', 'sources'] as const,
};

/**
 * 경쟁률 데이터 조회 훅
 * @param query 검색 조건
 * @param refetchInterval 자동 갱신 간격 (기본: 5분)
 */
export function useApplicationRates(query?: GetApplicationRateQuery, refetchInterval = 5 * 60 * 1000) {
  return useQuery({
    queryKey: [...QUERY_KEYS.applicationRates, query],
    queryFn: () => getApplicationRates(query),
    refetchInterval,
    staleTime: 60 * 1000, // 1분간 fresh
  });
}

/**
 * 특정 대학 경쟁률 상세 조회 훅
 */
export function useUniversityDetail(universityCode: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.universityDetail(universityCode),
    queryFn: () => getUniversityDetail(universityCode),
    enabled: enabled && !!universityCode,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}

/**
 * 최근 변동 내역 조회 훅
 */
export function useRecentChanges(universityCode?: string, limit?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.recentChanges(universityCode), limit],
    queryFn: () => getRecentChanges(universityCode, limit),
    refetchInterval: 60 * 1000, // 1분마다 갱신 (변동 감지용)
    staleTime: 30 * 1000,
  });
}

/**
 * 크롤링 소스 목록 조회 훅
 */
export function useCrawlSources() {
  return useQuery({
    queryKey: QUERY_KEYS.crawlSources,
    queryFn: getCrawlSources,
    staleTime: 10 * 60 * 1000, // 10분간 fresh
  });
}

/**
 * 수동 크롤링 실행 훅
 */
export function useTriggerCrawl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (universityCode?: string) => triggerCrawl(universityCode),
    onSuccess: () => {
      // 크롤링 완료 후 데이터 갱신
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applicationRates });
    },
  });
}
