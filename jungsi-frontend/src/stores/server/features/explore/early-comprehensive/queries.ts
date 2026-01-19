import { useQuery } from "@tanstack/react-query";
import {
  IExploreEarlyComprehensiveDetailResponse,
  IExploreEarlyComprehensiveStep1Response,
  IExploreEarlyComprehensiveStep2Response,
  IExploreEarlyComprehensiveStep3Response,
  IExploreEarlyComprehensiveStep4Response,
} from "./interfaces";
import { EXPLORE_EARLY_COMPREHENSIVE_APIS } from "./apis";
import { useGetCurrentUser } from "../../me/queries";

export const exploreEarlyComprehensiveQueryKeys = {
  all: ["explore-early-subject"] as const,
  step1: (params: { year: number; basicType: string }) =>
    [...exploreEarlyComprehensiveQueryKeys.all, "step-1", params] as const,
  step2: (recruitmentUnitIds: number[]) =>
    [
      ...exploreEarlyComprehensiveQueryKeys.all,
      "step-2",
      recruitmentUnitIds,
    ] as const,
  step3: (recruitmentUnitIds: number[]) =>
    [
      ...exploreEarlyComprehensiveQueryKeys.all,
      "step-3",
      recruitmentUnitIds,
    ] as const,
  step4: (recruitmentUnitIds: number[]) =>
    [
      ...exploreEarlyComprehensiveQueryKeys.all,
      "step-4",
      recruitmentUnitIds,
    ] as const,
  detail: (recruitmentUnitId: number) =>
    [
      ...exploreEarlyComprehensiveQueryKeys.all,
      "detail",
      recruitmentUnitId,
    ] as const,
};

export const useGetExploreEarlyComprehensiveStep1 = (params: {
  year: number;
  basicType: string;
  minorFieldId: number | null;
}) => {
  return useQuery<IExploreEarlyComprehensiveStep1Response>({
    queryKey: exploreEarlyComprehensiveQueryKeys.step1(params),
    queryFn: () =>
      EXPLORE_EARLY_COMPREHENSIVE_APIS.fetchExploreEarlyComprehensiveStep1API(
        params,
      ),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!params.minorFieldId,
  });
};

export const useGetExploreEarlyComprehensiveStep2 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreEarlyComprehensiveStep2Response>({
    queryKey: exploreEarlyComprehensiveQueryKeys.step2(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_EARLY_COMPREHENSIVE_APIS.fetchExploreEarlyComprehensiveStep2API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreEarlyComprehensiveStep3 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreEarlyComprehensiveStep3Response>({
    queryKey: exploreEarlyComprehensiveQueryKeys.step3(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_EARLY_COMPREHENSIVE_APIS.fetchExploreEarlyComprehensiveStep3API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreEarlyComprehensiveStep4 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreEarlyComprehensiveStep4Response>({
    queryKey: exploreEarlyComprehensiveQueryKeys.step4(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_EARLY_COMPREHENSIVE_APIS.fetchExploreEarlyComprehensiveStep4API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreEarlyComprehensiveDetail = (
  recruitmentUnitId: number,
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreEarlyComprehensiveDetailResponse | null>({
    queryKey: exploreEarlyComprehensiveQueryKeys.detail(recruitmentUnitId),
    queryFn: () =>
      EXPLORE_EARLY_COMPREHENSIVE_APIS.fetchExploreEarlyComprehensiveDetailAPI({
        id: recruitmentUnitId,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser,
  });
};
