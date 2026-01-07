/**
 * 표준점수 → 백분위 변환표 및 표점합↔백분위합 매핑 테이블 생성
 *
 * 입력: (별첨)+2026_수능_영역과목별_표준점수+도수분포.xlsx
 * 출력: 누적백분위-표점합-백분위합 매핑 테이블
 *
 * 백분위합 계산: 국어(100) + 수학(100) + 탐구1(50) + 탐구2(50) = 300점 만점
 * (탐구 과목은 0.5 반영)
 */

const XLSX = require('xlsx');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

// ============================================
// 1단계: 과목별 표준점수 → 백분위 변환표 생성
// ============================================

function loadScoreDistribution() {
  const filePath = path.join(uploadsDir, '(별첨)+2026_수능_영역과목별_표준점수+도수분포.xlsx');
  const wb = XLSX.readFile(filePath);

  const result = {
    korean: { scores: [], total: 0 },      // 국어
    math: { scores: [], total: 0 },        // 수학
    exploration: { scores: [], total: 0 }, // 탐구 (통합)
  };

  // 국어/수학 시트 파싱
  const korMathSheet = wb.Sheets['국수'];
  const korMathData = XLSX.utils.sheet_to_json(korMathSheet, { header: 1 });

  // 국어 데이터 추출 (열 0-4): [표준점수, 남, 여, 합계, 누적]
  for (let i = 7; i < korMathData.length; i++) {
    const row = korMathData[i];
    if (row[0] && typeof row[0] === 'number' && row[3]) {
      const score = row[0];
      const count = row[3];
      const cumulative = row[4];
      result.korean.scores.push({ score, count, cumulative });
      result.korean.total = Math.max(result.korean.total, cumulative);
    }
  }

  // 수학 데이터 추출 (열 5-9)
  for (let i = 7; i < korMathData.length; i++) {
    const row = korMathData[i];
    if (row[5] && typeof row[5] === 'number' && row[8]) {
      const score = row[5];
      const count = row[8];
      const cumulative = row[9];
      result.math.scores.push({ score, count, cumulative });
      result.math.total = Math.max(result.math.total, cumulative);
    }
  }

  // 사과탐 시트 파싱 - 모든 탐구 과목 통합
  const sciSheet = wb.Sheets['사과탐'];
  const sciData = XLSX.utils.sheet_to_json(sciSheet, { header: 1 });

  // 각 탐구 과목별 점수 통합 (각 과목 5열씩)
  const allExpScores = {};  // score → { totalCount, weightedCumulative }
  let expApplicants = 0;

  for (let colStart = 0; colStart < 40; colStart += 5) {
    const subjectName = sciData[2]?.[colStart];
    if (!subjectName) continue;

    let subjectTotal = 0;
    for (let i = 4; i < sciData.length; i++) {
      const row = sciData[i];
      if (row[colStart] && typeof row[colStart] === 'number' && row[colStart + 3]) {
        subjectTotal = Math.max(subjectTotal, row[colStart + 4]);
      }
    }

    if (subjectTotal > expApplicants) expApplicants = subjectTotal;

    for (let i = 4; i < sciData.length; i++) {
      const row = sciData[i];
      if (row[colStart] && typeof row[colStart] === 'number' && row[colStart + 3]) {
        const score = row[colStart];
        const count = row[colStart + 3];
        const cumulative = row[colStart + 4];

        if (!allExpScores[score]) {
          allExpScores[score] = { count: 0, cumulative: 0, subjects: 0 };
        }
        allExpScores[score].count += count;
        allExpScores[score].cumulative += cumulative;
        allExpScores[score].subjects += 1;
      }
    }
  }

  // 탐구 통합 점수 계산 (평균)
  Object.entries(allExpScores).forEach(([score, data]) => {
    result.exploration.scores.push({
      score: Number(score),
      count: Math.round(data.count / data.subjects),
      cumulative: Math.round(data.cumulative / data.subjects)
    });
  });
  result.exploration.scores.sort((a, b) => b.score - a.score);
  result.exploration.total = expApplicants;

  // 백분위 계산 함수
  const calcPercentile = (cumulative, total) => {
    // 상위 백분위 = (1 - 누적/전체) * 100
    return Math.round((1 - cumulative / total) * 10000) / 100;
  };

  // 각 과목별 백분위 테이블 생성
  result.korean.percentiles = {};
  result.korean.scores.forEach(item => {
    result.korean.percentiles[item.score] = calcPercentile(item.cumulative, result.korean.total);
  });

  result.math.percentiles = {};
  result.math.scores.forEach(item => {
    result.math.percentiles[item.score] = calcPercentile(item.cumulative, result.math.total);
  });

  result.exploration.percentiles = {};
  result.exploration.scores.forEach(item => {
    result.exploration.percentiles[item.score] = calcPercentile(item.cumulative, result.exploration.total);
  });

  return result;
}

