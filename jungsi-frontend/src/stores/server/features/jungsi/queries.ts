import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser } from "../me/queries";
import { JUNGSI_APIS } from "./apis";
import {
  IRegularAdmission,
  IRegularAdmissionDetail,
  ISavedScore,
  IPreviousResultsResponse,
} from "./interfaces";

export const jungsiQueryKeys = {
  all: ["jungsi"] as const,
  admissions: (params: {
    year: number;
    admission_type: string; // 가,나,다 군
  }) => [...jungsiQueryKeys.all, params] as const,
  detail: (params: { admissionId: number }) =>
    [...jungsiQueryKeys.all, "detail", params] as const,
  interests: (params: {
    admission_type: string; // 가,나,다 군
  }) => [...jungsiQueryKeys.all, params] as const,

  combination: () => [...jungsiQueryKeys.all, "combination"] as const,
  combinationDetail: (id: number) =>
    [...jungsiQueryKeys.all, "combinationDetail", id] as const,

  // 환산점수 계산 관련 쿼리 키
  calculatedScores: () => [...jungsiQueryKeys.all, "calculatedScores"] as const,
  calculatedScoreByUniversity: (universityId: number) =>
    [...jungsiQueryKeys.all, "calculatedScores", universityId] as const,
  // 입결분석 관련 쿼리 키
  previousResults: (admissionId: number) =>
    [...jungsiQueryKeys.all, "previousResults", admissionId] as const,
};

/**
 * [정시] 전형 조회
 */
export const useGetRegularAdmissions = (params: {
  year: number;
  admission_type: string; // 가,나,다 군
}) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IRegularAdmission[]>({
    queryKey: jungsiQueryKeys.admissions(params),
    queryFn: () =>
      JUNGSI_APIS.fetchRegularAPI({
        ...params,
      }),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * [정시] 전형 상세 조회
 */
export const useGetRegularAdmissionDetail = (params: {
  admissionId: number;
}) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IRegularAdmissionDetail | null>({
    queryKey: jungsiQueryKeys.detail(params),
    queryFn: () =>
      JUNGSI_APIS.fetchRegularDetailAPI({ id: params.admissionId }),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * [관심대학] 조회
 */
export const useGetInterestRegularAdmissions = (
  admissionType: "가" | "나" | "다" | "군외",
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: jungsiQueryKeys.interests({ admission_type: admissionType }),
    queryFn: () =>
      JUNGSI_APIS.fetchInterestRegularAPI(currentUser?.id || "", admissionType),
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetRegularCombinations = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: jungsiQueryKeys.combination(),
    queryFn: () =>
      JUNGSI_APIS.fetchRegularCombinationsAPI(currentUser?.id || ""),
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetRegularCombination = (combinationId: number) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: jungsiQueryKeys.combinationDetail(combinationId),
    queryFn: () =>
      JUNGSI_APIS.fetchRegularCombinationsAPI(currentUser?.id || "").then(
        (combinations) => combinations.find((c) => c.id === combinationId),
      ),
    enabled: !!currentUser && !!combinationId,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

// ============================================
// 정시 환산점수 계산 API 훅
// ============================================

/**
 * [정시] 저장된 환산점수 조회
 */
export const useGetCalculatedScores = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISavedScore[]>({
    queryKey: jungsiQueryKeys.calculatedScores(),
    queryFn: async () => {
      console.log("[useGetCalculatedScores] Fetching saved scores...");
      try {
        const result = await JUNGSI_APIS.fetchSavedScoresAPI();
        console.log("[useGetCalculatedScores] Result:", result);
        return result;
      } catch (error) {
        console.error("[useGetCalculatedScores] Error:", error);
        return [];
      }
    },
    enabled: !!currentUser,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * [정시] 특정 대학 환산점수 조회
 */
export const useGetCalculatedScoreByUniversity = (universityId: number) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISavedScore | null>({
    queryKey: jungsiQueryKeys.calculatedScoreByUniversity(universityId),
    queryFn: () => JUNGSI_APIS.fetchScoreByUniversityAPI(universityId),
    enabled: !!currentUser && !!universityId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * [정시] 환산점수 계산 및 저장 Mutation
 * POST /jungsi/calculate
 * 정시 분석 페이지 진입 시 호출하여 환산점수를 계산하고 저장
 */
export const useCalculateScores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => JUNGSI_APIS.calculateScoresAPI(),
    onSuccess: (data) => {
      console.log("[useCalculateScores] 환산점수 계산 완료:", data);
      // 캐시 무효화하여 새로운 환산점수 조회
      queryClient.invalidateQueries({
        queryKey: jungsiQueryKeys.calculatedScores(),
      });
    },
    onError: (error) => {
      console.error("[useCalculateScores] 환산점수 계산 실패:", error);
    },
  });
};

/**
 * [정시] 저장된 환산점수 삭제 Mutation
 */
export const useDeleteCalculatedScores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => JUNGSI_APIS.deleteScoresAPI(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jungsiQueryKeys.calculatedScores(),
      });
    },
  });
};

// ============================================
// 정시 입결분석 API 훅
// ============================================

/**
 * [정시] 입결분석 데이터 조회
 * GET /jungsi/admissions/:admissionId/previous-results
 */
export const useGetPreviousResults = (admissionId: number) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IPreviousResultsResponse | null>({
    queryKey: jungsiQueryKeys.previousResults(admissionId),
    queryFn: async () => {
      console.log("[useGetPreviousResults] Fetching for admissionId:", admissionId);
      const result = await JUNGSI_APIS.fetchPreviousResultsAPI(admissionId);
      console.log("[useGetPreviousResults] API Result:", result);
      return result;
    },
    enabled: !!currentUser && !!admissionId,
    staleTime: 0,
    refetchOnMount: true,
    retry: 1,
  });
};
