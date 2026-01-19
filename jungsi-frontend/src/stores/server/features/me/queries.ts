import { useQuery } from "@tanstack/react-query";
import { USER_API } from "./apis";
import { ISchoolRecord } from "./interfaces";
import { calculateMyAverageRating } from "@/lib/calculations/school-record/score";

export const meQueryKeys = {
  all: ["me"] as const,
  activeServices: () => [...meQueryKeys.all, "activeServices"] as const,
  schoolRecords: () => [...meQueryKeys.all, "schoolRecords"] as const,
};

/**
 * 로그인한 유저 조회
 */
export const useGetCurrentUser = () =>
  useQuery({
    queryKey: meQueryKeys.all,
    queryFn: USER_API.fetchCurrentUserAPI,
    retry: false, // 401 에러 시 재시도하지 않음
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재시도하지 않음
    refetchOnMount: false, // 마운트 시 재시도하지 않음
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });

/**
 * 유저의 활성화 중인 서비스 조회
 */
export const useGetActiveServices = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: meQueryKeys.activeServices(),
    queryFn: USER_API.fetchCurrentUserActiveServicesAPI,
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * [생기부] 통합 데이터 조회
 */
export const useGetSchoolRecords = () => {
  const { data: currentUser } = useGetCurrentUser();

  return useQuery<ISchoolRecord>({
    queryKey: meQueryKeys.schoolRecords(),
    queryFn: async () => {
      if (!currentUser) throw new Error("User not found");
      const [attendance, selectSubjects, subjects, volunteers] =
        await Promise.all([
          USER_API.fetchSchoolRecordAttendanceAPI(currentUser.id),
          USER_API.fetchSchoolRecordSelectSubjectsAPI(currentUser.id),
          USER_API.fetchSchoolRecordSubjectsAPI(currentUser.id),
          USER_API.fetchSchoolRecordVolunteersAPI(currentUser.id),
        ]);

      return {
        attendance: attendance || [],
        selectSubjects: selectSubjects || [],
        subjects: subjects || [],
        volunteers: volunteers || [],
        isEmpty:
          (attendance || []).length === 0 &&
          (selectSubjects || []).length === 0 &&
          (subjects || []).length === 0 &&
          (volunteers || []).length === 0,
      };
    },
    enabled: !!currentUser, // currentUser가 있을 때만 실행
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * 내 평균 등급 조회
 */
export const useGetMyGrade = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: schoolRecords } = useGetSchoolRecords();

  return useQuery<number>({
    queryKey: ["myGrade", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        throw new Error("유저를 찾을 수 없습니다.");
      }

      if (!schoolRecords) {
        throw new Error("생기부 데이터를 찾을 수 없습니다");
      }
      return parseFloat(
        calculateMyAverageRating(
          schoolRecords.subjects || [],
          currentUser.major,
        ),
      );
    },
    enabled: !!currentUser && !!schoolRecords,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};
