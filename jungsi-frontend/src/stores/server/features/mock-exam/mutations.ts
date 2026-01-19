import { BaseResponse } from "../../common-interface";
import { createMutation } from "../../common-utils";
import {
  ISaveMockExamRawScoresData,
  ISaveMockExamStandardScoresData,
} from "./interfaces";

// 모의고사 원점수 저장
export const useSaveMockExamRawScores = () => {
  return createMutation<ISaveMockExamRawScoresData[], BaseResponse<void>>(
    "POST",
    "/mock-exam/raw",
  );
};

// 모의고사 원점수 저장
export const useSaveMockExamSrandardScores = () => {
  return createMutation<ISaveMockExamStandardScoresData[], BaseResponse<void>>(
    "POST",
    "/mock-exam/standard",
  );
};
