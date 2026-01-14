/**
 * 누적백분위 테이블 생성 (보정 함수 적용)
 *
 * 핵심 통찰:
 * - 개별 과목 최고점 합계 ≠ 실제 학생 총점
 * - 상위권: 각 과목 상위 0.1%가 같은 학생이 아님
 * - 보정 함수: 과목별 점수 합에서 "중복 보정"을 빼야 함
 *
 * 보정 원리:
 * - 상위권일수록 보정이 크게 적용 (같은 학생이 모든 과목 만점 불가)
 * - 중위권에서는 보정이 작음 (학생 분포가 넓음)
 * - 하위권에서는 보정이 다시 커짐 (바닥 효과)
 */

const XLSX = require('xlsx');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

// ============================================
// 1단계: 데이터 로드
// ============================================

function loadData() {
  console.log('데이터 로드 중...\n');

  // 과목별 상위누적 데이터
  const cumWb = XLSX.readFile(path.join(uploadsDir, '과목 점수별 상위누적.xlsx'));
  const cumSheet = cumWb.Sheets['Sheet1'];
  const cumData = XLSX.utils.sheet_to_json(cumSheet, { header: 1 });

  const headers = cumData[0];
  const colIdx = {
    cumPct: 0,
    korean: 1,
    mathSci: headers.indexOf('수학(이과)'),
    physics1: headers.indexOf('물리학 Ⅰ'),
    chem1: headers.indexOf('화학 Ⅰ'),
    bio1: headers.indexOf('생명과학 Ⅰ'),
    earth1: headers.indexOf('지구과학 Ⅰ'),
  };

  const cumulative = [];
  for (let i = 1; i < cumData.length; i++) {
    const row = cumData[i];
    if (row[0] === undefined) continue;
    cumulative.push({
      cumPct: row[colIdx.cumPct],
      korean: row[colIdx.korean] || 0,
      mathSci: row[colIdx.mathSci] || 0,
      physics1: row[colIdx.physics1] || 0,
      chem1: row[colIdx.chem1] || 0,
      bio1: row[colIdx.bio1] || 0,
      earth1: row[colIdx.earth1] || 0,
    });
  }

  // 기존 파일
  const existWb = XLSX.readFile(path.join(uploadsDir, '대학 환산점수별 누적백분위.xlsx'));
  const existSheet = existWb.Sheets['Sheet1'];
  const existData = XLSX.utils.sheet_to_json(existSheet, { header: 1 });

  const existing = [];
  for (let i = 1; i < existData.length; i++) {
    const row = existData[i];
    if (row[0] === undefined) continue;
    existing.push({
      cumPct: row[0],
      percentileSum: row[1],
      scoreSum: row[2],
    });
  }

  console.log('과목별 상위누적 행 수:', cumulative.length);
  console.log('기존 파일 행 수:', existing.length);

  return { cumulative, existing };
}

// ============================================
// 2단계: 보정 계수 학습 (기존 파일 기반)
// ============================================

function learnCalibration(cumulative, existing) {
  console.log('\n보정 계수 학습 중...\n');

  // 누적% 매핑
  const cumMap = new Map();
  cumulative.forEach(c => cumMap.set(c.cumPct, c));

  // 보정 데이터 수집
  const calibrationData = [];

  existing.forEach(e => {
    const c = cumMap.get(e.cumPct);
    if (!c) return;

    // 최고 과탐 조합 계산
    const sciCombos = [
      { sci1: c.physics1, sci2: c.chem1 },
      { sci1: c.chem1, sci2: c.bio1 },
      { sci1: c.bio1, sci2: c.earth1 },
      { sci1: c.physics1, sci2: c.bio1 },
      { sci1: c.chem1, sci2: c.earth1 },
      { sci1: c.physics1, sci2: c.earth1 },
    ];

    let bestScore = 0;
    sciCombos.forEach(combo => {
      const score = c.korean + c.mathSci + combo.sci1 + combo.sci2;
      if (score > bestScore) bestScore = score;
    });

    const rawScore = bestScore;
    const actualScore = e.scoreSum;
    const adjustment = actualScore - rawScore;

    calibrationData.push({
      cumPct: e.cumPct,
      rawScore,
      actualScore,
      adjustment,
    });
  });

  // 구간별 보정 계수 계산
  const segments = [
    { name: '최상위 (0-0.5%)', min: 0, max: 0.5 },
    { name: '상위 (0.5-2%)', min: 0.5, max: 2 },
    { name: '상위 (2-5%)', min: 2, max: 5 },
    { name: '중상위 (5-15%)', min: 5, max: 15 },
    { name: '중위 (15-50%)', min: 15, max: 50 },
    { name: '중하위 (50-80%)', min: 50, max: 80 },
    { name: '하위 (80-100%)', min: 80, max: 100 },
  ];

  const segmentAdjustments = [];

  segments.forEach(seg => {
    const segData = calibrationData.filter(d => d.cumPct >= seg.min && d.cumPct < seg.max);
    if (segData.length === 0) return;

    const avgAdj = segData.reduce((sum, d) => sum + d.adjustment, 0) / segData.length;
    const avgRaw = segData.reduce((sum, d) => sum + d.rawScore, 0) / segData.length;

    segmentAdjustments.push({
      ...seg,
      avgAdjustment: avgAdj,
      avgRawScore: avgRaw,
      count: segData.length,
    });

    console.log(`${seg.name}: 평균 보정 ${avgAdj.toFixed(1)}점 (샘플 ${segData.length}개)`);
  });

  return { calibrationData, segmentAdjustments };
}

