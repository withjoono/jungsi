import { makeApiCall } from "@/stores/server/common-utils";
import {
  IExploreEarlyComprehensiveDetailResponse,
  IExploreEarlyComprehensiveStep1Response,
  IExploreEarlyComprehensiveStep2Response,
  IExploreEarlyComprehensiveStep3Response,
  IExploreEarlyComprehensiveStep4Response,
} from "./interfaces";

const fetchExploreEarlyComprehensiveStep1API = async ({
  year,
  basicType,
  minorFieldId,
}: {
  year: number;
  basicType: string;
  minorFieldId: number | null;
}) => {
  const res = await makeApiCall<void, IExploreEarlyComprehensiveStep1Response>(
    "GET",
    `/explore/early/comprehensive/step-1`,
    undefined,
    {
      params: { year, basic_type: basicType, minorFieldId },
    },
  );
  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreEarlyComprehensiveStep2API = async ({
  ids,
}: {
  ids: number[];
}) => {
  const res = await makeApiCall<void, IExploreEarlyComprehensiveStep2Response>(
    "GET",
    `/explore/early/comprehensive/step-2`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreEarlyComprehensiveStep3API = async ({
  ids,
}: {
  ids: number[];
}) => {
  const res = await makeApiCall<void, IExploreEarlyComprehensiveStep3Response>(
    "GET",
    `/explore/early/comprehensive/step-3`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreEarlyComprehensiveStep4API = async ({
  ids,
}: {
  ids: number[];
}) => {
  const res = await makeApiCall<void, IExploreEarlyComprehensiveStep4Response>(
    "GET",
    `/explore/early/comprehensive/step-4`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreEarlyComprehensiveDetailAPI = async ({
  id,
}: {
  id: number;
}) => {
  const res = await makeApiCall<void, IExploreEarlyComprehensiveDetailResponse>(
    "GET",
    `/explore/early/comprehensive/detail/${id}`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return null;
};

export const EXPLORE_EARLY_COMPREHENSIVE_APIS = {
  fetchExploreEarlyComprehensiveStep1API,
  fetchExploreEarlyComprehensiveStep2API,
  fetchExploreEarlyComprehensiveStep3API,
  fetchExploreEarlyComprehensiveStep4API,
  fetchExploreEarlyComprehensiveDetailAPI,
};
