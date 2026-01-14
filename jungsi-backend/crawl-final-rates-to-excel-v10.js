/**
 * 모든 대학 최종 경쟁률 엑셀 크롤링 스크립트 v10
 *
 * v10 개선사항:
 * - v8 기본 파서 유지 (대부분의 대학에 잘 작동)
 * - 특수 대학만 전용 파서 적용 (연세대, 대구대, 숭실대 등)
 * - 세밀한 rowspan 값 상속 (모집인원 컬럼만)
 * - 대구대학교 가로형 테이블 전용 파서
 *
 * 사용법: node crawl-final-rates-to-excel-v10.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// ==================== 설정 ====================
const CONFIG = {
  CONCURRENCY: 10,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  REQUEST_TIMEOUT: 30000,
  DELAY_BETWEEN_BATCHES: 100,
  ENCODINGS: ['utf-8', 'euc-kr', 'cp949', 'iso-8859-1'],
  VERBOSE_LOGGING: false,
  LOG_ERRORS_TO_FILE: true,
};

// 특수 대학 목록 (전용 파서 사용)
const SPECIAL_PARSER_UNIVS = [
  '연세대학교(서울)',
  '대구대학교',
  '숭실대학교',
  '경성대학교',
  '한국체육대학교',
];

// ==================== 대학 목록 ====================
const universities = [
  { universityName: "가야대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10010671.html" },
  { universityName: "가천대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10190591.html" },
  { universityName: "가톨릭관동대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOjlMSnJXOi9KLWZUZg==" },
  { universityName: "가톨릭꽃동네대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KMGE5OUpyVzovSi1mVGY=" },
  { universityName: "가톨릭대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KTCVDYXwwOExKclc6L0otZlRm" },
  { universityName: "강남대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KTThXclc4OUpyVzovSi1mVGY=" },
  { universityName: "강서대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10360701.html" },
  { universityName: "강원대학교(강릉,원주) 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOldOckpyVzovSi1mVGY=" },
  { universityName: "강원대학교(춘천,삼척) 정시", dataLink: "https://ratio.uwayapply.com/Sl5KV2FOclc4OUpyVzovSi1mVGY=" },
  { universityName: "건국대학교 서울캠퍼스 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10080331.html" },
  { universityName: "건국대학교(글로컬) 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10091121.html" },
  { universityName: "건양대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10100721.html" },
  { universityName: "경기대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KJXJyV2FiOUpyVzovSi1mVGY=" },
  { universityName: "경남대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10130531.html" },
  { universityName: "경동대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10140381.html" },
  { universityName: "경북대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOlc5SnJXOi9KLWZUZg==" },
  { universityName: "경상국립대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10170861.html" },
  { universityName: "경성대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KJjlKclc6L0otZlRm" },
  { universityName: "경인교육대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20060241.html" },
  { universityName: "경희대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOnw5SnJXOi9KLWZUZg==" },
  { universityName: "계명대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOk05SnJXOi9KLWZUZg==" },
  { universityName: "고려대학교(세종) 정시", dataLink: "https://ratio.uwayapply.com/Sl5KcldhL2AmOzhgfWE5SnJXOi9KLWZUZg==" },
  { universityName: "고려대학교(안암) 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOGB9YTlKclc6L0otZlRm" },
  { universityName: "고신대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KVyUmYTlKclc6L0otZlRm" },
  { universityName: "공주교육대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KYDY6L3JXYTlKclc6L0otZlRm" },
  { universityName: "광운대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KTjlKclc6L0otZlRm" },
  { universityName: "광주과학기술원 정시", dataLink: "https://ratio.uwayapply.com/SmZKbzBlbyZlbyVlb3JlSl4lJjomSi1mVGY=" },
  { universityName: "광주교육대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KYDY6L3JXOE45SnJXOi9KLWZUZg==" },
  { universityName: "광주대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOi9yVzhOckpyVzovSi1mVGY=" },
  { universityName: "광주여자대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOk45SnJXOi9KLWZUZg==" },
  { universityName: "국립경국대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KcldhVlc4SnJXOi9KLWZUZg==" },
  { universityName: "국립공주대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10280951.html" },
  { universityName: "국립군산대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10350551.html" },
  { universityName: "국립금오공과대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KfGFNOjlKclc6L0otZlRm" },
  { universityName: "국립목포대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10690221.html" },
  { universityName: "국립목포해양대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10700481.html" },
  { universityName: "국립부경대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10720341.html" },
  { universityName: "국립순천대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10990431.html" },
  { universityName: "국립인천대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11230671.html" },
  { universityName: "국립창원대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11350571.html" },
  { universityName: "국립한국교통대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30150571.html" },
  { universityName: "국립한국해양대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOmFNOUpyVzovSi1mVGY=" },
  { universityName: "국립한밭대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30040831.html" },
  { universityName: "국민대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KVyVNOWFhOUpyVzovSi1mVGY=" },
  { universityName: "극동대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOlY5SnJXOi9KLWZUZg==" },
  { universityName: "금강대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOnJySnJXOi9KLWZUZg==" },
  { universityName: "김천대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KV2FgfExNJXJKclc6L0otZlRm" },
  { universityName: "나사렛대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOld9YTlKclc6L0otZlRm" },
  { universityName: "남부대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOkJNOFdKclc6L0otZlRm" },
  { universityName: "남서울대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KQzphYCZNOFdKclc6L0otZlRm" },
  { universityName: "단국대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10420451.html" },
  { universityName: "대구가톨릭대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10460951.html" },
  { universityName: "대구경북과학기술원 정시", dataLink: "https://ratio.uwayapply.com/SmZKMCYlclZKXiUmOiZKLWZUZg==" },
  { universityName: "대구교육대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KYDpXVkpyVzovSi1mVGY=" },
  { universityName: "대구대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10440751.html" },
  { universityName: "대구예술대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOjgwSnJXOi9KLWZUZg==" },
  { universityName: "대구한의대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10160651.html" },
  { universityName: "대전대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10500941.html" },
  { universityName: "대진대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KVyUvYDhWSnJXOi9KLWZUZg==" },
  { universityName: "덕성여자대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10530571.html" },
  { universityName: "동국대학교(서울) 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10550471.html" },
  { universityName: "동국대학교(WISE) 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10540631.html" },
  { universityName: "동덕여자대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOTpWcldhVkpyVzovSi1mVGY=" },
  { universityName: "동명대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30050611.html" },
  { universityName: "동서대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10570671.html" },
  { universityName: "동신대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOlclfCZyV2FWSnJXOi9KLWZUZg==" },
  { universityName: "동아대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10591271.html" },
  { universityName: "동의대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOmBWSnJXOi9KLWZUZg==" },
  { universityName: "루터대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOjBDSnJXOi9KLWZUZg==" },
  { universityName: "명지대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10650671.html" },
  { universityName: "목원대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10670691.html" },
  { universityName: "목포가톨릭대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOkxNSnJXOi9KLWZUZg==" },
  { universityName: "배재대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOkxpSnJXOi9KLWZUZg==" },
  { universityName: "백석대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOkJKclc6L0otZlRm" },
  { universityName: "부산가톨릭대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10730521.html" },
  { universityName: "부산교육대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20040261.html" },
  { universityName: "부산대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio12100601.html" },
  { universityName: "부산외국어대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10750461.html" },
  { universityName: "삼육대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10760641.html" },
  { universityName: "상명대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KYX0wVyU6TSZKclc6L0otZlRm" },
  { universityName: "상지대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KJS9yVzgmSnJXOi9KLWZUZg==" },
  { universityName: "서강대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio12050441.html" },
  { universityName: "서경대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10810611.html" },
  { universityName: "서울과학기술대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KMDpXJkpyVzovSi1mVGY=" },
  { universityName: "서울교육대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KYDpXJkpyVzovSi1mVGY=" },
  { universityName: "서울기독대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10520521.html" },
  { universityName: "서울시립대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KJmE6SnJXOi9KLWZUZg==" },
  { universityName: "서울신학대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOjAmSnJXOi9KLWZUZg==" },
  { universityName: "서울여자대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10860661.html" },
  { universityName: "서울장신대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KVyUmclc4L0M6YWAmSnJXOi9KLWZUZg==" },
  { universityName: "서울한영대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11660401.html" },
  { universityName: "서원대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10880541.html" },
  { universityName: "선문대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KV2FhTVc6JkpyVzovSi1mVGY=" },
  { universityName: "성결대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10900691.html" },
  { universityName: "성공회대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10910461.html" },
  { universityName: "성균관대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10920501.html" },
  { universityName: "성신여자대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10930121.html" },
  { universityName: "세명대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5Kclc6Yk1gJkpyVzovSi1mVGY=" },
  { universityName: "세종대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10950641.html" },
  { universityName: "송원대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KV2FOcldhJkpyVzovSi1mVGY=" },
  { universityName: "수원대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10970421.html" },
  { universityName: "숙명여자대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10981281.html" },
  { universityName: "순천향대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KfEwmSnJXOi9KLWZUZg==" },
  { universityName: "숭실대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11010721.html" },
  { universityName: "신경주대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOi9yV2FgYnJKclc6L0otZlRm" },
  { universityName: "신라대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020571.html" },
  { universityName: "신한대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11870691.html" },
  { universityName: "아주대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11040651.html" },
  { universityName: "안양대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5Kclc4Ylc4SnJXOi9KLWZUZg==" },
  { universityName: "연세대학교(미래) 정시", dataLink: "https://ratio.uwayapply.com/Sl5KZiVgJldhYkpyVzovSi1mVGY=" },
  { universityName: "연세대학교(서울) 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11080721.html" },
  { universityName: "영남대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOmJKclc6L0otZlRm" },
  { universityName: "영산대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30100261.html" },
  { universityName: "예수대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOmlNSnJXOi9KLWZUZg==" },
  { universityName: "용인대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KVyVyV2FiSnJXOi9KLWZUZg==" },
  { universityName: "우석대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11150551.html" },
  { universityName: "우송대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KcldhJmFhTkpyVzovSi1mVGY=" },
  { universityName: "울산과학기술대학교 정시", dataLink: "https://ratio.uwayapply.com/SmZKMCYlVzpKXiUmOiZKLWZUZg==" },
  { universityName: "울산대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KVzgmQzpKclc6L0otZlRm" },
  { universityName: "원광대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5Kclc4TjlXYU5Kclc6L0otZlRm" },
  { universityName: "을지대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11190611.html" },
  { universityName: "이화여자대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11201731.html" },
  { universityName: "인제대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KYC9XJUpyVzovSi1mVGY=" },
  { universityName: "인천가톨릭대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOkxMJUpyVzovSi1mVGY=" },
  { universityName: "인하대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOHxXJUpyVzovSi1mVGY=" },
  { universityName: "장로회신학대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KJjBMaUpyVzovSi1mVGY=" },
  { universityName: "전남대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOlcvSnJXOi9KLWZUZg==" },
  { universityName: "전북대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOldCL0pyVzovSi1mVGY=" },
  { universityName: "전주교육대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KYDpXL0pyVzovSi1mVGY=" },
  { universityName: "전주대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOi9XYWAvSnJXOi9KLWZUZg==" },
  { universityName: "제주대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOlc6L2AvSnJXOi9KLWZUZg==" },
  { universityName: "조선대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11300511.html" },
  { universityName: "중부대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11310871.html" },
  { universityName: "중앙대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOjhMSnJXOi9KLWZUZg==" },
  { universityName: "중원대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11920231.html" },
  { universityName: "진주교육대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KYDpMSnJXOi9KLWZUZg==" },
  { universityName: "차 의과학대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOHxMSnJXOi9KLWZUZg==" },
  { universityName: "청운대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KV2FhTnJXOnxMSnJXOi9KLWZUZg==" },
  { universityName: "청주교육대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20100311.html" },
  { universityName: "청주대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOi9yV2FgfExKclc6L0otZlRm" },
  { universityName: "초당대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5Kclc4VmF8TEpyVzovSi1mVGY=" },
  { universityName: "총신대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KVyV8JnJXYXxMSnJXOi9KLWZUZg==" },
  { universityName: "추계예술대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KYGJyOnxMSnJXOi9KLWZUZg==" },
  { universityName: "춘천교육대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20110301.html" },
  { universityName: "충남대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11400421.html" },
  { universityName: "충북대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11410901.html" },
  { universityName: "침례신학대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KJjowQjlKclc6L0otZlRm" },
  { universityName: "칼빈대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KVyVEQzhMSnJXOi9KLWZUZg==" },
  { universityName: "평택대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOjBpSnJXOi9KLWZUZg==" },
  { universityName: "한경국립대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30161041.html" },
  { universityName: "한국공학대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30170641.html" },
  { universityName: "한국과학기술원 정시", dataLink: "https://ratio.uwayapply.com/SmZKMCYlODlKXiUmOiZKLWZUZg==" },
  { universityName: "한국교원대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11480361.html" },
  { universityName: "한국기술교육대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KfExgMDhgfWE5SnJXOi9KLWZUZg==" },
  { universityName: "한국에너지공과대학교(KENTECH) 정시", dataLink: "https://ratio.uwayapply.com/SmZKfExgMFdgOUpeJSY6JkotZlRm" },
  { universityName: "한국외국어대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KJmg6fEpyVzovSi1mVGY=" },
  { universityName: "한국체육대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11530401.html" },
  { universityName: "한국항공대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11540891.html" },
  { universityName: "한남대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11560811.html" },
  { universityName: "한동대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11570721.html" },
  { universityName: "한라대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KOENDOHxKclc6L0otZlRm" },
  { universityName: "한림대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KTWJDQzh8SnJXOi9KLWZUZg==" },
  { universityName: "한서대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11600801.html" },
  { universityName: "한성대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5Kclc6Jlc4fEpyVzovSi1mVGY=" },
  { universityName: "한세대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KJWAmVzh8SnJXOi9KLWZUZg==" },
  { universityName: "한신대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11630411.html" },
  { universityName: "한양대학교(서울) 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11640511.html" },
  { universityName: "한양대학교(ERICA) 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11650671.html" },
  { universityName: "한일장신대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KQyVXOHxKclc6L0otZlRm" },
  { universityName: "협성대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5Kclc6Jmk6YnxKclc6L0otZlRm" },
  { universityName: "호남대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11690581.html" },
  { universityName: "호서대학교 정시", dataLink: "https://ratio.uwayapply.com/Sl5KYWAmYXxKclc6L0otZlRm" },
  { universityName: "홍익대학교(서울) 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720771.html" },
  { universityName: "홍익대학교(세종) 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720772.html" },
  { universityName: "화성의과학대학교 정시", dataLink: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11880411.html" },
];

// 서울대학교 수동 데이터
const snuData = [
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '인문대학', 모집인원: 63, 지원인원: 201, 경쟁률: 3.19 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '사회과학대학', 모집인원: 71, 지원인원: 310, 경쟁률: 4.37 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '자연과학대학', 모집인원: 116, 지원인원: 380, 경쟁률: 3.28 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '간호대학', 모집인원: 14, 지원인원: 48, 경쟁률: 3.43 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '경영대학', 모집인원: 39, 지원인원: 189, 경쟁률: 4.85 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '공과대학', 모집인원: 223, 지원인원: 815, 경쟁률: 3.65 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '농업생명과학대학', 모집인원: 65, 지원인원: 190, 경쟁률: 2.92 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '미술대학', 모집인원: 27, 지원인원: 87, 경쟁률: 3.22 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '사범대학', 모집인원: 41, 지원인원: 144, 경쟁률: 3.51 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '생활과학대학', 모집인원: 26, 지원인원: 95, 경쟁률: 3.65 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '수의과대학', 모집인원: 20, 지원인원: 72, 경쟁률: 3.60 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '약학대학', 모집인원: 20, 지원인원: 76, 경쟁률: 3.80 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '음악대학', 모집인원: 31, 지원인원: 92, 경쟁률: 2.97 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '의과대학', 모집인원: 65, 지원인원: 275, 경쟁률: 4.23 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '자유전공학부', 모집인원: 54, 지원인원: 252, 경쟁률: 4.67 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '일반전형', 모집단위: '치의학대학원', 모집인원: 10, 지원인원: 38, 경쟁률: 3.80 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '인문대학', 모집인원: 30, 지원인원: 92, 경쟁률: 3.07 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '사회과학대학', 모집인원: 28, 지원인원: 88, 경쟁률: 3.14 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '자연과학대학', 모집인원: 50, 지원인원: 158, 경쟁률: 3.16 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '간호대학', 모집인원: 5, 지원인원: 16, 경쟁률: 3.20 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '경영대학', 모집인원: 15, 지원인원: 48, 경쟁률: 3.20 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '공과대학', 모집인원: 90, 지원인원: 283, 경쟁률: 3.14 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '농업생명과학대학', 모집인원: 30, 지원인원: 85, 경쟁률: 2.83 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '사범대학', 모집인원: 20, 지원인원: 69, 경쟁률: 3.45 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '생활과학대학', 모집인원: 10, 지원인원: 32, 경쟁률: 3.20 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '수의과대학', 모집인원: 10, 지원인원: 31, 경쟁률: 3.10 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '약학대학', 모집인원: 10, 지원인원: 31, 경쟁률: 3.10 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '의과대학', 모집인원: 25, 지원인원: 69, 경쟁률: 2.76 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '자유전공학부', 모집인원: 30, 지원인원: 104, 경쟁률: 3.47 },
  { 대학명: '서울대학교', 군: '나군', 전형명: '지역균형전형', 모집단위: '치의학대학원', 모집인원: 6, 지원인원: 17, 경쟁률: 2.83 },
];

// ==================== 유틸리티 함수 ====================

function cleanUniversityName(name) {
  return name.replace(' 정시', '').trim();
}

function smartDecode(buffer, contentType = '') {
  const charsetMatch = contentType.match(/charset=([^;]+)/i);
  if (charsetMatch) {
    const charset = charsetMatch[1].toLowerCase().replace(/['"]/g, '').trim();
    if (['euc-kr', 'euc_kr', 'ks_c_5601-1987'].includes(charset)) {
      return { html: iconv.decode(buffer, 'euc-kr'), encoding: 'euc-kr' };
    }
    if (['utf-8', 'utf8'].includes(charset)) {
      return { html: iconv.decode(buffer, 'utf-8'), encoding: 'utf-8' };
    }
  }

  if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return { html: iconv.decode(buffer, 'utf-8'), encoding: 'utf-8' };
  }

  const rawHtml = buffer.toString('binary');
  const metaMatch = rawHtml.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i);
  if (metaMatch) {
    const metaCharset = metaMatch[1].toLowerCase();
    if (['euc-kr', 'euc_kr', 'ks_c_5601-1987'].includes(metaCharset)) {
      return { html: iconv.decode(buffer, 'euc-kr'), encoding: 'euc-kr' };
    }
  }

  const results = [];
  for (const encoding of CONFIG.ENCODINGS) {
    try {
      const decoded = iconv.decode(buffer, encoding);
      const corruptionScore = (decoded.match(/[\ufffd�]/g) || []).length;
      const koreanScore = (decoded.match(/[가-힣]/g) || []).length;
      results.push({ encoding, html: decoded, score: koreanScore - corruptionScore * 10 });
    } catch (e) {}
  }

  results.sort((a, b) => b.score - a.score);
  if (results.length > 0 && results[0].score > 0) {
    return { html: results[0].html, encoding: results[0].encoding };
  }

  return { html: iconv.decode(buffer, 'utf-8'), encoding: 'utf-8' };
}

function extractGroupFromText(text) {
  if (!text) return null;
  const patterns = [
    [/「([가나다])」군/, 1], [/\[([가나다])군\]/, 1], [/\(([가나다])군\)/, 1],
    [/^([가나다]군)\s/, 1], [/캠퍼스\s+([가나다]군)/, 1],
    [/정시\s*㉮/, () => '가군'], [/정시\s*㉯/, () => '나군'], [/정시\s*㉰/, () => '다군'],
    [/㉮군/, () => '가군'], [/㉯군/, () => '나군'], [/㉰군/, () => '다군'],
    [/^([가나다]군)\s*(정원내|정원외)/, 1], [/([가나다])군/, 1],
  ];
  for (const [pattern, extractor] of patterns) {
    const match = text.match(pattern);
    if (match) {
      return typeof extractor === 'function' ? extractor() : match[extractor] + (match[extractor].endsWith('군') ? '' : '군');
    }
  }
  const trimmed = text.trim();
  return ['가군', '나군', '다군'].includes(trimmed) ? trimmed : null;
}

function extractAdmissionType(text) {
  if (!text) return '정시';
  return text.replace(/\s*경쟁률\s*현황\s*$/, '').replace(/「[가나다]」군\s*/g, '')
    .replace(/\[[가나다]군\]\s*/g, '').replace(/^[가나다]군\s*/g, '').trim() || '정시';
}

