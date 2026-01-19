import { useQuery } from "@tanstack/react-query";
import {
  IExploreEarlySubjectDetailResponse,
  IExploreEarlySubjectStep1Response,
  IExploreEarlySubjectStep2Response,
  IExploreEarlySubjectStep3Response,
  IExploreEarlySubjectStep4Response,
  IExploreEarlySubjectStep5Response,
} from "./interfaces";
import { EXPLORE_EARLY_SUBJECT_APIS } from "./apis";
import { useGetCurrentUser } from "../../me/queries";

export const exploreEarlySubjectQueryKeys = {
  all: ["explore-early-subject"] as const,
  step1: (params: { year: number; basicType: string }) =>
    [...exploreEarlySubjectQueryKeys.all, "step-1", params] as const,
  step2: (recruitmentUnitIds: number[]) =>
    [
      ...exploreEarlySubjectQueryKeys.all,
      "step-2",
      recruitmentUnitIds,
    ] as const,
  step3: (recruitmentUnitIds: number[]) =>
    [
      ...exploreEarlySubjectQueryKeys.all,
      "step-3",
      recruitmentUnitIds,
    ] as const,
  step4: (recruitmentUnitIds: number[]) =>
    [
      ...exploreEarlySubjectQueryKeys.all,
      "step-4",
      recruitmentUnitIds,
    ] as const,
  step5: (recruitmentUnitIds: number[]) =>
    [
      ...exploreEarlySubjectQueryKeys.all,
      "step-5",
      recruitmentUnitIds,
    ] as const,
  detail: (recruitmentUnitId: number) =>
    [...exploreEarlySubjectQueryKeys.all, "detail", recruitmentUnitId] as const,
};

export const useGetExploreEarlySubjectStep1 = (params: {
  year: number;
  basicType: string;
}) => {
  return useQuery<IExploreEarlySubjectStep1Response>({
    queryKey: exploreEarlySubjectQueryKeys.step1(params),
    queryFn: () =>
      EXPLORE_EARLY_SUBJECT_APIS.fetchExploreEarlySubjectStep1API(params),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetExploreEarlySubjectStep2 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreEarlySubjectStep2Response>({
    queryKey: exploreEarlySubjectQueryKeys.step2(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_EARLY_SUBJECT_APIS.fetchExploreEarlySubjectStep2API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreEarlySubjectStep3 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreEarlySubjectStep3Response>({
    queryKey: exploreEarlySubjectQueryKeys.step3(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_EARLY_SUBJECT_APIS.fetchExploreEarlySubjectStep3API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreEarlySubjectStep4 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreEarlySubjectStep4Response>({
    queryKey: exploreEarlySubjectQueryKeys.step4(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_EARLY_SUBJECT_APIS.fetchExploreEarlySubjectStep4API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreEarlySubjectStep5 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreEarlySubjectStep5Response>({
    queryKey: exploreEarlySubjectQueryKeys.step5(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_EARLY_SUBJECT_APIS.fetchExploreEarlySubjectStep5API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreEarlySubjectDetail = (recruitmentUnitId: number) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreEarlySubjectDetailResponse | null>({
    queryKey: exploreEarlySubjectQueryKeys.detail(recruitmentUnitId),
    queryFn: () =>
      EXPLORE_EARLY_SUBJECT_APIS.fetchExploreEarlySubjectDetailAPI({
        id: recruitmentUnitId,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser,
  });
};
