import { useQuery } from "@tanstack/react-query";
import { IMockExamRawScore } from "./interfaces";
import { MOCK_EXAM_APIS } from "./apis";
import { useGetCurrentUser } from "../me/queries";
import {
  IEnrichedMockExamScoreResponse,
  processMockExamScores,
} from "@/lib/utils/services/mock-exam";

export const mockExamQueryKeys = {
  all: ["mockExam"] as const,
  standardScores: () => [...mockExamQueryKeys.all, "standardScores"] as const, // 표준점수 조회
  rawScores: () => [...mockExamQueryKeys.all, "rawScores"] as const, // 원점수 조회
};

/**
 * 모의고사 성적 조회 (표준점수 + 표점합 + 나의 누적백분위)
 */
export const useGetMockExamStandardScores = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IEnrichedMockExamScoreResponse>({
    queryKey: mockExamQueryKeys.standardScores(),
    queryFn: async () => {
      const response = await MOCK_EXAM_APIS.fetchMockExamStandardScoresAPI();
      const result = processMockExamScores(response);
      return result;
    },
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * 모의고사 성적 조회 (원점수)
 */
export const useGetMockExamRawScores = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IMockExamRawScore[]>({
    queryKey: mockExamQueryKeys.rawScores(),
    queryFn: MOCK_EXAM_APIS.fetchMockExamRawScoresAPI,
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};
