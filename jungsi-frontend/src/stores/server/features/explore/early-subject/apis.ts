import { makeApiCall } from "@/stores/server/common-utils";
import {
  IExploreEarlySubjectDetailResponse,
  IExploreEarlySubjectStep1Response,
  IExploreEarlySubjectStep2Response,
  IExploreEarlySubjectStep3Response,
  IExploreEarlySubjectStep4Response,
  IExploreEarlySubjectStep5Response,
} from "./interfaces";

const fetchExploreEarlySubjectStep1API = async ({
  year,
  basicType,
}: {
  year: number;
  basicType: string;
}) => {
  const res = await makeApiCall<void, IExploreEarlySubjectStep1Response>(
    "GET",
    `/explore/early/subject/step-1`,
    undefined,
    {
      params: { year, basic_type: basicType },
    },
  );
  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreEarlySubjectStep2API = async ({ ids }: { ids: number[] }) => {
  const res = await makeApiCall<void, IExploreEarlySubjectStep2Response>(
    "GET",
    `/explore/early/subject/step-2`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreEarlySubjectStep3API = async ({ ids }: { ids: number[] }) => {
  const res = await makeApiCall<void, IExploreEarlySubjectStep3Response>(
    "GET",
    `/explore/early/subject/step-3`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreEarlySubjectStep4API = async ({ ids }: { ids: number[] }) => {
  const res = await makeApiCall<void, IExploreEarlySubjectStep4Response>(
    "GET",
    `/explore/early/subject/step-4`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreEarlySubjectStep5API = async ({ ids }: { ids: number[] }) => {
  const res = await makeApiCall<void, IExploreEarlySubjectStep5Response>(
    "GET",
    `/explore/early/subject/step-5`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreEarlySubjectDetailAPI = async ({ id }: { id: number }) => {
  const res = await makeApiCall<void, IExploreEarlySubjectDetailResponse>(
    "GET",
    `/explore/early/subject/detail/${id}`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return null;
};

export const EXPLORE_EARLY_SUBJECT_APIS = {
  fetchExploreEarlySubjectStep1API,
  fetchExploreEarlySubjectStep2API,
  fetchExploreEarlySubjectStep3API,
  fetchExploreEarlySubjectStep4API,
  fetchExploreEarlySubjectStep5API,
  fetchExploreEarlySubjectDetailAPI,
};
