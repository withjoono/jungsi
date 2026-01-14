/**
 * Excel 파일에서 실질 경쟁률 데이터를 읽어 프론트엔드 JSON 형식으로 변환
 */

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// 2025년 정시 컷 데이터 로드 (작년 추합 데이터)
let previousYearData = [];
try {
  const prevDataPath = path.join(__dirname, 'uploads', '2025-jungsi-cut-converted.json');
  if (fs.existsSync(prevDataPath)) {
    previousYearData = JSON.parse(fs.readFileSync(prevDataPath, 'utf8'));
    console.log(`2025년 정시 컷 데이터 로드: ${previousYearData.length}개 항목`);
  }
} catch (error) {
  console.warn('작년 데이터 로드 실패:', error.message);
}

// 대학별 지역 매핑
const universityRegions = {
  // 서울
  '서울대학교': '서울', '연세대학교(서울)': '서울', '고려대학교(안암)': '서울', '서강대학교': '서울',
  '성균관대학교': '서울', '한양대학교(서울)': '서울', '중앙대학교': '서울', '경희대학교': '서울',
  '한국외국어대학교': '서울', '서울시립대학교': '서울', '건국대학교 서울캠퍼스': '서울',
  '동국대학교(서울)': '서울', '홍익대학교(서울)': '서울', '국민대학교': '서울', '숭실대학교': '서울',
  '세종대학교': '서울', '광운대학교': '서울', '명지대학교': '서울', '상명대학교': '서울',
  '서경대학교': '서울', '삼육대학교': '서울', '서울여자대학교': '서울', '덕성여자대학교': '서울',
  '동덕여자대학교': '서울', '성신여자대학교': '서울', '숙명여자대학교': '서울', '이화여자대학교': '서울',
  '한성대학교': '서울', '서울교육대학교': '서울', '추계예술대학교': '서울', '한국체육대학교': '서울',
  '서울과학기술대학교': '서울', '한국예술종합학교': '서울',

  // 경기
  '성균관대학교(자연과학)': '경기', '아주대학교': '경기', '한양대학교(ERICA)': '경기',
  '경기대학교': '경기', '단국대학교': '경기', '가천대학교': '경기', '수원대학교': '경기',
  '용인대학교': '경기', '강남대학교': '경기', '협성대학교': '경기', '안양대학교': '경기',
  '신한대학교': '경기', '대진대학교': '경기', '한세대학교': '경기', '평택대학교': '경기',
  '경인교육대학교': '경기', '한경국립대학교': '경기', '한국공학대학교': '경기',
  '한국외국어대학교(글로벌)': '경기',

  // 인천
  '인하대학교': '인천', '국립인천대학교': '인천', '인천가톨릭대학교': '인천',
  '가톨릭관동대학교': '인천',

  // 대전
  '한국과학기술원': '대전', 'KAIST': '대전', '충남대학교': '대전', '한남대학교': '대전',
  '대전대학교': '대전', '목원대학교': '대전', '배재대학교': '대전', '우송대학교': '대전',
  '국립한밭대학교': '대전',

  // 세종
  '고려대학교(세종)': '세종', '홍익대학교(세종)': '세종',

  // 충남
  '백석대학교': '충남', '선문대학교': '충남', '남서울대학교': '충남', '순천향대학교': '충남',
  '호서대학교': '충남', '공주교육대학교': '충남', '국립공주대학교': '충남', '한서대학교': '충남',

  // 충북
  '충북대학교': '충북', '한국교원대학교': '충북', '서원대학교': '충북', '청주대학교': '충북',
  '청주교육대학교': '충북', '세명대학교': '충북', '극동대학교': '충북', '중원대학교': '충북',
  '국립한국교통대학교': '충북', '건국대학교(글로컬)': '충북',

  // 광주
  '전남대학교': '광주', '조선대학교': '광주', '광주교육대학교': '광주', '광주대학교': '광주',
  '광주여자대학교': '광주', '남부대학교': '광주', '호남대학교': '광주', '광주과학기술원': '광주',

  // 전남
  '국립목포대학교': '전남', '국립목포해양대학교': '전남', '목포가톨릭대학교': '전남',
  '국립순천대학교': '전남', '동신대학교': '전남',

  // 전북
  '전북대학교': '전북', '원광대학교': '전북', '전주대학교': '전북', '국립군산대학교': '전북',
  '전주교육대학교': '전북', '우석대학교': '전북',

  // 대구
  '경북대학교': '대구', '계명대학교': '대구', '영남대학교': '대구', '대구교육대학교': '대구',
  '대구대학교': '대구', '대구가톨릭대학교': '대구', '대구한의대학교': '대구',
  '대구경북과학기술원': '대구',

  // 경북
  '국립금오공과대학교': '경북', '안동대학교': '경북', '국립경북대학교': '경북',
  '포항공과대학교': '경북',

  // 경남
  '경상국립대학교': '경남', '국립창원대학교': '경남', '경남대학교': '경남', '인제대학교': '경남',
  '진주교육대학교': '경남',

  // 부산
  '부산대학교': '부산', '동아대학교': '부산', '부산교육대학교': '부산', '동의대학교': '부산',
  '경성대학교': '부산', '신라대학교': '부산', '동명대학교': '부산', '동서대학교': '부산',
  '부산외국어대학교': '부산', '부산가톨릭대학교': '부산', '국립부경대학교': '부산',
  '고신대학교': '부산',

  // 울산
  '울산대학교': '울산', '울산과학기술대학교': '울산',

  // 강원
  '강원대학교(춘천,삼척)': '강원', '강원대학교(강릉,원주)': '강원', '한림대학교': '강원',
  '춘천교육대학교': '강원', '상지대학교': '강원', '연세대학교(미래)': '강원', '한동대학교': '강원',

  // 제주
  '제주대학교': '제주',
};