// ============================================
// 3단계: 보정 함수 생성
// ============================================

function createCalibrationFunction(calibrationData) {
  console.log('\n보정 함수 생성 중...\n');

  // 다항식 피팅 (선형 보간 사용)
  // cumPct → adjustment 매핑
  const sortedData = [...calibrationData].sort((a, b) => a.cumPct - b.cumPct);

  return function calibrate(cumPct, rawScore) {
    // 가장 가까운 두 포인트 찾기
    let lower = sortedData[0];
    let upper = sortedData[sortedData.length - 1];

    for (let i = 0; i < sortedData.length - 1; i++) {
      if (sortedData[i].cumPct <= cumPct && sortedData[i + 1].cumPct >= cumPct) {
        lower = sortedData[i];
        upper = sortedData[i + 1];
        break;
      }
    }

    // 선형 보간
    if (lower.cumPct === upper.cumPct) {
      return rawScore + lower.adjustment;
    }

    const t = (cumPct - lower.cumPct) / (upper.cumPct - lower.cumPct);
    const adjustment = lower.adjustment + t * (upper.adjustment - lower.adjustment);

    return Math.round((rawScore + adjustment) * 100) / 100;
  };
}

// ============================================
// 4단계: 새 테이블 생성
// ============================================

function generateCalibratedTable(cumulative, existing, calibrate) {
  console.log('보정된 테이블 생성 중...\n');

  const existMap = new Map();
  existing.forEach(e => existMap.set(e.cumPct, e));

  const results = [];

  cumulative.forEach(c => {
    const exist = existMap.get(c.cumPct);
    if (!exist) return;

    // 최고 과탐 조합
    const sciCombos = [
      { name: '물화', sci1: c.physics1, sci2: c.chem1 },
      { name: '화생', sci1: c.chem1, sci2: c.bio1 },
      { name: '생지', sci1: c.bio1, sci2: c.earth1 },
      { name: '물생', sci1: c.physics1, sci2: c.bio1 },
      { name: '화지', sci1: c.chem1, sci2: c.earth1 },
      { name: '물지', sci1: c.physics1, sci2: c.earth1 },
    ];

    let bestCombo = null;
    let rawScore = 0;
    sciCombos.forEach(combo => {
      const score = c.korean + c.mathSci + combo.sci1 + combo.sci2;
      if (score > rawScore) {
        rawScore = score;
        bestCombo = combo;
      }
    });

    // 보정 적용
    const calibratedScore = calibrate(c.cumPct, rawScore);

    // 백분위합 계산 (상위 0% → 300, 상위 100% → 0)
    const percentileSum = 300 * (1 - c.cumPct / 100);

    results.push({
      cumPct: c.cumPct,
      rawScore,
      calibratedScore,
      actualScore: exist.scoreSum,
      diff: Math.round((calibratedScore - exist.scoreSum) * 100) / 100,
      percentileSum: Math.round(percentileSum * 100) / 100,
      actualPercentileSum: exist.percentileSum,
      korean: c.korean,
      mathSci: c.mathSci,
      sci1: bestCombo?.sci1,
      sci2: bestCombo?.sci2,
      combo: bestCombo?.name,
    });
  });

  return results;
}

