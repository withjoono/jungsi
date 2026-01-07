/**
 * 표준점수 → 백분위 변환표 및 표점합↔백분위합 매핑 테이블 생성 (v2)
 *
 * 수정사항:
 * - '과목 점수별 상위누적.xlsx' 파일 사용 (과학탐구 포함)
 * - 이과 기준: 국어 + 수학(이과) + 과탐1 + 과탐2 (서로 다른 2과목)
 * - 백분위합 = 국어(100) + 수학(100) + 탐구1(50) + 탐구2(50) = 300점 만점
 */

const XLSX = require('xlsx');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

// ============================================
// 1단계: 과목별 상위누적 데이터 로드
// ============================================

function loadCumulativeData() {
  const filePath = path.join(uploadsDir, '과목 점수별 상위누적.xlsx');
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets['Sheet1'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const headers = data[0];
  console.log('과목 목록:', headers.slice(1, 15).join(', '));

  // 열 인덱스 찾기
  const colIdx = {
    cumPct: 0,                                    // 상위누적
    korean: headers.indexOf('국어'),              // 국어
    mathSci: headers.indexOf('수학(이과)'),       // 수학(이과)
    physics1: headers.indexOf('물리학 Ⅰ'),       // 물리학 I
    chem1: headers.indexOf('화학 Ⅰ'),            // 화학 I
    bio1: headers.indexOf('생명과학 Ⅰ'),         // 생명과학 I
    earth1: headers.indexOf('지구과학 Ⅰ'),       // 지구과학 I
  };

  console.log('\n열 인덱스:', colIdx);

  // 데이터 추출 (상위 0% ~ 100%)
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === undefined || row[0] === null) continue;

    result.push({
      cumPct: row[colIdx.cumPct],
      korean: row[colIdx.korean],
      mathSci: row[colIdx.mathSci],
      physics1: row[colIdx.physics1],
      chem1: row[colIdx.chem1],
      bio1: row[colIdx.bio1],
      earth1: row[colIdx.earth1],
    });
  }

  return result;
}

// ============================================
// 2단계: 상위누적 → 표점합/백분위합 계산
// ============================================

function calculateMappings(cumulativeData) {
  console.log('\n표점합/백분위합 계산 중...');

  // 과학탐구 조합 (서로 다른 2과목)
  const sciCombinations = [
    ['physics1', 'chem1'],      // 물리+화학
    ['physics1', 'bio1'],       // 물리+생명
    ['physics1', 'earth1'],     // 물리+지구
    ['chem1', 'bio1'],          // 화학+생명
    ['chem1', 'earth1'],        // 화학+지구
    ['bio1', 'earth1'],         // 생명+지구
  ];

  const result = [];

  cumulativeData.forEach(row => {
    const cumPct = row.cumPct;
    const korean = row.korean || 0;
    const mathSci = row.mathSci || 0;

    // 각 과탐 조합별 표점합 계산
    let bestScoreSum = 0;
    let bestCombo = null;

    sciCombinations.forEach(([sci1, sci2]) => {
      const score1 = row[sci1] || 0;
      const score2 = row[sci2] || 0;
      const scoreSum = korean + mathSci + score1 + score2;

      if (scoreSum > bestScoreSum) {
        bestScoreSum = scoreSum;
        bestCombo = { sci1, sci2, score1, score2 };
      }
    });

    // 백분위 계산 (상위 누적% → 백분위)
    // 상위 0% → 백분위 100, 상위 100% → 백분위 0
    const korPct = 100 - cumPct;
    const mathPct = 100 - cumPct;
    const sci1Pct = 100 - cumPct;
    const sci2Pct = 100 - cumPct;

    // 백분위합 (300점 만점): 국어(100) + 수학(100) + 탐구1(50) + 탐구2(50)
    const percentileSum = korPct + mathPct + sci1Pct * 0.5 + sci2Pct * 0.5;

    result.push({
      cumPct,
      korean,
      mathSci,
      sci1: bestCombo?.score1 || 0,
      sci2: bestCombo?.score2 || 0,
      sciCombo: bestCombo ? `${bestCombo.sci1}+${bestCombo.sci2}` : '',
      scoreSum: bestScoreSum,
      percentileSum: Math.round(percentileSum * 100) / 100,
    });
  });

  return result;
}

// ============================================
// 3단계: 기존 파일과 비교 및 결과 저장
// ============================================