// 군 정보 추출
function extractGroup(text) {
  if (!text) return null;

  const str = String(text);
  if (str.includes('가군') || str.includes('(가)')) return '가군';
  if (str.includes('나군') || str.includes('(나)')) return '나군';
  if (str.includes('다군') || str.includes('(다)')) return '다군';

  return null;
}

// 전형유형 분류
function classifyAdmissionType(admissionType) {
  if (!admissionType) return { 전형유형: '일반', 특별전형카테고리: null };

  const type = String(admissionType);

  if (type.includes('기회균형') || type.includes('기초생활') || type.includes('차상위')) {
    return { 전형유형: '특별', 특별전형카테고리: '기회균등' };
  }
  if (type.includes('농어촌')) {
    return { 전형유형: '특별', 특별전형카테고리: '농어촌' };
  }
  if (type.includes('특성화고')) {
    return { 전형유형: '특별', 특별전형카테고리: '특성화고' };
  }
  if (type.includes('지역인재') || type.includes('지역균형')) {
    return { 전형유형: '특별', 특별전형카테고리: '지역인재' };
  }
  if (type.includes('장애') || type.includes('특수')) {
    return { 전형유형: '특별', 특별전형카테고리: '장애/특수' };
  }
  if (type.includes('재외국민') || type.includes('외국인')) {
    return { 전형유형: '특별', 특별전형카테고리: '재외국민' };
  }

  return { 전형유형: '일반', 특별전형카테고리: null };
}

// 숫자 값을 안전하게 파싱
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  const num = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
}

// 작년 추합 데이터 찾기 (2025년 정시 컷 데이터에서)
function findPreviousYearChuhap(대학명, 모집단위, 군) {
  if (!previousYearData || previousYearData.length === 0) return 0;

  // 1순위: 대학명 + 모집단위 + 군 정확히 일치
  let match = previousYearData.find(item =>
    item.university === 대학명 &&
    item.recruitment_name === 모집단위 &&
    item.admission_type === 군
  );

  if (match && match.competition_ratio) {
    return parseNumber(match.competition_ratio);
  }

  // 2순위: 대학명 + 모집단위만 일치
  match = previousYearData.find(item =>
    item.university === 대학명 &&
    item.recruitment_name === 모집단위
  );

  if (match && match.competition_ratio) {
    return parseNumber(match.competition_ratio);
  }

  // 3순위: 대학명만 일치하는 평균값
  const univMatches = previousYearData.filter(item =>
    item.university === 대학명 && item.competition_ratio
  );

  if (univMatches.length > 0) {
    const total = univMatches.reduce((sum, item) => sum + parseNumber(item.competition_ratio), 0);
    return total / univMatches.length;
  }

  return 0;
}

