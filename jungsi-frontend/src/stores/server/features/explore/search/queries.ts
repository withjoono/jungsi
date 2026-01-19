import { useQuery } from "@tanstack/react-query";
import { EXPLORE_SEARCH_APIS } from "./apis";
import {
  IAdmissionWithCategory,
  IExploreSearchAdmissionResponse,
  IExploreSearchRecruitmentUnitResponse,
  IExploreSearchUniversityResponse,
  ISearchSusiComparison,
} from "./interfaces";

export const exploreEarlySubjectQueryKeys = {
  all: ["explore-search"] as const,

  university: (name: string) =>
    [...exploreEarlySubjectQueryKeys.all, "university", name] as const,
  admission: (name: string) =>
    [...exploreEarlySubjectQueryKeys.all, "admission", name] as const,
  recruitmentUnit: (name: string) =>
    [...exploreEarlySubjectQueryKeys.all, "recruitmentUnit", name] as const,
  admissionsByUniversity: (universityId: number) =>
    [
      ...exploreEarlySubjectQueryKeys.all,
      "admissionsByUniversity",
      universityId,
    ] as const,
  recruitmentUnitsByAdmission: (admissionId: number) =>
    [
      ...exploreEarlySubjectQueryKeys.all,
      "recruitmentUnitsByAdmission",
      admissionId,
    ] as const,

  allUniversities: () =>
    [...exploreEarlySubjectQueryKeys.all, "allUniversities"] as const,
  recruitmentUnitsByIds: (ids: number[]) =>
    [
      ...exploreEarlySubjectQueryKeys.all,
      "recruitmentUnitsByIds",
      ids,
    ] as const,
};

export const useGetExploreSearchUniversity = (params: { name: string }) => {
  return useQuery<IExploreSearchUniversityResponse[]>({
    queryKey: exploreEarlySubjectQueryKeys.university(params.name),
    queryFn: () => EXPLORE_SEARCH_APIS.fetchExploreSearchUniversityAPI(params),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetExploreSearchAdmission = (params: { name: string }) => {
  return useQuery<IExploreSearchAdmissionResponse[]>({
    queryKey: exploreEarlySubjectQueryKeys.admission(params.name),
    queryFn: () => EXPLORE_SEARCH_APIS.fetchExploreSearchAdmissionAPI(params),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetExploreSearchRecruitmentUnit = (params: {
  name: string;
}) => {
  return useQuery<IExploreSearchRecruitmentUnitResponse[]>({
    queryKey: exploreEarlySubjectQueryKeys.recruitmentUnit(params.name),
    queryFn: () =>
      EXPLORE_SEARCH_APIS.fetchExploreSearchRecruitmentUnitAPI(params),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetAllUniversities = () => {
  return useQuery<{ id: number; name: string; region: string }[]>({
    queryKey: exploreEarlySubjectQueryKeys.allUniversities(),
    queryFn: EXPLORE_SEARCH_APIS.fetchAllUniversitiesAPI,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetAdmissionsByUniversityId = (universityId: number) => {
  return useQuery<IAdmissionWithCategory[]>({
    queryKey: exploreEarlySubjectQueryKeys.admissionsByUniversity(universityId),
    queryFn: () =>
      EXPLORE_SEARCH_APIS.fetchAdmissionsByUniversityIdAPI(universityId),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetRecruitmentUnitsByAdmissionId = (admissionId: number) => {
  return useQuery<{ id: number; name: string }[]>({
    queryKey:
      exploreEarlySubjectQueryKeys.recruitmentUnitsByAdmission(admissionId),
    queryFn: () =>
      EXPLORE_SEARCH_APIS.fetchRecruitmentUnitsByAdmissionIdAPI(admissionId),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetRecruitmentUnitsByIds = (recruitmentIds: number[]) => {
  return useQuery<Array<ISearchSusiComparison>>({
    queryKey:
      exploreEarlySubjectQueryKeys.recruitmentUnitsByIds(recruitmentIds),
    queryFn: () =>
      EXPLORE_SEARCH_APIS.fetchRecruitmentUnitsByIdsAPI(recruitmentIds),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: recruitmentIds.length > 0, // recruitmentIds가 비어있지 않을 때만 쿼리 실행
  });
};
