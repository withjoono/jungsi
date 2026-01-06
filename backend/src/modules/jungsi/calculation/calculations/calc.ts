import { MockExamScoreInput } from './types';

// 표점합 계산 (국어, 수학, 탐구 2개)
// 이 함수는 calc-percentile.ts에서 사용됨
export const calc표점합 = (mockExamScores: MockExamScoreInput[]): number => {
  let koreanScore = 0;
  let mathScore = 0;
  const electiveScores: number[] = [];

  mockExamScores.forEach((score) => {
    const standardScoreValue = parseInt(score.standardScore);

    switch (score.subjectCategory) {
      case 'kor':
        koreanScore = standardScoreValue;
        break;
      case 'math':
        mathScore = standardScoreValue;
        break;
      case 'society':
      case 'science':
        electiveScores.push(standardScoreValue);
        break;
    }
  });

  const topTwoElectiveScores = electiveScores.sort((a, b) => b - a).slice(0, 2);

  const totalScore =
    koreanScore + mathScore + topTwoElectiveScores.reduce((sum, score) => sum + score, 0);

  return totalScore;
};