// 예상실질경쟁률 계산
function calcRealCompetitionRate(정원, 예상최종경쟁값, 작년추합) {
  const 분모 = 정원 + 작년추합;
  if (분모 <= 0) return 0;
  return (정원 * 예상최종경쟁값) / 분모;
}

async function convertExcelToJson() {
  const excelPath = path.join(__dirname, 'uploads', '최종경쟁률_v13_20260106_1518.xlsx');

  if (!fs.existsSync(excelPath)) {
    console.error(`Excel 파일을 찾을 수 없습니다: ${excelPath}`);
    return;
  }

  console.log('Excel 파일 읽는 중...');
  const workbook = xlsx.readFile(excelPath);

  console.log(`시트 목록: ${workbook.SheetNames.join(', ')}`);

  const data = {
    가군: [],
    나군: [],
    다군: [],
  };

  let totalProcessed = 0;
  let grouped = 0;
  let ungrouped = 0;

  // 모든 시트 처리
  for (const sheetName of workbook.SheetNames) {
    console.log(`\n시트 처리 중: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log(`  - ${rows.length}개 행 발견`);

    // 첫 번째 행의 컬럼 확인
    if (rows.length > 0) {
      console.log('  - 컬럼:', Object.keys(rows[0]).join(', '));
    }

    for (const row of rows) {
      // 군 정보 추출 (군 컬럼, 전형명, 또는 시트명에서)
      const group = extractGroup(row['군'] || row['전형명'] || row['모집군'] || sheetName);
      const { 전형유형, 특별전형카테고리 } = classifyAdmissionType(row['전형명']);

      const 대학명 = String(row['대학명'] || '');
      const 모집단위 = String(row['모집단위'] || '');
      const 정원 = parseNumber(row['정원'] || row['모집인원']);
      const 경쟁률_숫자 = parseNumber(row['경쟁률']);
      const 경쟁률_문자열 = String(row['경쟁률_문자열'] || row['경쟁률'] || '0:1');

      // 작년 추합 데이터 찾기
      const 작년추합 = findPreviousYearChuhap(대학명, 모집단위, group);

      // 예상최종경쟁값 = 현재 경쟁률 (최종경쟁률과 동일)
      const 예상최종경쟁값 = 경쟁률_숫자;

      // 예상실질경쟁률 계산
      const 예상실질경쟁값 = calcRealCompetitionRate(정원, 예상최종경쟁값, 작년추합);

      const entry = {
        대학명,
        캠퍼스: String(row['캠퍼스'] || ''),
        전형명: String(row['전형명'] || '일반전형'),
        모집단위,
        모집인원: parseNumber(row['모집인원'] || row['정원']),
        지원인원: parseNumber(row['지원인원']),
        경쟁률: 경쟁률_문자열,
        지역: universityRegions[대학명] || '기타',
        전형유형,
        특별전형카테고리,
        // 추합 관련 필드
        정원,
        최종경쟁률: 경쟁률_문자열,  // 현재경쟁률 → 최종경쟁률로 명칭 변경
        작년추합: Math.round(작년추합 * 100) / 100,  // 소수점 2자리
        예상최종경쟁: 경쟁률_문자열,  // 최종경쟁률과 동일
        예상최종경쟁값,
        예상실질경쟁: `${예상실질경쟁값.toFixed(2)}:1`,
        예상실질경쟁값: Math.round(예상실질경쟁값 * 100) / 100,
      };

      if (group) {
        data[group].push(entry);
        grouped++;
      } else {
        // 군 정보가 없으면 나군에 배치 (기본값)
        data.나군.push(entry);
        ungrouped++;
      }

      totalProcessed++;
    }
  }

  console.log(`\n총 ${totalProcessed}개 데이터 처리 완료`);
  console.log(`군 분류: ${grouped}개, 미분류(나군 배치): ${ungrouped}개`);
  console.log(`가군: ${data.가군.length}개, 나군: ${data.나군.length}개, 다군: ${data.다군.length}개`);

  // JSON 파일 저장
  const outputPath = path.join(__dirname, '../jungsi-frontend/public/data/competition-rate.json');

  // 디렉토리 생성
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\nJSON 파일 저장 완료: ${outputPath}`);

  // 샘플 데이터 출력
  console.log('\n샘플 데이터 (가군 첫 3개):');
  console.log(JSON.stringify(data.가군.slice(0, 3), null, 2));
}

convertExcelToJson().catch(console.error);