// ============================================
// 2단계: 표점합별 백분위합 범위 계산
// 백분위합 = 국어(100) + 수학(100) + 탐구1(50) + 탐구2(50) = 300점 만점
// ============================================

function calculateScoreSumToPercentileSum(data) {
  console.log('\n표점합별 백분위합 계산 중...');

  const { korean, math, exploration } = data;

  // 각 과목 점수 범위
  const korScores = Object.keys(korean.percentiles).map(Number).sort((a, b) => b - a);
  const mathScores = Object.keys(math.percentiles).map(Number).sort((a, b) => b - a);
  const expScores = Object.keys(exploration.percentiles).map(Number).sort((a, b) => b - a);

  console.log('국어 점수 범위:', Math.min(...korScores), '~', Math.max(...korScores));
  console.log('수학 점수 범위:', Math.min(...mathScores), '~', Math.max(...mathScores));
  console.log('탐구 점수 범위:', Math.min(...expScores), '~', Math.max(...expScores));

  // 표점합 → 백분위합 매핑 (표점합별 가능한 백분위합 범위)
  const scoreSumMapping = {};

  // 표점합 = 국어 + 수학 + 탐구1 + 탐구2
  // 백분위합 = 국어백분위 + 수학백분위 + 탐구1백분위*0.5 + 탐구2백분위*0.5 (300점 만점)

  let count = 0;
  const maxCombinations = 800000; // 최대 조합 수 제한

  // 모든 점수 조합 계산 (샘플링 최소화)
  for (const kor of korScores) {
    for (const m of mathScores) {
      for (const exp1 of expScores) {
        for (const exp2 of expScores) {
          if (count >= maxCombinations) break;

          const scoreSum = kor + m + exp1 + exp2;
          // 백분위합: 국어(100) + 수학(100) + 탐구1(50) + 탐구2(50) = 300점 만점
          const percentileSum = Math.round(
            (korean.percentiles[kor] || 0) +
            (math.percentiles[m] || 0) +
            (exploration.percentiles[exp1] || 0) * 0.5 +
            (exploration.percentiles[exp2] || 0) * 0.5
          );

          if (!scoreSumMapping[scoreSum]) {
            scoreSumMapping[scoreSum] = {
              min: percentileSum,
              max: percentileSum,
              count: 0
            };
          }

          scoreSumMapping[scoreSum].min = Math.min(scoreSumMapping[scoreSum].min, percentileSum);
          scoreSumMapping[scoreSum].max = Math.max(scoreSumMapping[scoreSum].max, percentileSum);
          scoreSumMapping[scoreSum].count++;

          count++;
        }
        if (count >= maxCombinations) break;
      }
      if (count >= maxCombinations) break;
    }
    if (count >= maxCombinations) break;
  }

  console.log('계산된 조합 수:', count);
  console.log('표점합 범위:', Math.min(...Object.keys(scoreSumMapping).map(Number)), '~', Math.max(...Object.keys(scoreSumMapping).map(Number)));

  return scoreSumMapping;
}

// ============================================
// 3단계: 누적백분위 매핑 테이블 생성
// 누적백분위 = 상위 % (0.01% ~ 100%)
// ============================================