function parseNumber(text) {
  if (!text) return 0;
  const cleaned = text.toString().trim().replace(/[\s,]/g, '').replace(/[^\d.-]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

function parseRate(text) {
  if (!text) return 0;
  const cleaned = text.toString().trim().replace(/[\s,]/g, '').replace(/:1$/i, '');
  const match = cleaned.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

// ==================== 기본 파서 (v8 기반) ====================

function findColumnsByHeaderText(headerTexts) {
  const result = { department: -1, recruitment: -1, application: -1, rate: -1, group: -1 };
  headerTexts.forEach((h, idx) => {
    const text = h.toLowerCase();
    if (result.department === -1 && (text.includes('모집단위') || text.includes('학과') || text.includes('전공') || text.includes('학부'))) result.department = idx;
    if (result.recruitment === -1 && text.includes('모집인원')) result.recruitment = idx;
    if (result.application === -1 && text.includes('지원인원')) result.application = idx;
    if (result.rate === -1 && text.includes('경쟁률')) result.rate = idx;
    if (result.group === -1 && (text === '군' || text === '모집군')) result.group = idx;
  });
  return result;
}

function parseTableStandard($, table, universityName, defaultGroup, defaultAdmissionType) {
  const results = [];
  const headerCells = $(table).find('th');
  const headerTexts = headerCells.map((_, th) => $(th).text().trim()).get();

  const hasDataColumns = headerTexts.some(h => h.includes('모집단위') || h.includes('학과') || h.includes('전공') || h.includes('학부'));
  if (!hasDataColumns && headerTexts.length > 0) return { results: [], errors: [] };

  const hasCollegeColumn = headerTexts.some(h => h === '대학' || h === '단과대학' || h === '캠퍼스' || h === '계열');
  let columns = findColumnsByHeaderText(headerTexts);

  if (columns.department === -1 || columns.recruitment === -1) {
    columns = {
      department: columns.department !== -1 ? columns.department : (hasCollegeColumn ? 1 : 0),
      recruitment: columns.recruitment !== -1 ? columns.recruitment : (hasCollegeColumn ? 2 : 1),
      application: columns.application !== -1 ? columns.application : (hasCollegeColumn ? 3 : 2),
      rate: columns.rate !== -1 ? columns.rate : (hasCollegeColumn ? 4 : 3),
      group: columns.group,
    };
  }

  $(table).find('tr').each((rowIdx, row) => {
    const cells = $(row).find('td');
    if (cells.length < 3) return;

    const expectedCols = Math.max(columns.department, columns.recruitment, columns.application, columns.rate) + 1;
    const actualCols = cells.length;
    const cellOffset = Math.max(0, Math.min(3, expectedCols - actualCols));

    const adjustedIdx = {
      department: Math.max(0, columns.department - cellOffset),
      recruitment: Math.max(0, columns.recruitment - cellOffset),
      application: Math.max(0, columns.application - cellOffset),
      rate: Math.max(0, columns.rate - cellOffset),
      group: columns.group !== -1 ? Math.max(0, columns.group - cellOffset) : -1,
    };

    const departmentName = $(cells[adjustedIdx.department])?.text().trim();
    if (!departmentName) return;
    const skipPatterns = ['총계', '합계', '소계', '-', '대학', '모집단위', '모집인원'];
    if (skipPatterns.includes(departmentName) || /^\d+$/.test(departmentName)) return;

    let rowGroup = defaultGroup;
    if (adjustedIdx.group !== -1 && cells.length > adjustedIdx.group) {
      const groupText = $(cells[adjustedIdx.group]).text().trim();
      const parsed = extractGroupFromText(groupText);
      if (parsed) rowGroup = parsed;
    }
    if (rowGroup === '-') {
      const firstCellText = $(cells[0]).text().trim();
      const parsed = extractGroupFromText(firstCellText);
      if (parsed) rowGroup = parsed;
    }

    const recruitmentCount = parseNumber($(cells[adjustedIdx.recruitment])?.text());
    const applicationCount = parseNumber($(cells[adjustedIdx.application])?.text());
    const competitionRate = parseRate($(cells[adjustedIdx.rate])?.text());

    if (recruitmentCount === 0 && applicationCount === 0) return;

    results.push({
      대학명: cleanUniversityName(universityName),
      군: rowGroup,
      전형명: defaultAdmissionType,
      모집단위: departmentName,
      모집인원: recruitmentCount,
      지원인원: applicationCount,
      경쟁률: competitionRate || (recruitmentCount > 0 ? parseFloat((applicationCount / recruitmentCount).toFixed(2)) : 0),
      경쟁률_문자열: competitionRate > 0 ? `${competitionRate.toFixed(2)}:1` : '-',
    });
  });

  return { results, errors: [] };
}

// ==================== 연세대 전용 파서 (rowspan 처리) ====================

function parseYonseiTable($, table, universityName, defaultGroup, defaultAdmissionType) {
  const results = [];
  const headerCells = $(table).find('th');
  const headerTexts = headerCells.map((_, th) => $(th).text().trim()).get();

  // 연세대 특수 구조: 계열 | 모집단위 | 모집인원 | 지원인원 | 경쟁률
  // 계열은 rowspan으로 여러 행에 걸쳐있고, 모집인원도 계열 전체에 대한 값
  const columns = findColumnsByHeaderText(headerTexts);

  let currentRecruitment = 0;
  let rowsUntilNewRecruitment = 0;

  $(table).find('tr').each((rowIdx, row) => {
    const cells = $(row).find('td');
    if (cells.length < 2) return;

    // 셀 개수에 따른 처리
    const actualCols = cells.length;

    // rowspan 셀이 있는 행 (전체 컬럼이 있는 행)
    if (actualCols >= 5) {
      // 모집인원 컬럼의 rowspan 확인
      const recruitmentCell = cells.eq(2); // 모집인원은 보통 3번째 컬럼
      const rowspan = parseInt(recruitmentCell.attr('rowspan')) || 1;
      currentRecruitment = parseNumber(recruitmentCell.text());
      rowsUntilNewRecruitment = rowspan - 1;

      // 이 행의 데이터 처리
      const departmentName = $(cells[1])?.text().trim();
      const applicationCount = parseNumber($(cells[3])?.text());
      const competitionRate = parseRate($(cells[4])?.text());

      if (departmentName && !['총계', '합계', '소계'].includes(departmentName)) {
        results.push({
          대학명: cleanUniversityName(universityName),
          군: defaultGroup,
          전형명: defaultAdmissionType,
          모집단위: departmentName,
          모집인원: currentRecruitment,
          지원인원: applicationCount,
          경쟁률: competitionRate || (currentRecruitment > 0 && applicationCount > 0 ? parseFloat((applicationCount / currentRecruitment).toFixed(2)) : 0),
          경쟁률_문자열: competitionRate > 0 ? `${competitionRate.toFixed(2)}:1` : '-',
        });
      }
    } else if (actualCols >= 3 && rowsUntilNewRecruitment > 0) {
      // rowspan에 의해 모집인원이 생략된 행
      // 모집단위 | 지원인원 | 경쟁률
      const departmentName = $(cells[0])?.text().trim();
      const applicationCount = parseNumber($(cells[1])?.text());
      const competitionRate = parseRate($(cells[2])?.text());

      if (departmentName && !['총계', '합계', '소계'].includes(departmentName)) {
        results.push({
          대학명: cleanUniversityName(universityName),
          군: defaultGroup,
          전형명: defaultAdmissionType,
          모집단위: departmentName,
          모집인원: currentRecruitment, // 상속받은 모집인원 사용
          지원인원: applicationCount,
          경쟁률: competitionRate || (currentRecruitment > 0 && applicationCount > 0 ? parseFloat((applicationCount / currentRecruitment).toFixed(2)) : 0),
          경쟁률_문자열: competitionRate > 0 ? `${competitionRate.toFixed(2)}:1` : '-',
        });
      }
      rowsUntilNewRecruitment--;
    }
  });

  return { results, errors: [] };
}

// ==================== 대구대 전용 파서 (가로형 테이블) ====================

function parseDaeguTable($, table, universityName, defaultAdmissionType) {
  const results = [];

  // 대구대 구조: 가/나/다군이 가로로 배치
  // 대학 | 학과 | 가군(모집/지원/경쟁률) | 나군(모집/지원/경쟁률) | 다군(모집/지원/경쟁률)
  const headerRow = $(table).find('tr').first();
  const headerCells = headerRow.find('th, td');
  const headerTexts = headerCells.map((_, cell) => $(cell).text().trim()).get();

  // 군별 시작 인덱스 찾기
  const groupIndices = { '가군': -1, '나군': -1, '다군': -1 };
  headerTexts.forEach((text, idx) => {
    if (text.includes('가') && text.includes('군')) groupIndices['가군'] = idx;
    else if (text.includes('나') && text.includes('군')) groupIndices['나군'] = idx;
    else if (text.includes('다') && text.includes('군')) groupIndices['다군'] = idx;
  });

  // 모집단위 컬럼 찾기
  let deptColIdx = headerTexts.findIndex(h => h.includes('모집단위') || h.includes('학과'));
  if (deptColIdx === -1) deptColIdx = 1;

  $(table).find('tr').slice(1).each((rowIdx, row) => {
    const cells = $(row).find('td');
    if (cells.length < 4) return;

    const departmentName = $(cells[deptColIdx])?.text().trim();
    if (!departmentName || ['총계', '합계', '소계', '-'].includes(departmentName)) return;

    // 각 군별 데이터 추출
    for (const [group, startIdx] of Object.entries(groupIndices)) {
      if (startIdx === -1) continue;

      const baseIdx = startIdx - 2; // 헤더와 데이터 행의 offset 조정
      if (baseIdx < 0 || baseIdx >= cells.length) continue;

      const recruitmentCount = parseNumber($(cells[baseIdx])?.text());
      const applicationCount = parseNumber($(cells[baseIdx + 1])?.text());
      const competitionRate = parseRate($(cells[baseIdx + 2])?.text());

      if (recruitmentCount > 0 || applicationCount > 0) {
        results.push({
          대학명: cleanUniversityName(universityName),
          군: group,
          전형명: defaultAdmissionType,
          모집단위: departmentName,
          모집인원: recruitmentCount,
          지원인원: applicationCount,
          경쟁률: competitionRate || (recruitmentCount > 0 ? parseFloat((applicationCount / recruitmentCount).toFixed(2)) : 0),
          경쟁률_문자열: competitionRate > 0 ? `${competitionRate.toFixed(2)}:1` : '-',
        });
      }
    }
  });

  return { results, errors: [] };
}

// ==================== 숭실대/경성대/한국체육대 전용 파서 ====================

function parseRowspanTable($, table, universityName, defaultGroup, defaultAdmissionType) {
  const results = [];
  const headerCells = $(table).find('th');
  const headerTexts = headerCells.map((_, th) => $(th).text().trim()).get();

  const columns = findColumnsByHeaderText(headerTexts);
  const hasCollegeColumn = headerTexts.some(h => h === '대학' || h === '단과대학' || h === '캠퍼스' || h === '계열');

  if (columns.department === -1) columns.department = hasCollegeColumn ? 1 : 0;
  if (columns.recruitment === -1) columns.recruitment = hasCollegeColumn ? 2 : 1;
  if (columns.application === -1) columns.application = hasCollegeColumn ? 3 : 2;
  if (columns.rate === -1) columns.rate = hasCollegeColumn ? 4 : 3;

  // rowspan 추적
  let lastRecruitment = 0;
  let recruitmentRowspan = 0;

  $(table).find('tr').each((rowIdx, row) => {
    const cells = $(row).find('td');
    if (cells.length < 3) return;

    const actualCols = cells.length;
    const expectedCols = Math.max(columns.department, columns.recruitment, columns.application, columns.rate) + 1;
    const cellOffset = Math.max(0, Math.min(4, expectedCols - actualCols));

    let recruitmentCount = 0;
    let departmentIdx = Math.max(0, columns.department - cellOffset);
    let recruitmentIdx = Math.max(0, columns.recruitment - cellOffset);
    let applicationIdx = Math.max(0, columns.application - cellOffset);
    let rateIdx = Math.max(0, columns.rate - cellOffset);

    // rowspan 처리
    if (cellOffset > 0 && recruitmentRowspan > 0) {
      // 셀이 생략된 경우 - 이전 모집인원 사용
      recruitmentCount = lastRecruitment;
      recruitmentRowspan--;
    } else {
      // 일반적인 경우
      const recruitmentCell = cells.eq(recruitmentIdx);
      const rowspan = parseInt(recruitmentCell.attr('rowspan')) || 1;
      recruitmentCount = parseNumber(recruitmentCell.text());

      if (rowspan > 1) {
        lastRecruitment = recruitmentCount;
        recruitmentRowspan = rowspan - 1;
      }
    }

    const departmentName = $(cells[departmentIdx])?.text().trim();
    if (!departmentName || ['총계', '합계', '소계', '-'].includes(departmentName)) return;
    if (/^\d+$/.test(departmentName)) return;

    let rowGroup = defaultGroup;
    if (columns.group !== -1) {
      const groupIdx = Math.max(0, columns.group - cellOffset);
      if (groupIdx < cells.length) {
        const parsed = extractGroupFromText($(cells[groupIdx]).text().trim());
        if (parsed) rowGroup = parsed;
      }
    }

    const applicationCount = parseNumber($(cells[applicationIdx])?.text());
    const competitionRate = parseRate($(cells[rateIdx])?.text());

    if (recruitmentCount === 0 && applicationCount === 0) return;

    results.push({
      대학명: cleanUniversityName(universityName),
      군: rowGroup,
      전형명: defaultAdmissionType,
      모집단위: departmentName,
      모집인원: recruitmentCount,
      지원인원: applicationCount,
      경쟁률: competitionRate || (recruitmentCount > 0 ? parseFloat((applicationCount / recruitmentCount).toFixed(2)) : 0),
      경쟁률_문자열: competitionRate > 0 ? `${competitionRate.toFixed(2)}:1` : '-',
    });
  });

  return { results, errors: [] };
}

// ==================== 단일 대학 크롤링 ====================

async function crawlUniversity(univ, retryCount = 0) {
  const universityName = cleanUniversityName(univ.universityName);
  const isSpecialUniv = SPECIAL_PARSER_UNIVS.includes(universityName);

  try {
    const response = await axios.get(univ.dataLink, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: CONFIG.REQUEST_TIMEOUT,
      responseType: 'arraybuffer',
      decompress: true,
    });

    const { html, encoding } = smartDecode(response.data, response.headers['content-type'] || '');
    const $ = cheerio.load(html);
    const allResults = [];
    const allErrors = [];

    $('table').each((tableIdx, table) => {
      let group = '-';
      let admissionType = '정시';

      const caption = $(table).find('caption').text().trim();
      if (caption) {
        const g = extractGroupFromText(caption);
        if (g) group = g;
        admissionType = extractAdmissionType(caption);
      }

      if (group === '-') {
        $(table).prevAll('h2, h3, h4, div, p').slice(0, 10).each((_, el) => {
          if (group !== '-') return;
          const text = $(el).text().trim().substring(0, 200);
          const g = extractGroupFromText(text);
          if (g) { group = g; admissionType = extractAdmissionType(text); return false; }
        });
      }

      // 요약 테이블 스킵
      const headerText = caption || $(table).prev().text();
      if ((headerText.includes('전체') || headerText.includes('전형별')) && headerText.includes('경쟁률')) return;

      // 파서 선택
      let parseResult;
      if (universityName === '연세대학교(서울)') {
        parseResult = parseYonseiTable($, table, universityName, group, admissionType);
      } else if (universityName === '대구대학교') {
        parseResult = parseDaeguTable($, table, universityName, admissionType);
      } else if (['숭실대학교', '경성대학교', '한국체육대학교'].includes(universityName)) {
        parseResult = parseRowspanTable($, table, universityName, group, admissionType);
      } else {
        parseResult = parseTableStandard($, table, universityName, group, admissionType);
      }

      allResults.push(...parseResult.results);
      allErrors.push(...parseResult.errors);
    });

    return { success: true, universityName, data: allResults, errors: allErrors, encoding };

  } catch (error) {
    if (retryCount < CONFIG.RETRY_COUNT) {
      await new Promise(r => setTimeout(r, CONFIG.RETRY_DELAY * (retryCount + 1)));
      return crawlUniversity(univ, retryCount + 1);
    }
    return { success: false, universityName, data: [], errors: [{ university: universityName, issue: 'NETWORK_ERROR', message: error.message }] };
  }
}

async function processBatch(batch) {
  return Promise.all(batch.map(univ => crawlUniversity(univ)));
}

function saveToExcel(data, filename, sheetName = '최종경쟁률') {
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{ wch: 25 }, { wch: 8 }, { wch: 45 }, { wch: 35 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
  console.log(`\n✅ 저장 완료: ${filename}`);
}

function saveErrorLog(errors, filename) {
  if (errors.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(errors.map(e => ({ 대학명: e.university, 문제유형: e.issue, 상세: JSON.stringify(e) })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '에러로그');
  XLSX.writeFile(wb, filename);
  console.log(`⚠️ 에러 로그 저장: ${filename}`);
}

// ==================== 메인 실행 ====================

async function main() {
  const startTime = new Date();
  const dateStr = `${startTime.getFullYear()}${String(startTime.getMonth() + 1).padStart(2, '0')}${String(startTime.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(startTime.getHours()).padStart(2, '0')}${String(startTime.getMinutes()).padStart(2, '0')}`;

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   정시 경쟁률 크롤러 v10 - 특수 대학 전용 파서 적용          ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║ 시작: ${startTime.toLocaleString('ko-KR').padEnd(52)}║`);
  console.log(`║ 대상: ${universities.length}개 대학 (병렬 ${CONFIG.CONCURRENCY}개)`.padEnd(63) + '║');
  console.log(`║ 특수 처리: ${SPECIAL_PARSER_UNIVS.slice(0, 3).join(', ')}...`.padEnd(63) + '║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const allData = [];
  const allErrors = [];
  let successCount = 0, failCount = 0;

  const batches = [];
  for (let i = 0; i < universities.length; i += CONFIG.CONCURRENCY) {
    batches.push(universities.slice(i, i + CONFIG.CONCURRENCY));
  }

  let processedCount = 0;
  for (const batch of batches) {
    const results = await processBatch(batch);

    for (const result of results) {
      processedCount++;
      const progress = Math.round((processedCount / universities.length) * 100);

      if (result.success && result.data.length > 0) {
        const zeroRecruitment = result.data.filter(d => d.모집인원 === 0).length;
        let status = `✓ ${result.data.length}건`;
        if (zeroRecruitment > 0) status += ` (⚠ ${zeroRecruitment}건 모집인원0)`;
        console.log(`[${progress}%] ${result.universityName}: ${status}`);
        allData.push(...result.data);
        successCount++;
      } else if (result.success) {
        console.log(`[${progress}%] ${result.universityName}: ⚠️ 데이터 없음`);
        failCount++;
      } else {
        console.log(`[${progress}%] ${result.universityName}: ❌ 실패`);
        failCount++;
      }
      allErrors.push(...result.errors);
    }
    await new Promise(r => setTimeout(r, CONFIG.DELAY_BETWEEN_BATCHES));
  }

  // 서울대학교 추가
  console.log('\n[서울대학교] 수동 데이터 추가...');
  allData.push(...snuData.map(d => ({ ...d, 경쟁률_문자열: `${d.경쟁률.toFixed(2)}:1` })));
  successCount++;
  console.log(`  ✓ ${snuData.length}개 추가 완료`);

  const endTime = new Date();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(1);

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        크롤링 완료                           ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║ 성공: ${successCount}개 대학, 실패: ${failCount}개`.padEnd(63) + '║');
  console.log(`║ 총 데이터: ${allData.length}건, 소요: ${elapsedSeconds}초`.padEnd(63) + '║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  // 통계
  const groupStats = {};
  allData.forEach(d => { groupStats[d.군] = (groupStats[d.군] || 0) + 1; });
  console.log('\n군별 데이터:');
  Object.entries(groupStats).sort().forEach(([g, c]) => console.log(`  ${g}: ${c}건`));

  const zeroRecruitment = allData.filter(d => d.모집인원 === 0);
  if (zeroRecruitment.length > 0) {
    console.log(`\n⚠️ 모집인원 0인 데이터: ${zeroRecruitment.length}건`);
    const byUniv = {};
    zeroRecruitment.forEach(d => { byUniv[d.대학명] = (byUniv[d.대학명] || 0) + 1; });
    Object.entries(byUniv).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([name, count]) => console.log(`  - ${name}: ${count}건`));
  }

  // 저장
  const outputDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  saveToExcel(allData, path.join(outputDir, `최종경쟁률_v10_${dateStr}_${timeStr}.xlsx`));

  const summaryData = [];
  const univGroups = {};
  allData.forEach(d => {
    if (!univGroups[d.대학명]) univGroups[d.대학명] = { 가군: 0, 나군: 0, 다군: 0, 미확인: 0, 전체: 0, 총모집: 0, 총지원: 0 };
    const s = univGroups[d.대학명];
    s.전체++; s.총모집 += d.모집인원; s.총지원 += d.지원인원;
    if (d.군 === '가군') s.가군++; else if (d.군 === '나군') s.나군++; else if (d.군 === '다군') s.다군++; else s.미확인++;
  });
  Object.entries(univGroups).forEach(([name, s]) => {
    summaryData.push({ 대학명: name, 가군: s.가군, 나군: s.나군, 다군: s.다군, 미확인: s.미확인, 전체학과: s.전체, 총모집인원: s.총모집, 총지원인원: s.총지원, 평균경쟁률: s.총모집 > 0 ? (s.총지원 / s.총모집).toFixed(2) : '-' });
  });
  saveToExcel(summaryData, path.join(outputDir, `최종경쟁률_요약_v10_${dateStr}_${timeStr}.xlsx`), '대학별요약');

  if (CONFIG.LOG_ERRORS_TO_FILE && allErrors.length > 0) {
    saveErrorLog(allErrors, path.join(outputDir, `크롤링에러_v10_${dateStr}_${timeStr}.xlsx`));
  }

  console.log(`\n종료: ${endTime.toLocaleString('ko-KR')}`);
  console.log(`속도: ${(universities.length / (elapsedSeconds / 60)).toFixed(1)} 대학/분`);
}

main().catch(console.error);
