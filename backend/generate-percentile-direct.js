/**
 * 누적백분위 테이블 생성 (직접 매핑 방식)
 *
 * 접근법: '과목 점수별 상위누적.xlsx' 파일의 데이터를 분석하여
 *        실제 학생들의 점수 조합 패턴을 파악하고 표점합을 계산
 *
 * 핵심 통찰:
 * - 기존 파일의 최고 표점합 427 = 147(국어) + 139(수학) + 70(물리) + 71(화학)
 * - 이론적 만점 434가 아닌 이유: 실제 학생들의 과목 조합 분포 반영
 * - 상위 0.01%의 표점합이 426인 것은 해당 구간 학생들의 실제 조합 결과
 */

const XLSX = require('xlsx');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

// ============================================
// 1단계: 과목별 상위누적 데이터 로드 (정밀 분석)
// ============================================

function loadCumulativeData() {
  console.log('과목별 상위누적 데이터 로드 중...');

  const filePath = path.join(uploadsDir, '과목 점수별 상위누적.xlsx');
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets['Sheet1'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const headers = data[0];
  console.log('헤더:', headers.slice(0, 15).join(', '));

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

  console.log('열 인덱스:', JSON.stringify(colIdx));

  // 데이터 추출
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === undefined || row[0] === null) continue;

    result.push({
      cumPct: row[colIdx.cumPct],
      korean: row[colIdx.korean] || 0,
      mathSci: row[colIdx.mathSci] || 0,
      physics1: row[colIdx.physics1] || 0,
      chem1: row[colIdx.chem1] || 0,
      bio1: row[colIdx.bio1] || 0,
      earth1: row[colIdx.earth1] || 0,
    });
  }

  return result;
}

// ============================================
// 2단계: 기존 파일 분석하여 패턴 추출
// ============================================

function analyzeExistingFile() {
  console.log('\n기존 파일 분석 중...');

  const wb = XLSX.readFile(path.join(uploadsDir, '대학 환산점수별 누적백분위.xlsx'));
  const sheet = wb.Sheets['Sheet1'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === undefined) continue;

    result.push({
      cumPct: row[0],
      percentileSum: row[1],
      scoreSum: row[2],
    });
  }

  console.log('총 행 수:', result.length);
  console.log('최고 표점합:', result[0]?.scoreSum);
  console.log('최저 표점합:', result[result.length - 1]?.scoreSum);

  return result;
}

// ============================================
// 3단계: 역공학 - 기존 파일의 패턴 분석
// ============================================

function reverseEngineer(existingData, cumulativeData) {
  console.log('\n역공학 분석 중...');

  // 기존 파일의 누적% → 표점합 매핑
  const existingMap = new Map();
  existingData.forEach(e => {
    existingMap.set(e.cumPct, e);
  });

  // 상위 누적% 데이터에서 표점합 계산
  const analysis = [];

  cumulativeData.forEach(row => {
    const cumPct = row.cumPct;
    const korean = row.korean;
    const mathSci = row.mathSci;

    // 과탐 조합별 최고점 계산
    const sciCombos = [
      { name: '물화', sci1: row.physics1, sci2: row.chem1 },
      { name: '화생', sci1: row.chem1, sci2: row.bio1 },
      { name: '생지', sci1: row.bio1, sci2: row.earth1 },
      { name: '물생', sci1: row.physics1, sci2: row.bio1 },
      { name: '화지', sci1: row.chem1, sci2: row.earth1 },
      { name: '물지', sci1: row.physics1, sci2: row.earth1 },
    ];

    // 최고점 조합 찾기
    let bestCombo = null;
    let bestScore = 0;
    sciCombos.forEach(combo => {
      const score = korean + mathSci + combo.sci1 + combo.sci2;
      if (score > bestScore) {
        bestScore = score;
        bestCombo = combo;
      }
    });

    // 기존 파일과 비교
    const existing = existingMap.get(cumPct);
    if (existing) {
      analysis.push({
        cumPct,
        korean,
        mathSci,
        bestCombo: bestCombo?.name,
        sci1: bestCombo?.sci1,
        sci2: bestCombo?.sci2,
        calculatedScore: bestScore,
        existingScore: existing.scoreSum,
        diff: bestScore - existing.scoreSum,
      });
    }
  });

  return analysis;
}

// ============================================
// 4단계: 조정 계수 발견
// ============================================

function findAdjustmentFactor(analysis) {
  console.log('\n조정 계수 분석 중...');

  // 오차 분포 분석
  const diffs = analysis.map(a => a.diff);
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

  console.log('평균 오차:', avgDiff.toFixed(2));

  // 상위 구간별 오차 분석
  const topDiffs = analysis.slice(0, 20).map(a => a.diff);
  const midDiffs = analysis.slice(Math.floor(analysis.length / 2) - 10, Math.floor(analysis.length / 2) + 10).map(a => a.diff);
  const bottomDiffs = analysis.slice(-20).map(a => a.diff);

  console.log('상위권 평균 오차:', (topDiffs.reduce((a, b) => a + b, 0) / topDiffs.length).toFixed(2));
  console.log('중위권 평균 오차:', (midDiffs.reduce((a, b) => a + b, 0) / midDiffs.length).toFixed(2));
  console.log('하위권 평균 오차:', (bottomDiffs.reduce((a, b) => a + b, 0) / bottomDiffs.length).toFixed(2));

  // 상세 분석 (처음 20개)
  console.log('\n상위 구간 상세 분석:');
  console.log('누적%   | 국어 | 수학 | 과탐조합 | 계산표점 | 기존표점 | 차이');
  console.log('-'.repeat(70));

  analysis.slice(0, 20).forEach(a => {
    const pctStr = a.cumPct < 1 ? a.cumPct.toFixed(2) : String(a.cumPct);
    console.log(
      `${pctStr.padStart(6)}% | ` +
      `${String(a.korean).padStart(4)} | ` +
      `${String(a.mathSci).padStart(4)} | ` +
      `${a.bestCombo?.padStart(4) || '    '} ${String(a.sci1 || 0).padStart(2)}+${String(a.sci2 || 0).padStart(2)} | ` +
      `${String(a.calculatedScore).padStart(8)} | ` +
      `${String(a.existingScore).padStart(8)} | ` +
      `${a.diff >= 0 ? '+' : ''}${a.diff}`
    );
  });

  return avgDiff;
}

