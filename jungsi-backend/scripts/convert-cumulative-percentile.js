/**
 * Excel → JSON 변환 스크립트: js_26_cumulative_percentile.xlsx
 *
 * 구조:
 * - Column 1: 누백 (cumulative percentile)
 * - Column 2: 표점합 (standard score sum)
 * - Columns 3+: 557개 대학 환산인자별 누백
 *
 * 출력:
 * - 2026-cumulative-percentile.json: 사용자 누백 조회용 (표점합 → 누백)
 * - 2026-factor-percentile.json: 대학 환산인자별 누백 (표점합 → 인자별 누백)
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 경로 설정
const EXCEL_PATH = path.join(__dirname, '../uploads/js_26_cumulative_percentile.xlsx');
const OUTPUT_DIR = path.join(__dirname, '../src/modules/jungsi/calculation/data');

// 출력 파일명
const USER_PERCENTILE_FILE = '2026-cumulative-percentile.json';
const FACTOR_PERCENTILE_FILE = '2026-factor-percentile.json';

function convertExcelToJson() {
  console.log('📂 Excel 파일 읽는 중...');
  console.log(`   경로: ${EXCEL_PATH}`);

  // Excel 파일 읽기
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 시트 범위 확인
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  console.log(`📊 시트 범위: ${range.s.c + 1}열 ~ ${range.e.c + 1}열, ${range.s.r + 1}행 ~ ${range.e.r + 1}행`);

  // 헤더 읽기 (첫 번째 행)
  const headers = [];
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    const cell = worksheet[cellAddress];
    const headerValue = cell ? String(cell.v).trim() : `Column_${col}`;
    headers.push(headerValue);
  }

  console.log(`📋 총 열 수: ${headers.length}`);
  console.log(`   - 첫 번째 열 (누백): ${headers[0]}`);
  console.log(`   - 두 번째 열 (표점합): ${headers[1]}`);
  console.log(`   - 대학 환산인자 수: ${headers.length - 2}`);
  console.log(`   - 첫 5개 인자: ${headers.slice(2, 7).join(', ')}`);

  // 사용자 누백 조회 데이터 (표점합 → 누백)
  const userPercentile = {};

  // 대학 환산인자별 데이터 구조:
  // {
  //   factors: ["가천의학", "가천통합백", ...],
  //   data: {
  //     "427.00": { "누백": 0.00, "가천의학": 996, ... },
  //     ...
  //   }
  // }
  const factorPercentile = {
    factors: headers.slice(2),
    data: {}
  };

  // 데이터 행 읽기 (2번째 행부터)
  let rowCount = 0;
  for (let row = 1; row <= range.e.r; row++) {
    // 누백 (Column 1)
    const nubaekCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
    // 표점합 (Column 2)
    const pyojumCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 1 })];

    if (!nubaekCell || !pyojumCell) continue;

    const nubaek = parseFloat(nubaekCell.v);
    const pyojum = parseFloat(pyojumCell.v);

    if (isNaN(nubaek) || isNaN(pyojum)) continue;

    // 표점합 키 생성 (소수점 2자리)
    const pyojumKey = pyojum.toFixed(2);

    // 사용자 누백 저장
    userPercentile[pyojumKey] = nubaek.toFixed(2);

    // 대학 환산인자별 누백 저장
    const factorData = {
      누백: nubaek
    };

    for (let col = 2; col <= range.e.c; col++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
      const factorName = headers[col];

      if (cell && factorName) {
        const value = parseFloat(cell.v);
        if (!isNaN(value)) {
          factorData[factorName] = value;
        }
      }
    }

    factorPercentile.data[pyojumKey] = factorData;
    rowCount++;
  }

  console.log(`✅ 데이터 행 처리 완료: ${rowCount}행`);

  // JSON 파일 저장
  const userPercentilePath = path.join(OUTPUT_DIR, USER_PERCENTILE_FILE);
  const factorPercentilePath = path.join(OUTPUT_DIR, FACTOR_PERCENTILE_FILE);

  // 사용자 누백 파일 저장 (기존 형식 유지)
  fs.writeFileSync(userPercentilePath, JSON.stringify(userPercentile, null, 2), 'utf8');
  console.log(`📁 사용자 누백 파일 저장: ${userPercentilePath}`);
  console.log(`   - 항목 수: ${Object.keys(userPercentile).length}`);

  // 대학 환산인자별 누백 파일 저장
  fs.writeFileSync(factorPercentilePath, JSON.stringify(factorPercentile, null, 2), 'utf8');
  console.log(`📁 대학 환산인자별 누백 파일 저장: ${factorPercentilePath}`);
  console.log(`   - 대학 환산인자 수: ${factorPercentile.factors.length}`);
  console.log(`   - 표점합 항목 수: ${Object.keys(factorPercentile.data).length}`);

  // 샘플 데이터 출력
  const sampleKeys = Object.keys(userPercentile).slice(0, 5);
  console.log('\n📌 샘플 데이터 (사용자 누백):');
  sampleKeys.forEach(key => {
    console.log(`   표점합 ${key} → 누백 ${userPercentile[key]}%`);
  });

  console.log('\n📌 샘플 데이터 (대학 환산인자별):');
  const samplePyojum = Object.keys(factorPercentile.data)[0];
  if (samplePyojum) {
    const sampleFactorData = factorPercentile.data[samplePyojum];
    console.log(`   표점합 ${samplePyojum}:`);
    console.log(`   - 누백: ${sampleFactorData['누백']}%`);
    const factorSamples = Object.keys(sampleFactorData).filter(k => k !== '누백').slice(0, 3);
    factorSamples.forEach(f => {
      console.log(`   - ${f}: ${sampleFactorData[f]}`);
    });
  }

  console.log('\n✨ 변환 완료!');
}

// 실행
try {
  convertExcelToJson();
} catch (error) {
  console.error('❌ 변환 실패:', error.message);
  process.exit(1);
}