function generatePercentileMappingTable(data, scoreSumMapping) {
  console.log('\n누적백분위 매핑 테이블 생성 중...');

  // 표점합 정렬 (높은 순)
  const scoreSums = Object.keys(scoreSumMapping).map(Number).sort((a, b) => b - a);

  // 표점합별 평균 백분위합 계산
  const scoreSumData = scoreSums.map(sum => ({
    scoreSum: sum,
    percentileSum: Math.round((scoreSumMapping[sum].min + scoreSumMapping[sum].max) / 2),
    min: scoreSumMapping[sum].min,
    max: scoreSumMapping[sum].max
  }));

  // 누적백분위 구간 생성 (0.01% ~ 100%)
  // 기존 파일의 구조: 0.01, 0.02, ..., 0.99, 1.0, 1.1, ..., 94 등
  const result = [];

  // 상위 0.01% ~ 1% 구간 (0.01 단위)
  for (let pct = 0.01; pct <= 1; pct += 0.01) {
    const rounded = Math.round(pct * 100) / 100;
    result.push({ cumulativePercentile: rounded });
  }

  // 상위 1% ~ 100% 구간 (1 단위)
  for (let pct = 2; pct <= 100; pct += 1) {
    result.push({ cumulativePercentile: pct });
  }

  // 각 누적백분위에 해당하는 표점합과 백분위합 계산
  // 백분위합이 300점 만점이므로, 상위 X%의 백분위합은 약 300 * (1 - X/100)
  result.forEach(item => {
    const pct = item.cumulativePercentile;

    // 상위 pct%에 해당하는 목표 백분위합 (300점 만점)
    // 상위 0.01% → 백분위합 약 300 (만점)
    // 상위 50% → 백분위합 약 150
    // 상위 100% → 백분위합 약 0
    const targetPercentileSum = Math.round(300 * (1 - pct / 100));

    // 해당 백분위합에 가장 가까운 표점합 찾기
    let bestMatch = null;
    let minDiff = Infinity;

    scoreSumData.forEach(sd => {
      const diff = Math.abs(sd.percentileSum - targetPercentileSum);
      if (diff < minDiff) {
        minDiff = diff;
        bestMatch = sd;
      }
    });

    if (bestMatch) {
      item.percentileSum = bestMatch.percentileSum;
      item.scoreSum = bestMatch.scoreSum;
      item.percentileSumRange = `${bestMatch.min}-${bestMatch.max}`;
    }
  });

  return result;
}

// ============================================
// 4단계: 기존 파일과 비교 및 결과 저장
// ============================================

