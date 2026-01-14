/**
 * 누적백분위 테이블 생성 (시뮬레이션 기반)
 *
 * 방법: 과목별 도수분포를 기반으로 가상 학생 점수 조합을 생성하고
 *       총점 기준으로 정렬하여 누적백분위를 산출
 *
 * 고려사항:
 * - 과목 간 상관관계 (고득점자는 여러 과목에서 고득점 경향)
 * - 이과 기준: 국어 + 수학(미적/기하) + 과탐 2과목
 * - 백분위합 = 국어(100) + 수학(100) + 탐구1(50) + 탐구2(50) = 300점 만점
 */

const XLSX = require('xlsx');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

// ============================================
// 1단계: 도수분포 데이터 로드
// ============================================

function loadDistributionData() {
  console.log('도수분포 데이터 로드 중...');

  // 2026 표점 백분 등급 변환표에서 과목별 데이터 추출
  const wb = XLSX.readFile(path.join(uploadsDir, '2026 표점 백분 등급 변환표.xlsx'));
  const sheet = wb.Sheets['Sheet1'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const distributions = {
    korean: [],      // 국어 (언매 기준)
    math: [],        // 수학 (미적 기준)
    physics1: [],    // 물리학 I
    chem1: [],       // 화학 I
    bio1: [],        // 생명과학 I
    earth1: [],      // 지구과학 I
  };

  // 과목별 점수-누적% 데이터 추출
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const area = row[0];
    const subject = row[1];
    const score = row[4];
    const percentile = row[5];
    const cumulative = row[7]; // 상위 누적%

    if (area === '국어' && subject === '언매') {
      distributions.korean.push({ score, cumulative, percentile });
    } else if (area === '수학' && subject === '미적') {
      distributions.math.push({ score, cumulative, percentile });
    } else if (area === '과학탐구') {
      if (subject === '물리학 Ⅰ') distributions.physics1.push({ score, cumulative, percentile });
      else if (subject === '화학 Ⅰ') distributions.chem1.push({ score, cumulative, percentile });
      else if (subject === '생명과학 Ⅰ') distributions.bio1.push({ score, cumulative, percentile });
      else if (subject === '지구과학 Ⅰ') distributions.earth1.push({ score, cumulative, percentile });
    }
  }

  // 점수 기준 정렬 (높은 순)
  Object.keys(distributions).forEach(key => {
    distributions[key].sort((a, b) => b.score - a.score);
    // 중복 제거 (같은 점수는 첫 번째만)
    const unique = [];
    const seen = new Set();
    distributions[key].forEach(d => {
      if (!seen.has(d.score)) {
        seen.add(d.score);
        unique.push(d);
      }
    });
    distributions[key] = unique;
  });

  console.log('국어 점수 범위:', distributions.korean[distributions.korean.length-1]?.score, '~', distributions.korean[0]?.score);
  console.log('수학 점수 범위:', distributions.math[distributions.math.length-1]?.score, '~', distributions.math[0]?.score);
  console.log('물리 점수 범위:', distributions.physics1[distributions.physics1.length-1]?.score, '~', distributions.physics1[0]?.score);
  console.log('화학 점수 범위:', distributions.chem1[distributions.chem1.length-1]?.score, '~', distributions.chem1[0]?.score);

  return distributions;
}

// ============================================
// 2단계: 점수 샘플링 함수 (상관관계 고려)
// ============================================

function sampleScoreWithCorrelation(distribution, targetPercentile) {
  // targetPercentile: 0~100 사이의 값 (상위 몇 %인지)
  // 해당 백분위에 가장 가까운 점수 반환

  for (let i = 0; i < distribution.length; i++) {
    if (distribution[i].cumulative >= targetPercentile) {
      return distribution[i];
    }
  }
  return distribution[distribution.length - 1]; // 최저점
}

function getPercentileForScore(distribution, score) {
  const found = distribution.find(d => d.score === score);
  return found ? found.percentile : 50;
}

// ============================================
// 3단계: 가상 학생 생성 (상관관계 모델)
// ============================================

