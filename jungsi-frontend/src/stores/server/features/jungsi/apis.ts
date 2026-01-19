import { makeApiCall } from "@/stores/server/common-utils";
import { authClient } from "@/lib/api";
import { AxiosError } from "axios";
import {
  IRegularAdmission,
  IRegularAdmissionDetail,
  IRegularCombination,
  ISavedScore,
  IDeleteScoresResponse,
  IPreviousResultsResponse,
} from "./interfaces";

/**
 * [정시] 전형 조회 API
 */
const fetchRegularAPI = async ({
  year,
  admission_type,
}: {
  year: number;
  admission_type: string;
}): Promise<IRegularAdmission[]> => {
  const res = await makeApiCall<void, { items: IRegularAdmission[] }>(
    "GET",
    `/explore/regular`,
    undefined,
    {
      params: {
        year,
        admission_type,
      },
    },
  );
  if (res.success) {
    return res.data.items;
  }
  return [];
};

/**
 * [관심대학] 정시 전형 조회
 */
const fetchInterestRegularAPI = async (
  memberId: string,
  admissionType: "가" | "나" | "다" | "군외",
) => {
  const res = await makeApiCall<void, IRegularAdmission[]>(
    "GET",
    `/members/${memberId}/regular-interests`,
    undefined,
    {
      params: {
        admissionType: admissionType,
      },
    },
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchRegularCombinationsAPI = async (memberId: string) => {
  const res = await makeApiCall<void, IRegularCombination[]>(
    "GET",
    `/members/${memberId}/regular-combinations`,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

const createRegularCombinationAPI = async (
  memberId: string,
  body: {
    name: string;
    ids: number[];
  },
) => {
  const res = await makeApiCall<
    {
      name: string;
      ids: number[];
    },
    IRegularCombination
  >("POST", `/members/${memberId}/regular-combinations`, body);

  if (res.success) {
    return res.data;
  }
  return null;
};

const updateRegularCombinationAPI = async (
  memberId: string,
  combinationId: number,
  body: {
    name: string;
  },
) => {
  const res = await makeApiCall<
    {
      name: string;
    },
    IRegularCombination
  >(
    "PATCH",
    `/members/${memberId}/regular-combinations/${combinationId}`,
    body,
  );

  if (res.success) {
    return res.data;
  }
  return null;
};

const deleteRegularCombinationAPI = async (
  memberId: string,
  combinationId: number,
) => {
  const res = await makeApiCall<void, void>(
    "DELETE",
    `/members/${memberId}/regular-combinations/${combinationId}`,
  );

  return res.success;
};

const fetchRegularDetailAPI = async ({ id }: { id: number }) => {
  const res = await makeApiCall<void, IRegularAdmissionDetail>(
    "GET",
    `/explore/regular/${id}`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return null;
};

// ============================================
// 정시 환산점수 조회 API
// ============================================

/**
 * [정시] 저장된 환산점수 조회
 * 사용자의 저장된 모든 대학 환산점수를 조회
 */
const fetchSavedScoresAPI = async (): Promise<ISavedScore[]> => {
  try {
    const response = await authClient.get<{ success: boolean; data: ISavedScore[] }>('/jungsi/scores');
    return response.data.data || [];
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[API] fetchSavedScoresAPI error:", axiosError.message);
    throw error;
  }
};

/**
 * [정시] 특정 대학 환산점수 조회
 */
const fetchScoreByUniversityAPI = async (
  universityId: number,
): Promise<ISavedScore | null> => {
  try {
    const response = await authClient.get<{ success: boolean; data: ISavedScore | null }>(
      `/jungsi/scores/${universityId}`,
    );
    return response.data.data;
  } catch {
    return null;
  }
};

/**
 * [정시] 저장된 환산점수 삭제
 */
const deleteScoresAPI = async (): Promise<IDeleteScoresResponse> => {
  const response = await authClient.delete<{ success: boolean; data: IDeleteScoresResponse }>(
    '/jungsi/scores',
  );
  return response.data.data;
};

// ============================================
// 정시 환산점수 계산 API
// ============================================

/**
 * [정시] 환산점수 계산 및 저장
 * POST /jungsi/calculate
 * 사용자의 수능 점수를 기반으로 모든 대학 환산점수를 계산하고 저장
 */
const calculateScoresAPI = async (): Promise<{ calculated: number; saved: number }> => {
  try {
    const response = await authClient.post<{
      success: boolean;
      data: { calculated: number; saved: number };
    }>('/jungsi/calculate');
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("[API] calculateScoresAPI error:", axiosError.message);
    console.error("[API] calculateScoresAPI response:", axiosError.response?.data);
    console.error("[API] calculateScoresAPI status:", axiosError.response?.status);
    throw error;
  }
};

// ============================================
// 정시 입결분석 API
// ============================================

/**
 * [정시] 입결분석 데이터 조회
 * GET /jungsi/admissions/:admissionId/previous-results
 */
const fetchPreviousResultsAPI = async (
  admissionId: number,
): Promise<IPreviousResultsResponse | null> => {
  try {
    const response = await authClient.get<{ success: boolean; data: IPreviousResultsResponse }>(
      `/jungsi/admissions/${admissionId}/previous-results`,
    );
    return response.data.data;
  } catch {
    return null;
  }
};

export const JUNGSI_APIS = {
  fetchRegularAPI,
  fetchInterestRegularAPI,
  fetchRegularCombinationsAPI,
  createRegularCombinationAPI,
  updateRegularCombinationAPI,
  deleteRegularCombinationAPI,
  fetchRegularDetailAPI,
  // 환산점수 API
  fetchSavedScoresAPI,
  fetchScoreByUniversityAPI,
  deleteScoresAPI,
  calculateScoresAPI,
  // 입결분석 API
  fetchPreviousResultsAPI,
};
