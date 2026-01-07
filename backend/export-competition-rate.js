/**
 * 경쟁률 데이터를 프론트엔드 JSON 형식으로 내보내기
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
  '서울과학기술대학교': '서울', '한국예술종합학교': '서울', '서울기독대학교': '서울',
  '서울신학대학교': '서울', '서울장신대학교': '서울', '서울한영대학교': '서울', '총신대학교': '서울',
  '장로회신학대학교': '서울', '성공회대학교': '서울',

  // 경기
  '성균관대학교(자연과학)': '경기', '아주대학교': '경기', '한양대학교(ERICA)': '경기',
  '경기대학교': '경기', '단국대학교': '경기', '가천대학교': '경기', '수원대학교': '경기',
  '용인대학교': '경기', '강남대학교': '경기', '협성대학교': '경기', '안양대학교': '경기',
  '신한대학교': '경기', '대진대학교': '경기', '한세대학교': '경기', '평택대학교': '경기',
  '경인교육대학교': '경기', '한경국립대학교': '경기', '한국공학대학교': '경기',
  '한국외국어대학교(글로벌)': '경기', '칼빈대학교': '경기', '루터대학교': '경기',
  '한신대학교': '경기',

  // 인천
  '인하대학교': '인천', '국립인천대학교': '인천', '인천가톨릭대학교': '인천',
  '가톨릭관동대학교': '인천', '경인교육대학교(인천)': '인천',

  // 대전
  '한국과학기술원': '대전', 'KAIST': '대전', '충남대학교': '대전', '한남대학교': '대전',
  '대전대학교': '대전', '목원대학교': '대전', '배재대학교': '대전', '우송대학교': '대전',
  '침례신학대학교': '대전', '국립한밭대학교': '대전',

  // 세종
  '고려대학교(세종)': '세종', '홍익대학교(세종)': '세종',

  // 충남
  '백석대학교': '충남', '선문대학교': '충남', '남서울대학교': '충남', '순천향대학교': '충남',
  '호서대학교': '충남', '공주교육대학교': '충남', '국립공주대학교': '충남', '한서대학교': '충남',
  '청운대학교': '충남', '나사렛대학교': '충남',

  // 충북
  '충북대학교': '충북', '한국교원대학교': '충북', '서원대학교': '충북', '청주대학교': '충북',
  '청주교육대학교': '충북', '세명대학교': '충북', '극동대학교': '충북', '중원대학교': '충북',
  '국립한국교통대학교': '충북', '건국대학교(글로컬)': '충북', '건양대학교': '충북',

  // 광주
  '전남대학교': '광주', '조선대학교': '광주', '광주교육대학교': '광주', '광주대학교': '광주',
  '광주여자대학교': '광주', '남부대학교': '광주', '호남대학교': '광주', '광주과학기술원': '광주',
  '송원대학교': '광주',

  // 전남
  '국립목포대학교': '전남', '국립목포해양대학교': '전남', '목포가톨릭대학교': '전남',
  '국립순천대학교': '전남', '동신대학교': '전남', '초당대학교': '전남', '세한대학교': '전남',

  // 전북
  '전북대학교': '전북', '원광대학교': '전북', '전주대학교': '전북', '국립군산대학교': '전북',
  '전주교육대학교': '전북', '우석대학교': '전북', '예수대학교': '전북', '한일장신대학교': '전북',

  // 대구
  '경북대학교': '대구', '계명대학교': '대구', '영남대학교': '대구', '대구교육대학교': '대구',
  '대구대학교': '대구', '대구가톨릭대학교': '대구', '대구한의대학교': '대구', '대구예술대학교': '대구',
  '대구경북과학기술원': '대구',

  // 경북
  '국립금오공과대학교': '경북', '안동대학교': '경북', '국립경국대학교': '경북',
  '김천대학교': '경북', '포항공과대학교': '경북', '신경주대학교': '경북',

  // 경남
  '경상국립대학교': '경남', '국립창원대학교': '경남', '경남대학교': '경남', '인제대학교': '경남',
  '경동대학교': '경남', '진주교육대학교': '경남', '창신대학교': '경남', '한국에너지공과대학교(KENTECH)': '경남',
  '화성의과학대학교': '경남',

  // 부산
  '부산대학교': '부산', '동아대학교': '부산', '부산교육대학교': '부산', '동의대학교': '부산',
  '경성대학교': '부산', '신라대학교': '부산', '동명대학교': '부산', '동서대학교': '부산',
  '부산외국어대학교': '부산', '부산가톨릭대학교': '부산', '국립부경대학교': '부산',
  '고신대학교': '부산', '영산대학교': '부산',

  // 울산
  '울산대학교': '울산', '울산과학기술대학교': '울산',

  // 강원
  '강원대학교(춘천,삼척)': '강원', '강원대학교(강릉,원주)': '강원', '한림대학교': '강원',
  '춘천교육대학교': '강원', '상지대학교': '강원', '한라대학교': '강원', '가톨릭꽃동네대학교': '강원',
  '강서대학교': '강원', '연세대학교(미래)': '강원', '한동대학교': '강원',

  // 제주
  '제주대학교': '제주',
};

// 군 정보 추출
function extractGroup(admissionType) {
  if (!admissionType) return null;

  const type = admissionType.toLowerCase();
  if (type.includes('가군') || type.includes('(가)')) return '가군';
  if (type.includes('나군') || type.includes('(나)')) return '나군';
  if (type.includes('다군') || type.includes('(다)')) return '다군';

  return null;
}

// 전형유형 분류
function classifyAdmissionType(admissionType) {
  if (!admissionType) return { 전형유형: '일반', 특별전형카테고리: null };

  const type = admissionType;

  // 특별전형 카테고리 판별
  if (type.includes('기회균형') || type.includes('기초생활') || type.includes('차상위') || type.includes('한부모')) {
    return { 전형유형: '특별', 특별전형카테고리: '기회균등' };
  }
  if (type.includes('농어촌')) {
    return { 전형유형: '특별', 특별전형카테고리: '농어촌' };
  }
  if (type.includes('특성화고') || type.includes('특성화고교') || type.includes('재직자')) {
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
  if (type.includes('평생학습') || type.includes('성인학습')) {
    return { 전형유형: '특별', 특별전형카테고리: '성인학습' };
  }

  return { 전형유형: '일반', 특별전형카테고리: null };
}

async function exportData() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
    client_encoding: 'UTF8',
  });

  try {
    await client.connect();
    console.log('데이터베이스 연결 성공');

    const result = await client.query(`
      SELECT
        university_name,
        department_name,
        admission_type,
        recruitment_count,
        application_count,
        competition_rate
      FROM application_rates
      ORDER BY university_name, department_name
    `);

    console.log(`총 ${result.rows.length}개 데이터 조회`);

    const data = {
      가군: [],
      나군: [],
      다군: [],
    };

    let grouped = 0;
    let ungrouped = 0;

    for (const row of result.rows) {
      const group = extractGroup(row.admission_type);
      const { 전형유형, 특별전형카테고리 } = classifyAdmissionType(row.admission_type);

      const entry = {
        대학명: row.university_name,
        캠퍼스: '',
        전형명: row.admission_type || '일반전형',
        모집단위: row.department_name,
        모집인원: parseInt(row.recruitment_count) || 0,
        지원인원: parseInt(row.application_count) || 0,
        경쟁률: `${parseFloat(row.competition_rate).toFixed(2)}:1`,
        지역: universityRegions[row.university_name] || '기타',
        전형유형,
        특별전형카테고리,
      };

      if (group) {
        data[group].push(entry);
        grouped++;
      } else {
        // 군 정보가 없으면 나군에 배치 (기본값)
        data.나군.push(entry);
        ungrouped++;
      }
    }

    console.log(`군 분류 완료: ${grouped}개 분류됨, ${ungrouped}개 기본(나군) 배치`);
    console.log(`가군: ${data.가군.length}개, 나군: ${data.나군.length}개, 다군: ${data.다군.length}개`);

    // JSON 파일 저장
    const outputPath = path.join(__dirname, '../frontend/public/data/competition-rate.json');

    // 디렉토리 생성
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`JSON 파일 저장 완료: ${outputPath}`);

  } catch (error) {
    console.error('에러:', error);
  } finally {
    await client.end();
  }
}

exportData();
