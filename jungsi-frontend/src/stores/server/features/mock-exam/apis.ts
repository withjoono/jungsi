import { makeApiCall } from "../../common-utils";
import { IMockExamRawScore, IMockExamStandardScoresResponse } from "./interfaces";

/**
 * 모의고사 점수 조회 (표준점수 + 표점합 + 나의 누적백분위)
 */
const fetchMockExamStandardScoresAPI = async (): Promise<IMockExamStandardScoresResponse> => {
  const res = await makeApiCall<void, IMockExamStandardScoresResponse>(
    "GET",
    "/mock-exam/standard",
  );
  if (res.success) {
    return res.data;
  }
  return { data: [], standardScoreSum: 0, myCumulativePercentile: 100 };
};

/**
 * 모의고사 원점수 조회
 */
const fetchMockExamRawScoresAPI = async () => {
  const res = await makeApiCall<void, IMockExamRawScore[]>(
    "GET",
    "/mock-exam/raw",
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

export const MOCK_EXAM_APIS = {
  fetchMockExamStandardScoresAPI,
  fetchMockExamRawScoresAPI,
};