function generateStudents(distributions, numStudents, correlation = 0.85) {
  console.log(`\n${numStudents.toLocaleString()}명의 가상 학생 생성 중... (상관계수: ${correlation})`);

  const students = [];

  // 과탐 조합 (물리+화학이 가장 인기)
  const sciCombos = [
    { sci1: 'physics1', sci2: 'chem1', weight: 0.35 },    // 물리+화학 35%
    { sci1: 'chem1', sci2: 'bio1', weight: 0.25 },        // 화학+생명 25%
    { sci1: 'bio1', sci2: 'chem1', weight: 0.15 },        // 생명+화학 15%
    { sci1: 'physics1', sci2: 'bio1', weight: 0.10 },     // 물리+생명 10%
    { sci1: 'bio1', sci2: 'earth1', weight: 0.10 },       // 생명+지구 10%
    { sci1: 'physics1', sci2: 'earth1', weight: 0.05 },   // 물리+지구 5%
  ];

  // 실제 수험생 분포에 가까운 정규분포 (평균 50%, 표준편차 20%)
  // 상위권으로 갈수록 학생 수가 적어지는 것을 반영
  for (let i = 0; i < numStudents; i++) {
    // 1. 기본 능력치 (0~100 사이, 정규분포로 중간 성적이 많음)
    // 상위 누적%로 변환 - 더 현실적인 분포
    const baseAbility = clamp(gaussianRandom(50, 22), 0.1, 99.9);

    // 2. 과목별 변동 (상관관계 반영 - 높은 상관계수로 고득점 조합 제한)
    const variation = 18 * (1 - correlation);  // 상관계수가 높을수록 변동 적음
    const korAbility = clamp(baseAbility + gaussianRandom(0, variation), 0.1, 99.9);
    const mathAbility = clamp(baseAbility + gaussianRandom(0, variation), 0.1, 99.9);
    const sciAbility = clamp(baseAbility + gaussianRandom(0, variation * 0.8), 0.1, 99.9);

    // 3. 능력치 → 점수 변환 (상위 누적%에 해당하는 점수)
    const korData = sampleScoreWithCorrelation(distributions.korean, korAbility);
    const mathData = sampleScoreWithCorrelation(distributions.math, mathAbility);

    // 4. 과탐 조합 선택
    const comboRand = Math.random();
    let cumWeight = 0;
    let selectedCombo = sciCombos[0];
    for (const combo of sciCombos) {
      cumWeight += combo.weight;
      if (comboRand <= cumWeight) {
        selectedCombo = combo;
        break;
      }
    }

    // 과탐은 더 높은 상관관계 (같은 과학적 사고력)
    const sci1Ability = clamp(sciAbility + gaussianRandom(0, variation * 0.6), 0.1, 99.9);
    const sci2Ability = clamp(sciAbility + gaussianRandom(0, variation * 0.6), 0.1, 99.9);

    const sci1Data = sampleScoreWithCorrelation(distributions[selectedCombo.sci1], sci1Ability);
    const sci2Data = sampleScoreWithCorrelation(distributions[selectedCombo.sci2], sci2Ability);

    // 5. 총점 계산
    const scoreSum = korData.score + mathData.score + sci1Data.score + sci2Data.score;
    const percentileSum = korData.percentile + mathData.percentile +
                          sci1Data.percentile * 0.5 + sci2Data.percentile * 0.5;

    students.push({
      korean: korData.score,
      math: mathData.score,
      sci1: sci1Data.score,
      sci2: sci2Data.score,
      sci1Name: selectedCombo.sci1,
      sci2Name: selectedCombo.sci2,
      scoreSum,
      percentileSum,
      korPct: korData.percentile,
      mathPct: mathData.percentile,
      sci1Pct: sci1Data.percentile,
      sci2Pct: sci2Data.percentile,
    });

    if ((i + 1) % 100000 === 0) {
      process.stdout.write(`  ${((i + 1) / numStudents * 100).toFixed(0)}% 완료\r`);
    }
  }

  console.log('  100% 완료');
  return students;
}

