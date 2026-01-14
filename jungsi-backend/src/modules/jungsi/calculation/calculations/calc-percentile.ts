import { calc표점합 } from './calc';
import { MockExamScoreInput, 누백대입표Type } from './types';

// 누백대입표 데이터는 JungsiDataService에서 로드해야 함
// 이 함수는 외부에서 누백대입표를 전달받아 사용
export const calculateUserPercentile = (
  mockExamScores: MockExamScoreInput[],
  누백대입표: 누백대입표Type,
): number => {
  const 표점합 = calc표점합(mockExamScores);
  // 표점합을 소수점 둘째 자리까지 반올림
  const roundedScore = Math.round(표점합 * 100) / 100;

  // 누백대입표의 키를 숫자로 변환하여 내림차순으로 정렬
  const sortedScores = Object.keys(누백대입표)
    .map((score) => parseFloat(score))
    .sort((a, b) => b - a);

  // 사용자의 표점합보다 작거나 같은 첫 번째 점수를 찾음
  const matchingScore = sortedScores.find((score) => roundedScore >= score);

  if (matchingScore === undefined) {
    // 사용자의 표점합이 모든 점수보다 낮은 경우
    return 100;
  }

  // 찾은 점수에 해당하는 백분위를 반환
  const scoreKey = matchingScore.toFixed(2);
  const percentile = parseFloat(누백대입표[scoreKey]);
  return percentile;
};