// ============================================
// 5단계: 백분위합 계산 및 새 테이블 생성
// ============================================

function generateNewTable(analysis, existingData) {
  console.log('\n새 테이블 생성 중...');

  // 기존 파일의 누적% 목록
  const targetPcts = existingData.map(e => e.cumPct);

  // 분석 결과에서 매핑 생성
  const analysisMap = new Map();
  analysis.forEach(a => {
    analysisMap.set(a.cumPct, a);
  });

  // 새 테이블 생성
  const newTable = [];

  existingData.forEach(existing => {
    const cumPct = existing.cumPct;
    const analyzed = analysisMap.get(cumPct);

    if (analyzed) {
      // 백분위합 역산 (기존 파일 기준)
      // 백분위합 = 국어(100) + 수학(100) + 탐구1(50) + 탐구2(50) = 300 만점
      // 상위 0%면 백분위합 300, 상위 100%면 백분위합 0
      const percentileSum = 300 * (1 - cumPct / 100);

      newTable.push({
        cumPct,
        percentileSum: Math.round(percentileSum * 100) / 100,
        scoreSum: analyzed.calculatedScore,
        existingPercentileSum: existing.percentileSum,
        existingScoreSum: existing.scoreSum,
        korean: analyzed.korean,
        mathSci: analyzed.mathSci,
        sci1: analyzed.sci1,
        sci2: analyzed.sci2,
        bestCombo: analyzed.bestCombo,
      });
    }
  });

  return newTable;
}

// ============================================
// 6단계: 결과 저장
// ============================================

function saveResults(newTable, analysis) {
  const outputWb = XLSX.utils.book_new();

  // 분석 결과 시트
  const analysisData = [
    ['누적%', '국어', '수학', '과탐조합', '과탐1', '과탐2', '계산표점', '기존표점', '차이']
  ];
  analysis.forEach(a => {
    analysisData.push([
      a.cumPct, a.korean, a.mathSci, a.bestCombo,
      a.sci1, a.sci2, a.calculatedScore, a.existingScore, a.diff
    ]);
  });
  XLSX.utils.book_append_sheet(outputWb, XLSX.utils.aoa_to_sheet(analysisData), '역공학분석');

  // 새 테이블 시트
  const tableData = [
    ['누적%', '계산_백분위합', '계산_표점합', '기존_백분위합', '기존_표점합',
     '백분위합차이', '표점합차이', '국어', '수학', '과탐1', '과탐2', '조합']
  ];
  newTable.forEach(t => {
    tableData.push([
      t.cumPct,
      t.percentileSum,
      t.scoreSum,
      t.existingPercentileSum,
      t.existingScoreSum,
      Math.round((t.percentileSum - t.existingPercentileSum) * 100) / 100,
      t.scoreSum - t.existingScoreSum,
      t.korean,
      t.mathSci,
      t.sci1,
      t.sci2,
      t.bestCombo
    ]);
  });
  XLSX.utils.book_append_sheet(outputWb, XLSX.utils.aoa_to_sheet(tableData), '생성테이블');

  const outputPath = path.join(uploadsDir, '누적백분위_역공학.xlsx');
  XLSX.writeFile(outputWb, outputPath);
  console.log('\n결과 저장:', outputPath);
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('누적백분위 테이블 역공학 분석');
  console.log('='.repeat(60));

  // 1. 데이터 로드
  const cumulativeData = loadCumulativeData();
  console.log('상위누적 데이터 행 수:', cumulativeData.length);

  // 2. 기존 파일 분석
  const existingData = analyzeExistingFile();

  // 3. 역공학 분석
  const analysis = reverseEngineer(existingData, cumulativeData);
  console.log('분석 결과 행 수:', analysis.length);

  // 4. 조정 계수 발견
  const avgDiff = findAdjustmentFactor(analysis);

  // 5. 새 테이블 생성
  const newTable = generateNewTable(analysis, existingData);

  // 6. 결과 저장
  saveResults(newTable, analysis);

  // 7. 결론 출력
  console.log('\n' + '='.repeat(60));
  console.log('분석 결론:');
  console.log('='.repeat(60));

  if (Math.abs(avgDiff) < 3) {
    console.log('✅ 오차가 작음 (평균 ' + avgDiff.toFixed(1) + '점)');
    console.log('   → 과목 점수별 상위누적 데이터로 표점합 재현 가능');
  } else {
    console.log('⚠️ 오차가 큼 (평균 ' + avgDiff.toFixed(1) + '점)');
    console.log('   → 기존 파일은 다른 데이터 소스 또는 추가 보정 사용 추정');
  }

  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