function compareAndSave(mappings) {
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
    const existingPct = row[0];
    const existingPercentileSum = row[1];
    const existingScoreSum = row[2];

    if (existingPct === undefined || existingPct === null) continue;

    // 계산된 값 찾기 (상위 누적% 매칭)
    const calculated = mappings.find(m => {
      const diff = Math.abs(m.cumPct - existingPct);
      return diff < 0.05 || (existingPct >= 1 && diff < 0.5);
    });

    if (calculated) {
      comparison.push({
        pct: existingPct,
        existing: { percentileSum: existingPercentileSum, scoreSum: existingScoreSum },
        calculated: { percentileSum: calculated.percentileSum, scoreSum: calculated.scoreSum },
        diff: {
          percentileSum: Math.round((calculated.percentileSum - existingPercentileSum) * 100) / 100,
          scoreSum: calculated.scoreSum - existingScoreSum
        },
        details: calculated
      });
    }
  }

  // 결과 출력
  console.log('\n=== 비교 결과 (처음 15개) ===');
  console.log('누적%   | 기존(백분위합/표점합) | 계산(백분위합/표점합) | 차이');
  console.log('-'.repeat(70));

  comparison.slice(0, 15).forEach(c => {
    const pctStr = typeof c.pct === 'number' && c.pct < 1
      ? c.pct.toFixed(2)
      : String(c.pct).padStart(5);
    console.log(
      `${pctStr}% | ` +
      `${String(c.existing.percentileSum).padStart(6)}/${String(c.existing.scoreSum).padStart(3)} | ` +
      `${String(c.calculated.percentileSum).padStart(6)}/${String(c.calculated.scoreSum).padStart(3)} | ` +
      `${c.diff.percentileSum >= 0 ? '+' : ''}${c.diff.percentileSum}/${c.diff.scoreSum >= 0 ? '+' : ''}${c.diff.scoreSum}`
    );
  });

  // 오차 통계
  const scoreSumDiffs = comparison.map(c => Math.abs(c.diff.scoreSum));
  const avgDiff = scoreSumDiffs.reduce((a, b) => a + b, 0) / scoreSumDiffs.length;
  const maxDiff = Math.max(...scoreSumDiffs);
  const matchCount = scoreSumDiffs.filter(d => d <= 1).length;

  console.log('\n=== 오차 통계 ===');
  console.log('평균 표점합 오차:', avgDiff.toFixed(2));
  console.log('최대 표점합 오차:', maxDiff);
  console.log('1점 이내 일치:', matchCount, '/', comparison.length, `(${(matchCount/comparison.length*100).toFixed(1)}%)`);

  // 결과 파일 저장
  const outputData = [
    ['누적%', '계산_백분위합', '계산_표점합', '기존_백분위합', '기존_표점합', '백분위합_차이', '표점합_차이', '국어', '수학', '과탐1', '과탐2']
  ];

  comparison.forEach(c => {
    outputData.push([
      c.pct,
      c.calculated.percentileSum,
      c.calculated.scoreSum,
      c.existing.percentileSum,
      c.existing.scoreSum,
      c.diff.percentileSum,
      c.diff.scoreSum,
      c.details.korean,
      c.details.mathSci,
      c.details.sci1,
      c.details.sci2
    ]);
  });

  const outputWb = XLSX.utils.book_new();
  const outputSheet = XLSX.utils.aoa_to_sheet(outputData);
  XLSX.utils.book_append_sheet(outputWb, outputSheet, '비교결과');

  // 전체 매핑 테이블도 저장
  const mappingData = [['상위누적%', '국어', '수학(이과)', '과탐1', '과탐2', '표점합', '백분위합']];
  mappings.forEach(m => {
    mappingData.push([
      m.cumPct,
      m.korean,
      m.mathSci,
      m.sci1,
      m.sci2,
      m.scoreSum,
      m.percentileSum
    ]);
  });
  const mappingSheet = XLSX.utils.aoa_to_sheet(mappingData);
  XLSX.utils.book_append_sheet(outputWb, mappingSheet, '계산된매핑');

  const outputPath = path.join(uploadsDir, '누적백분위_매핑_v2.xlsx');
  XLSX.writeFile(outputWb, outputPath);

  console.log('\n결과 저장 완료:', outputPath);

  return comparison;
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('누적백분위 매핑 테이블 생성 (v2)');
  console.log('이과 기준: 국어 + 수학(이과) + 과탐 2과목');
  console.log('백분위합 = 국어(100) + 수학(100) + 탐구(50+50) = 300점 만점');
  console.log('='.repeat(60));

  // 1단계: 데이터 로드
  console.log('\n[1단계] 과목별 상위누적 데이터 로드');
  const cumulativeData = loadCumulativeData();
  console.log('로드된 행 수:', cumulativeData.length);

  // 샘플 출력
  console.log('\n상위 구간 샘플:');
  console.log('상위%  | 국어 | 수학 | 물리 | 화학 | 생명 | 지구');
  cumulativeData.slice(0, 10).forEach(row => {
    console.log(
      `${String(row.cumPct).padStart(5)} | ` +
      `${String(row.korean).padStart(4)} | ` +
      `${String(row.mathSci).padStart(4)} | ` +
      `${String(row.physics1).padStart(4)} | ` +
      `${String(row.chem1).padStart(4)} | ` +
      `${String(row.bio1).padStart(4)} | ` +
      `${String(row.earth1).padStart(4)}`
    );
  });

  // 2단계: 매핑 계산
  console.log('\n[2단계] 표점합/백분위합 계산');
  const mappings = calculateMappings(cumulativeData);

  console.log('\n매핑 샘플 (상위 5개):');
  mappings.slice(0, 5).forEach(m => {
    console.log(`  상위 ${m.cumPct}%: 표점합 ${m.scoreSum}, 백분위합 ${m.percentileSum}`);
  });

  // 3단계: 비교 및 저장
  console.log('\n[3단계] 기존 파일과 비교 및 결과 저장');
  const comparison = compareAndSave(mappings);

  console.log('\n' + '='.repeat(60));
  console.log('완료!');
  console.log('='.repeat(60));
}

main().catch(console.error);
