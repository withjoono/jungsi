import { makeApiCall } from "../../common-utils";
import {
  ISchoolRecordAttendance,
  ISchoolRecordSelectSubject,
  ISchoolRecordSubject,
  ISchoolRecordVolunteer,
  IUser,
} from "./interfaces";

/**
 * 로그인한 유저 조회
 */
const fetchCurrentUserAPI = async () => {
  const res = await makeApiCall<void, IUser | null>("GET", "/auth/me", undefined, undefined, 'nest');
  if (res.success) {
    return res.data;
  }
  return null;
};

/**
 * 유저의 활성화 중인 서비스 조회
 */
const fetchCurrentUserActiveServicesAPI = async () => {
  const res = await makeApiCall<void, string[]>("GET", "/auth/me/active", undefined, undefined, 'nest');
  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * [생기부] 출석 기록 조회
 */
const fetchSchoolRecordAttendanceAPI = async (memberId: string) => {
  const res = await makeApiCall<void, ISchoolRecordAttendance[]>(
    "GET",
    `/members/${memberId}/schoolrecord/attendance`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * [생기부] 선택 과목 조회
 */
const fetchSchoolRecordSelectSubjectsAPI = async (memberId: string) => {
  const res = await makeApiCall<void, ISchoolRecordSelectSubject[]>(
    "GET",
    `/members/${memberId}/schoolrecord/select-subject`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * [생기부] 과목 조회
 */
const fetchSchoolRecordSubjectsAPI = async (memberId: string) => {
  const res = await makeApiCall<void, ISchoolRecordSubject[]>(
    "GET",
    `/members/${memberId}/schoolrecord/subject`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * [생기부] 봉사 활동 조회
 */
const fetchSchoolRecordVolunteersAPI = async (memberId: string) => {
  const res = await makeApiCall<void, ISchoolRecordVolunteer[]>(
    "GET",
    `/members/${memberId}/schoolrecord/volunteers`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

export const USER_API = {
  fetchCurrentUserAPI,
  fetchCurrentUserActiveServicesAPI,
  fetchSchoolRecordAttendanceAPI,
  fetchSchoolRecordSelectSubjectsAPI,
  fetchSchoolRecordSubjectsAPI,
  fetchSchoolRecordVolunteersAPI,
};