function compareAndSave(mappingTable, data) {
  console.log('\n기존 파일과 비교 중...');

  // 기존 파일 로드
  const existingPath = path.join(uploadsDir, '대학 환산점수별 누적백분위.xlsx');
  const existingWb = XLSX.readFile(existingPath);
  const existingSheet = existingWb.Sheets['Sheet1'];
  const existingData = XLSX.utils.sheet_to_json(existingSheet, { header: 1 });

  // 비교 결과
  const comparison = [];

  for (let i = 1; i < existingData.length; i++) {
    const row = existingData[i];
    const existingPct = row[0]; // %
    const existingPercentileSum = row[1]; // 백분위합
    const existingScoreSum = row[2]; // 표점합

    if (existingPct === undefined || existingPct === null) continue;

    // 계산된 값 찾기
    const calculated = mappingTable.find(m => {
      const diff = Math.abs(m.cumulativePercentile - existingPct);
      return diff < 0.005 || (existingPct >= 1 && diff < 0.5);
    });

    if (calculated) {
      comparison.push({
        pct: existingPct,
        existing: { percentileSum: existingPercentileSum, scoreSum: existingScoreSum },
        calculated: { percentileSum: calculated.percentileSum, scoreSum: calculated.scoreSum },
        diff: {
          percentileSum: calculated.percentileSum - existingPercentileSum,
          scoreSum: calculated.scoreSum - existingScoreSum
        }
      });
    }
  }

  // 결과 출력
  console.log('\n=== 비교 결과 (처음 10개) ===');
  console.log('누적백분위 | 기존(백분위합/표점합) | 계산(백분위합/표점합) | 차이');

  comparison.slice(0, 10).forEach(c => {
    const pctStr = typeof c.pct === 'number' && c.pct < 1
      ? c.pct.toFixed(2)
      : String(c.pct);
    console.log(
      `${pctStr.padStart(10)}% | ` +
      `${c.existing.percentileSum}/${c.existing.scoreSum}`.padEnd(18) + ' | ' +
      `${c.calculated.percentileSum}/${c.calculated.scoreSum}`.padEnd(18) + ' | ' +
      `${c.diff.percentileSum}/${c.diff.scoreSum}`
    );
  });

  // 결과 파일 저장
  const outputData = [
    ['누적백분위(%)', '계산_백분위합', '계산_표점합', '기존_백분위합', '기존_표점합', '백분위합_차이', '표점합_차이']
  ];

  comparison.forEach(c => {
    outputData.push([
      c.pct,
      c.calculated.percentileSum,
      c.calculated.scoreSum,
      c.existing.percentileSum,
      c.existing.scoreSum,
      c.diff.percentileSum,
      c.diff.scoreSum
    ]);
  });

  const outputWb = XLSX.utils.book_new();
  const outputSheet = XLSX.utils.aoa_to_sheet(outputData);
  XLSX.utils.book_append_sheet(outputWb, outputSheet, '비교결과');

  // 과목별 백분위표도 저장
  const pctTableData = [['표준점수', '국어_백분위', '수학_백분위', '탐구_백분위']];
  const allScores = new Set([
    ...Object.keys(data.korean.percentiles),
    ...Object.keys(data.math.percentiles),
    ...Object.keys(data.exploration.percentiles)
  ]);

  [...allScores].map(Number).sort((a, b) => b - a).forEach(score => {
    pctTableData.push([
      score,
      data.korean.percentiles[score] || '',
      data.math.percentiles[score] || '',
      data.exploration.percentiles[score] || ''
    ]);
  });

  const pctSheet = XLSX.utils.aoa_to_sheet(pctTableData);
  XLSX.utils.book_append_sheet(outputWb, pctSheet, '과목별백분위');

  // 매핑 테이블도 별도 시트로 저장
  const mappingData = [['누적백분위(%)', '백분위합(계산)', '표점합(계산)', '백분위합범위']];
  mappingTable.forEach(m => {
    mappingData.push([
      m.cumulativePercentile,
      m.percentileSum,
      m.scoreSum,
      m.percentileSumRange
    ]);
  });
  const mappingSheet = XLSX.utils.aoa_to_sheet(mappingData);
  XLSX.utils.book_append_sheet(outputWb, mappingSheet, '계산된매핑');

  const outputPath = path.join(uploadsDir, '누적백분위_매핑_계산결과.xlsx');
  XLSX.writeFile(outputWb, outputPath);

  console.log('\n결과 저장 완료:', outputPath);

  return comparison;
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('표준점수 → 백분위 변환표 및 매핑 테이블 생성');
  console.log('백분위합 = 국어(100) + 수학(100) + 탐구1(50) + 탐구2(50) = 300점 만점');
  console.log('='.repeat(60));

  // 1단계
  console.log('\n[1단계] 과목별 표준점수 → 백분위 변환표 생성');
  const data = loadScoreDistribution();

  console.log('\n국어 응시자 수:', data.korean.total.toLocaleString());
  console.log('수학 응시자 수:', data.math.total.toLocaleString());
  console.log('탐구 평균 응시자 수:', data.exploration.total.toLocaleString());

  console.log('\n국어 백분위 샘플 (상위 5개):');
  Object.entries(data.korean.percentiles)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .slice(0, 5)
    .forEach(([score, pct]) => console.log(`  ${score}점: 상위 ${(100-pct).toFixed(2)}% (백분위 ${pct})`));

  console.log('\n수학 백분위 샘플 (상위 5개):');
  Object.entries(data.math.percentiles)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .slice(0, 5)
    .forEach(([score, pct]) => console.log(`  ${score}점: 상위 ${(100-pct).toFixed(2)}% (백분위 ${pct})`));

  console.log('\n탐구 백분위 샘플 (상위 5개):');
  Object.entries(data.exploration.percentiles)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .slice(0, 5)
    .forEach(([score, pct]) => console.log(`  ${score}점: 상위 ${(100-pct).toFixed(2)}% (백분위 ${pct})`));

  // 2단계
  console.log('\n[2단계] 표점합별 백분위합 범위 계산');
  const scoreSumMapping = calculateScoreSumToPercentileSum(data);

  // 상위 표점합 샘플 출력
  console.log('\n표점합별 백분위합 샘플 (상위 5개):');
  Object.entries(scoreSumMapping)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .slice(0, 5)
    .forEach(([sum, d]) => {
      console.log(`  표점합 ${sum}: 백분위합 ${d.min}~${d.max} (${d.count}개 조합)`);
    });

  // 3단계
  console.log('\n[3단계] 누적백분위 매핑 테이블 생성');
  const mappingTable = generatePercentileMappingTable(data, scoreSumMapping);

  console.log('\n매핑 테이블 샘플 (상위 5개):');
  mappingTable.slice(0, 5).forEach(m => {
    console.log(`  상위 ${m.cumulativePercentile}%: 백분위합 ${m.percentileSum}, 표점합 ${m.scoreSum}`);
  });

  // 4단계
  console.log('\n[4단계] 기존 파일과 비교 및 결과 저장');
  const comparison = compareAndSave(mappingTable, data);

  console.log('\n='.repeat(60));
  console.log('완료!');
  console.log('='.repeat(60));
}

main().catch(console.error);
