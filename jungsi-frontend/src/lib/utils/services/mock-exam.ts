import { MOCK_EXAM_SUBJECT_CODE } from "@/constants/mock-exam-subject-code";
import { IMockExamScore } from "@/stores/server/features/mock-exam/interfaces";

export interface IEnrichedMockExamScore extends IMockExamScore {
  subjectName: string;  // camelCase
  subjectCategory: string;  // camelCase
}

// 문이과
export type IAcademicDivision = "NaturalSciences" | "LiberalArts";

export interface IEnrichedMockExamScoreResponse {
  data: IEnrichedMockExamScore[];
  academicDivision: IAcademicDivision;  // camelCase for consistency
  standardScoreSum: number;             // 표점합 (국어 + 수학 + 탐구 상위 2과목)
  myCumulativePercentile: number;       // 나의 누적백분위 (상위 %)
}

/**
 * 모의고사 표준점수 조회결과에 과목명과 카테고리(kor, math 등)을 추가
 */
export const enrichScoreData = (
  scores: IMockExamScore[],
): IEnrichedMockExamScore[] => {
  return scores.map((score) => {
    let subjectName = "";
    let subjectCategory = "";

    for (const [category, data] of Object.entries(MOCK_EXAM_SUBJECT_CODE)) {
      if (data.require && data.require.subjectCode === score.code) {
        subjectName = data.require.label;
        subjectCategory = category;
        break;
      }
      if (data.select) {
        const selectedSubject = data.select.find(
          (subject) => subject.subjectCode === score.code,
        );
        if (selectedSubject) {
          subjectName = selectedSubject.label;
          subjectCategory = category;
          break;
        }
      }
    }

    return {
      ...score,
      subjectName,
      subjectCategory,
    };
  });
};

export const determineAcademicDivision = (
  scores: IEnrichedMockExamScore[],
): IAcademicDivision => {
  const selectedSubjects = scores.map((score) => score.code);
  const hasMathCalc = selectedSubjects.includes("S4"); // 미적
  const hasMathGeo = selectedSubjects.includes("S5"); // 기하

  const scienceSubjects = scores.filter(
    (score) => score.subjectCategory === "science",
  ); // 과탐 갯수
  const socialSubjects = scores.filter(
    (score) => score.subjectCategory === "society",
  ); // 사탐 갯수

  // 미적/기하 중 하나를 선택했으면서 과탐 2개를 선택한 경우 이과
  // 그외 문과로 처리
  if (
    (hasMathCalc || hasMathGeo) &&
    scienceSubjects.length === 2 &&
    socialSubjects.length === 0
  ) {
    return "NaturalSciences";
  } else {
    return "LiberalArts";
  }
};

export const processMockExamScores = (apiResponse: {
  data: IMockExamScore[];
  standardScoreSum: number;
  myCumulativePercentile: number;
}): IEnrichedMockExamScoreResponse => {
  const enrichedData = enrichScoreData(apiResponse.data);
  const academicDivision = determineAcademicDivision(enrichedData);

  return {
    data: enrichedData,
    academicDivision,
    standardScoreSum: apiResponse.standardScoreSum,
    myCumulativePercentile: apiResponse.myCumulativePercentile,
  };
};