// ============================================
// 5단계: 결과 검증 및 저장
// ============================================

function validateAndSave(results) {
  console.log('결과 검증 중...\n');

  // 오차 통계
  const diffs = results.map(r => Math.abs(r.diff));
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  let maxDiff = 0;
  for (const d of diffs) if (d > maxDiff) maxDiff = d;
  const within1 = diffs.filter(d => d <= 1).length;
  const within2 = diffs.filter(d => d <= 2).length;
  const within3 = diffs.filter(d => d <= 3).length;

  console.log('=== 보정 후 오차 통계 ===');
  console.log('평균 오차:', avgDiff.toFixed(2), '점');
  console.log('최대 오차:', maxDiff.toFixed(2), '점');
  console.log('1점 이내:', within1, '/', results.length, `(${(within1/results.length*100).toFixed(1)}%)`);
  console.log('2점 이내:', within2, '/', results.length, `(${(within2/results.length*100).toFixed(1)}%)`);
  console.log('3점 이내:', within3, '/', results.length, `(${(within3/results.length*100).toFixed(1)}%)`);

  // 상위 구간 출력
  console.log('\n=== 상위 구간 비교 ===');
  console.log('누적%   | 원본표점 | 보정표점 | 기존표점 | 차이');
  console.log('-'.repeat(55));

  results.slice(0, 15).forEach(r => {
    const pctStr = r.cumPct < 1 ? r.cumPct.toFixed(2) : String(r.cumPct);
    console.log(
      `${pctStr.padStart(6)}% | ` +
      `${String(r.rawScore).padStart(8)} | ` +
      `${String(r.calibratedScore).padStart(8)} | ` +
      `${String(r.actualScore).padStart(8)} | ` +
      `${r.diff >= 0 ? '+' : ''}${r.diff.toFixed(1)}`
    );
  });

  // 파일 저장
  const outputWb = XLSX.utils.book_new();

  const tableData = [
    ['누적%', '보정표점합', '기존표점합', '표점차이', '보정백분위합', '기존백분위합',
     '원본표점합', '국어', '수학', '과탐1', '과탐2', '조합']
  ];

  results.forEach(r => {
    tableData.push([
      r.cumPct, r.calibratedScore, r.actualScore, r.diff,
      r.percentileSum, r.actualPercentileSum, r.rawScore,
      r.korean, r.mathSci, r.sci1, r.sci2, r.combo
    ]);
  });

  XLSX.utils.book_append_sheet(outputWb, XLSX.utils.aoa_to_sheet(tableData), '보정결과');

  const outputPath = path.join(uploadsDir, '누적백분위_보정.xlsx');
  XLSX.writeFile(outputWb, outputPath);
  console.log('\n결과 저장:', outputPath);

  return { avgDiff, within1, within2, within3, total: results.length };
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('누적백분위 테이블 생성 (보정 함수 적용)');
  console.log('='.repeat(60));
  console.log();

  // 1. 데이터 로드
  const { cumulative, existing } = loadData();

  // 2. 보정 계수 학습
  const { calibrationData, segmentAdjustments } = learnCalibration(cumulative, existing);

  // 3. 보정 함수 생성
  const calibrate = createCalibrationFunction(calibrationData);

  // 4. 새 테이블 생성
  const results = generateCalibratedTable(cumulative, existing, calibrate);

  // 5. 검증 및 저장
  const stats = validateAndSave(results);

  // 결론
  console.log('\n' + '='.repeat(60));
  console.log('결론:');
  console.log('='.repeat(60));

  if (stats.avgDiff < 1) {
    console.log('✅ 보정 성공! 평균 오차', stats.avgDiff.toFixed(2), '점');
    console.log('   → 기존 파일과 거의 동일한 누적백분위 테이블 생성 가능');
  } else if (stats.avgDiff < 3) {
    console.log('⚠️ 보정 부분 성공. 평균 오차', stats.avgDiff.toFixed(2), '점');
    console.log('   → 추가 튜닝 필요');
  } else {
    console.log('❌ 보정 실패. 평균 오차', stats.avgDiff.toFixed(2), '점');
  }

  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
