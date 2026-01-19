import { useState, useEffect, useMemo } from "react";
import type {
  MockApplicationData,
  MockApplicationBasicInfo,
  FrequencyDistributionItem,
  ApplicantItem,
} from "./types";

interface UseMockApplicationDataParams {
  universityCode: string;
  universityName: string;
  recruitmentUnit: string;
  admissionType?: string; // 군은 매칭에 사용하지 않음
}

interface UseMockApplicationDataResult {
  isLoading: boolean;
  error: string | null;
  basicInfo: MockApplicationBasicInfo | null;
  frequencyDistribution: FrequencyDistributionItem[];
  applicants: ApplicantItem[];
  rowId: string | null;
}

// 데이터 캐시
let cachedData: MockApplicationData | null = null;

// 문자열 정규화 (중간점, 공백, 특수문자 제거)
function normalizeString(str: string): string {
  return str.replace(/[·\s\-_·]/g, "").toLowerCase();
}

// 대학명 매칭 (강원대 <-> 강원대학교)
function matchUniversityName(name1: string, name2: string): boolean {
  const n1 = normalizeString(name1);
  const n2 = normalizeString(name2);
  return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

// 모집단위 매칭 (건축토목환경공학부 <-> 건축·토목·환경공학부)
function matchRecruitmentUnit(unit1: string, unit2: string): boolean {
  const u1 = normalizeString(unit1);
  const u2 = normalizeString(unit2);
  return u1 === u2 || u1.includes(u2) || u2.includes(u1);
}

export function useMockApplicationData({
  universityCode,
  universityName,
  recruitmentUnit,
}: UseMockApplicationDataParams): UseMockApplicationDataResult {
  const [data, setData] = useState<MockApplicationData | null>(cachedData);
  const [isLoading, setIsLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dataResponse = await fetch("/data/mock-application-data.json");
        if (!dataResponse.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다.");
        }
        const mockData = await dataResponse.json() as MockApplicationData;
        cachedData = mockData;
        setData(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 대학/모집단위만으로 매칭 (군은 제외)
  const rowId = useMemo(() => {
    if (!data || !recruitmentUnit) {
      return null;
    }

    for (const [id, info] of Object.entries(data.basicInfo)) {
      const nameMatch = universityName
        ? matchUniversityName(info.universityName, universityName)
        : info.universityCode === universityCode;
      const unitMatch = matchRecruitmentUnit(info.recruitmentUnit, recruitmentUnit);

      // 대학명과 모집단위만 매칭 (군은 무시)
      if (nameMatch && unitMatch) {
        console.log("[MockApplicationData] Found match:", {
          rowId: id,
          universityName: info.universityName,
          recruitmentUnit: info.recruitmentUnit,
          admissionType: info.admissionType,
        });
        return id;
      }
    }

    console.log("[MockApplicationData] No match found for:", {
      universityName,
      universityCode,
      recruitmentUnit,
    });

    return null;
  }, [data, universityCode, universityName, recruitmentUnit]);

  const result = useMemo(() => {
    if (!data || !rowId) {
      return {
        basicInfo: null,
        frequencyDistribution: [],
        applicants: [],
      };
    }

    return {
      basicInfo: data.basicInfo[rowId] || null,
      frequencyDistribution: data.frequencyDistribution?.[rowId] || [],
      applicants: data.applicants?.[rowId] || [],
    };
  }, [data, rowId]);

  return {
    isLoading,
    error,
    rowId,
    ...result,
  };
}