// 정규분포 랜덤
function gaussianRandom(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ============================================
// 4단계: 누적백분위 테이블 생성
// ============================================

function generatePercentileTable(students) {
  console.log('\n누적백분위 테이블 생성 중...');

  // 총점 기준 내림차순 정렬
  students.sort((a, b) => b.scoreSum - a.scoreSum);

  const totalStudents = students.length;
  const table = [];

  // 각 누적백분위 구간별 대표값 추출
  // 0.01% ~ 1% 구간: 0.01 단위
  for (let pct = 0.01; pct <= 1; pct += 0.01) {
    const idx = Math.floor(totalStudents * pct / 100);
    if (idx < totalStudents) {
      const student = students[idx];
      table.push({
        cumPct: Math.round(pct * 100) / 100,
        scoreSum: student.scoreSum,
        percentileSum: Math.round(student.percentileSum * 100) / 100,
        korean: student.korean,
        math: student.math,
        sci1: student.sci1,
        sci2: student.sci2,
      });
    }
  }

  // 1% ~ 100% 구간: 1 단위
  for (let pct = 2; pct <= 100; pct++) {
    const idx = Math.floor(totalStudents * pct / 100);
    if (idx < totalStudents) {
      const student = students[idx];
      table.push({
        cumPct: pct,
        scoreSum: student.scoreSum,
        percentileSum: Math.round(student.percentileSum * 100) / 100,
        korean: student.korean,
        math: student.math,
        sci1: student.sci1,
        sci2: student.sci2,
      });
    }
  }

  return table;
}

// ============================================
// 5단계: 기존 파일과 비교
// ============================================

function compareWithExisting(table) {
  console.log('\n기존 파일과 비교 중...');

  const existingWb = XLSX.readFile(path.join(uploadsDir, '대학 환산점수별 누적백분위.xlsx'));
  const existingSheet = existingWb.Sheets['Sheet1'];
  const existingData = XLSX.utils.sheet_to_json(existingSheet, { header: 1 });

  const comparison = [];

  for (let i = 1; i < existingData.length; i++) {
    const row = existingData[i];
    const existingPct = row[0];
    const existingPercentileSum = row[1];
    const existingScoreSum = row[2];

    if (existingPct === undefined) continue;

    const calculated = table.find(t => {
      const diff = Math.abs(t.cumPct - existingPct);
      return diff < 0.005 || (existingPct >= 1 && diff < 0.5);
    });

    if (calculated) {
      comparison.push({
        pct: existingPct,
        existing: { percentileSum: existingPercentileSum, scoreSum: existingScoreSum },
        calculated: { percentileSum: calculated.percentileSum, scoreSum: calculated.scoreSum },
        diff: {
          percentileSum: Math.round((calculated.percentileSum - existingPercentileSum) * 100) / 100,
          scoreSum: calculated.scoreSum - existingScoreSum
        }
      });
    }
  }

  // 결과 출력
  console.log('\n=== 비교 결과 (처음 20개) ===');
  console.log('누적%   | 기존(백분위합/표점합) | 계산(백분위합/표점합) | 차이');
  console.log('-'.repeat(70));

  comparison.slice(0, 20).forEach(c => {
    const pctStr = typeof c.pct === 'number' && c.pct < 1 ? c.pct.toFixed(2) : String(c.pct);
    console.log(
      `${pctStr.padStart(6)}% | ` +
      `${String(c.existing.percentileSum).padStart(6)}/${String(c.existing.scoreSum).padStart(3)} | ` +
      `${String(c.calculated.percentileSum).padStart(6)}/${String(c.calculated.scoreSum).padStart(3)} | ` +
      `${c.diff.percentileSum >= 0 ? '+' : ''}${c.diff.percentileSum}/${c.diff.scoreSum >= 0 ? '+' : ''}${c.diff.scoreSum}`
    );
  });

  // 오차 통계
  const scoreDiffs = comparison.map(c => Math.abs(c.diff.scoreSum));
  let avgDiff = 0, maxDiff = 0, within1 = 0, within3 = 0, within5 = 0;
  for (const d of scoreDiffs) {
    avgDiff += d;
    if (d > maxDiff) maxDiff = d;
    if (d <= 1) within1++;
    if (d <= 3) within3++;
    if (d <= 5) within5++;
  }
  avgDiff = avgDiff / scoreDiffs.length;

  console.log('\n=== 오차 통계 ===');
  console.log('평균 표점합 오차:', avgDiff.toFixed(2));
  console.log('최대 표점합 오차:', maxDiff);
  console.log('1점 이내 일치:', within1, '/', comparison.length, `(${(within1/comparison.length*100).toFixed(1)}%)`);
  console.log('3점 이내 일치:', within3, '/', comparison.length, `(${(within3/comparison.length*100).toFixed(1)}%)`);
  console.log('5점 이내 일치:', within5, '/', comparison.length, `(${(within5/comparison.length*100).toFixed(1)}%)`);

  return comparison;
}

// ============================================
// 6단계: 결과 저장
// ============================================

function saveResults(table, comparison) {
  const outputWb = XLSX.utils.book_new();

  // 비교 결과 시트
  const compData = [['누적%', '계산_백분위합', '계산_표점합', '기존_백분위합', '기존_표점합', '백분위합_차이', '표점합_차이']];
  comparison.forEach(c => {
    compData.push([c.pct, c.calculated.percentileSum, c.calculated.scoreSum,
                   c.existing.percentileSum, c.existing.scoreSum, c.diff.percentileSum, c.diff.scoreSum]);
  });
  XLSX.utils.book_append_sheet(outputWb, XLSX.utils.aoa_to_sheet(compData), '비교결과');

  // 생성된 테이블 시트
  const tableData = [['누적%', '표점합', '백분위합', '국어', '수학', '과탐1', '과탐2']];
  table.forEach(t => {
    tableData.push([t.cumPct, t.scoreSum, t.percentileSum, t.korean, t.math, t.sci1, t.sci2]);
  });
  XLSX.utils.book_append_sheet(outputWb, XLSX.utils.aoa_to_sheet(tableData), '생성된테이블');

  const outputPath = path.join(uploadsDir, '누적백분위_시뮬레이션.xlsx');
  XLSX.writeFile(outputWb, outputPath);
  console.log('\n결과 저장:', outputPath);
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('누적백분위 테이블 생성 (시뮬레이션)');
  console.log('='.repeat(60));

  // 1. 도수분포 로드
  const distributions = loadDistributionData();

  // 2. 가상 학생 생성 (100만명, 상관계수 0.85)
  const students = generateStudents(distributions, 1000000, 0.85);

  // 3. 통계 확인 (reduce 사용 - spread operator는 대용량 배열에서 stack overflow 발생)
  console.log('\n=== 생성된 학생 통계 ===');
  let maxScore = -Infinity, minScore = Infinity, sumScore = 0;
  for (const s of students) {
    if (s.scoreSum > maxScore) maxScore = s.scoreSum;
    if (s.scoreSum < minScore) minScore = s.scoreSum;
    sumScore += s.scoreSum;
  }
  console.log('최고 표점합:', maxScore);
  console.log('최저 표점합:', minScore);
  console.log('평균 표점합:', Math.round(sumScore / students.length));

  // 4. 누적백분위 테이블 생성
  const table = generatePercentileTable(students);
  console.log('\n=== 생성된 테이블 샘플 ===');
  table.slice(0, 10).forEach(t => {
    console.log(`  상위 ${t.cumPct}%: 표점합 ${t.scoreSum}, 백분위합 ${t.percentileSum}`);
  });

  // 5. 기존 파일과 비교
  const comparison = compareWithExisting(table);

  // 6. 결과 저장
  saveResults(table, comparison);

  console.log('\n' + '='.repeat(60));
  console.log('완료!');
  console.log('='.repeat(60));
}

main().catch(console.error);
