/**
 * 모든 대학 최종 경쟁률 엑셀 크롤링 스크립트 v5
 * - v4의 모든 기능 포함
 * - 신라대: "모집군" 컬럼에서 직접 군 정보 추출 (rowspan 고려)
 * - 고신대: DIV 앞 요소 텍스트 파싱 개선
 * - 국립공주대: 학생부종합 전형 처리 (정시가 아닌 전형)
 * - 중원대: 군 정보 없음 확인
 *
 * 사용법: node crawl-final-rates-to-excel-v5.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const XLSX = require('xlsx');
const path = require('path');

// 크롤링 대상 대학 목록
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

function cleanUniversityName(name) {
  return name.replace(' 정시', '').trim();
}

/**
 * 다양한 패턴에서 군 정보 추출 (v5 개선)
 */
function extractGroupFromText(text) {
  if (!text) return null;

  // 패턴 1: 「가」군, 「나」군, 「다」군
  const pattern1 = text.match(/「([가나다])」군/);
  if (pattern1) return pattern1[1] + '군';

  // 패턴 2: [가군], [나군], [다군]
  const pattern2 = text.match(/\[([가나다])군\]/);
  if (pattern2) return pattern2[1] + '군';

  // 패턴 3: (가군), (나군), (다군)
  const pattern3 = text.match(/\(([가나다])군\)/);
  if (pattern3) return pattern3[1] + '군';

  // 패턴 4: 앞쪽에 가군, 나군, 다군 (띄어쓰기 후)
  const pattern4 = text.match(/^([가나다]군)\s/);
  if (pattern4) return pattern4[1];

  // 패턴 5: 캠퍼스명 뒤 가군, 나군, 다군
  const pattern5 = text.match(/캠퍼스\s+([가나다]군)/);
  if (pattern5) return pattern5[1];

  // 패턴 6: ㉯군, ㉰군 (원문자 - 홍익대)
  if (text.includes('㉮군')) return '가군';
  if (text.includes('㉯군')) return '나군';
  if (text.includes('㉰군')) return '다군';

  // 패턴 7: 정시 ㉯군, 정시 ㉰군
  if (text.includes('정시 ㉮')) return '가군';
  if (text.includes('정시 ㉯')) return '나군';
  if (text.includes('정시 ㉰')) return '다군';

  // 패턴 8: "가군  " 형태 (띄어쓰기 2개 - 동신대학교)
  const pattern8 = text.match(/^([가나다]군)\s{2,}/);
  if (pattern8) return pattern8[1];

  // 패턴 9: 단독 가군/나군/다군 (정확히 일치)
  if (text.trim() === '가군' || text.trim() === '나군' || text.trim() === '다군') {
    return text.trim();
  }

  // 패턴 10: "나군 정원내" 또는 "다군 정원내" 형태 (고신대)
  const pattern10 = text.match(/^([가나다]군)\s*(정원내|정원외)/);
  if (pattern10) return pattern10[1];

  // 패턴 11: 일반 가군, 나군, 다군 (중간에)
  const pattern11 = text.match(/([가나다])군/);
  if (pattern11) return pattern11[1] + '군';

  return null;
}

/**
 * 전형명 추출 (군 정보 제거 후)
 */
function extractAdmissionType(text) {
  if (!text) return '정시';

  let cleaned = text.replace(/\s*경쟁률\s*현황\s*$/, '').trim();
  cleaned = cleaned.replace(/\s*\[☞.*\]/, '').trim();

  cleaned = cleaned
    .replace(/「[가나다]」군\s*/g, '')
    .replace(/\[[가나다]군\]\s*/g, '')
    .replace(/\([가나다]군\)\s*/g, '')
    .replace(/^[가나다]군\s*/g, '')
    .replace(/㉮군\s*/g, '')
    .replace(/㉯군\s*/g, '')
    .replace(/㉰군\s*/g, '')
    .replace(/정시\s*㉮\s*/g, '')
    .replace(/정시\s*㉯\s*/g, '')
    .replace(/정시\s*㉰\s*/g, '')
    .replace(/가\/나\/다군\s*/g, '')
    .replace(/^[가나다]군\s{2,}/g, '');

  cleaned = cleaned
    .replace(/^(서울캠퍼스|세종캠퍼스|글로컬캠퍼스|국제캠퍼스|죽전캠퍼스|천안캠퍼스)\s*/g, '')
    .trim();

  return cleaned || '정시';
}

/**
 * 진학어플라이/유웨이 경쟁률 페이지 파싱 (v5 개선)
 */
async function crawlApplicationRates(url, universityName) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 30000,
      responseType: 'arraybuffer',
    });

    const contentType = response.headers['content-type'] || '';
    let html;
    if (contentType.includes('euc-kr') || contentType.includes('euc_kr')) {
      html = iconv.decode(response.data, 'euc-kr');
    } else {
      html = iconv.decode(response.data, 'utf-8');
      if (html.includes('�') || html.includes('\ufffd')) {
        html = iconv.decode(response.data, 'euc-kr');
      }
    }

    const $ = cheerio.load(html);
    const results = [];

    $('table').each((tableIdx, table) => {
      let headerText = '';
      let group = '-';
      let admissionType = '정시';

      // 테이블 헤더 분석
      const headerCells = $(table).find('th');
      const headerTexts = headerCells.map((_, th) => $(th).text().trim()).get();

      // 데이터가 있는 테이블인지 확인
      const hasDataColumns = headerTexts.some(h =>
        h.includes('모집단위') || h.includes('학과') || h.includes('전공')
      );
      if (!hasDataColumns && headerTexts.length > 0) return;

      // v5: "군" 또는 "모집군" 컬럼 인덱스 찾기
      const groupColumnIdx = headerTexts.findIndex(h => h === '군' || h === '모집군');

      // 1. caption에서 찾기
      const caption = $(table).find('caption').text().trim();
      if (caption) {
        const captionGroup = extractGroupFromText(caption);
        if (captionGroup) {
          group = captionGroup;
          admissionType = extractAdmissionType(caption);
          headerText = caption;
        }
      }

      // 2. 부모 DIV의 헤더에서 찾기 (v5 개선: 더 넓은 범위 탐색)
      if (group === '-') {
        const parent = $(table).parent();
        const parentHeader = parent.find('h2, h3, h4, .tit, .title, .both11').first().text().trim();
        if (parentHeader) {
          const parentGroup = extractGroupFromText(parentHeader);
          if (parentGroup) {
            group = parentGroup;
            admissionType = extractAdmissionType(parentHeader);
            headerText = parentHeader;
          }
        }
      }

      // 3. 바로 앞 형제 요소에서 찾기 (v5 개선: DIV 텍스트 더 정확하게 탐색)
      if (group === '-') {
        const prevElements = $(table).prevAll('h2, h3, h4, div, p').slice(0, 10);
        prevElements.each((_, el) => {
          if (group !== '-') return;

          let text = $(el).clone().children('table').remove().end().text().trim();
          // 긴 텍스트는 앞부분만 확인
          if (text.length > 200) text = text.substring(0, 200);

          const prevGroup = extractGroupFromText(text);
          if (prevGroup) {
            group = prevGroup;
            admissionType = extractAdmissionType(text);
            headerText = text;
            return false;
          }
        });
      }

      // "전체 경쟁률" 또는 "전형별 경쟁률" 테이블은 스킵
      if (headerText.includes('전체') && headerText.includes('경쟁률')) return;
      if (headerText.includes('전형별') && headerText.includes('경쟁률') && !headerText.match(/[가나다]군/)) return;

      // 컬럼 인덱스 결정
      let departmentIdx = headerTexts.findIndex(h => h.includes('모집단위') || h.includes('학과'));
      if (departmentIdx === -1) departmentIdx = 0;

      let recruitmentIdx = headerTexts.findIndex(h => h === '모집인원');
      if (recruitmentIdx === -1) recruitmentIdx = departmentIdx + 1;

      let applicationIdx = headerTexts.findIndex(h => h === '지원인원');
      if (applicationIdx === -1) applicationIdx = recruitmentIdx + 1;

      let rateIdx = headerTexts.findIndex(h => h === '경쟁률');
      if (rateIdx === -1) rateIdx = applicationIdx + 1;

      // 테이블 데이터 파싱
      $(table).find('tr').each((rowIdx, row) => {
        const cells = $(row).find('td');
        if (cells.length < 3) return;

        // v5: 동적으로 컬럼 인덱스 조정 (rowspan으로 인한 밀림 보정)
        let actualDepartmentIdx = departmentIdx;
        let actualGroupColumnIdx = groupColumnIdx;
        let actualRecruitmentIdx = recruitmentIdx;
        let actualApplicationIdx = applicationIdx;
        let actualRateIdx = rateIdx;

        // 첫 번째 셀이 대학명이면 인덱스 조정
        const firstCellText = $(cells[0]).text().trim();
        if (firstCellText.includes('대학') && !firstCellText.includes('학과') && cells.length > 5) {
          // 대학 컬럼이 있는 경우 - 신라대처럼 rowspan 사용
          if (actualDepartmentIdx === 0) actualDepartmentIdx = 1;
          if (actualGroupColumnIdx > 0) actualGroupColumnIdx = actualGroupColumnIdx;
        }

        let departmentName = $(cells[actualDepartmentIdx])?.text().trim();

        // 총계/합계/소계 행은 건너뛰기
        if (!departmentName) return;
        if (['총계', '합계', '소계', '합 계', '총 계', '-'].includes(departmentName)) return;
        if (departmentName === '대학' || departmentName === '모집단위' || departmentName === '모집인원') return;

        // v5: "군" 컬럼에서 군 정보 추출
        let rowGroup = group;
        if (groupColumnIdx !== -1) {
          // rowspan으로 인해 셀 수가 다를 수 있음
          const expectedGroupIdx = groupColumnIdx;
          // 헤더 기준 인덱스와 실제 셀 인덱스의 차이 계산
          const cellOffset = headerTexts.length - cells.length;
          const adjustedGroupIdx = Math.max(0, expectedGroupIdx - Math.max(0, cellOffset));

          if (cells.length > adjustedGroupIdx) {
            const cellGroup = $(cells[adjustedGroupIdx]).text().trim();
            if (cellGroup && cellGroup.match(/^[가나다]군$/)) {
              rowGroup = cellGroup;
            }
          }
        }

        // 첫번째 열에서 군 정보가 포함된 경우
        if (rowGroup === '-') {
          const firstCellGroup = extractGroupFromText(firstCellText);
          if (firstCellGroup && firstCellText.match(/^[가나다]군/)) {
            rowGroup = firstCellGroup;
          }
        }

        // 모집인원/지원인원/경쟁률 추출
        const cellOffset = headerTexts.length - cells.length;
        const adjRecruitmentIdx = Math.max(0, actualRecruitmentIdx - Math.max(0, cellOffset));
        const adjApplicationIdx = Math.max(0, actualApplicationIdx - Math.max(0, cellOffset));
        const adjRateIdx = Math.max(0, actualRateIdx - Math.max(0, cellOffset));

        const recruitmentText = $(cells[adjRecruitmentIdx])?.text().trim().replace(/,/g, '').replace(/이내/g, '') || '0';
        const applicationText = $(cells[adjApplicationIdx])?.text().trim().replace(/,/g, '') || '0';
        let rateText = $(cells[adjRateIdx])?.text().trim() || '0';

        rateText = rateText.replace(/\s/g, '').replace(',', '');
        const rateMatch = rateText.match(/(\d+\.?\d*)/);
        const competitionRate = rateMatch ? parseFloat(rateMatch[1]) : 0;

        const recruitmentCount = parseInt(recruitmentText, 10) || 0;
        const applicationCount = parseInt(applicationText, 10) || 0;

        if (departmentName && (recruitmentCount > 0 || applicationCount > 0)) {
          results.push({
            대학명: cleanUniversityName(universityName),
            군: rowGroup,
            전형명: admissionType,
            모집단위: departmentName,
            모집인원: recruitmentCount,
            지원인원: applicationCount,
            경쟁률: competitionRate,
            경쟁률_문자열: competitionRate > 0 ? `${competitionRate.toFixed(2)}:1` : '-',
          });
        }
      });
    });

    return results;
  } catch (error) {
    console.error(`  ❌ 크롤링 실패 (${cleanUniversityName(universityName)}): ${error.message}`);
    return [];
  }
}

function saveToExcel(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 8 },
    { wch: 45 },
    { wch: 35 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '최종경쟁률');
  XLSX.writeFile(wb, filename);
  console.log(`\n✅ 엑셀 파일 저장 완료: ${filename}`);
}

async function main() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  console.log('===== 모든 대학 최종 경쟁률 크롤링 v5 (군 컬럼 파싱 개선) =====');
  console.log(`시작 시간: ${now.toLocaleString('ko-KR')}`);
  console.log(`대상 대학: ${universities.length}개 + 서울대학교`);
  console.log('');

  const allData = [];
  let successCount = 0;
  let failCount = 0;
  let totalDepartments = 0;

  for (let i = 0; i < universities.length; i++) {
    const univ = universities[i];
    const universityName = cleanUniversityName(univ.universityName);

    console.log(`[${i + 1}/${universities.length}] ${universityName} 크롤링 중...`);

    if (!univ.dataLink.includes('jinhakapply.com') && !univ.dataLink.includes('uwayapply.com')) {
      console.log(`  ⚠️ 스킵 (지원되지 않는 URL 형식)`);
      failCount++;
      continue;
    }

    try {
      const rateData = await crawlApplicationRates(univ.dataLink, univ.universityName);

      if (rateData.length === 0) {
        console.log(`  ⚠️ 데이터 없음`);
        failCount++;
      } else {
        const withGroup = rateData.filter(d => d.군 !== '-').length;
        const withoutGroup = rateData.filter(d => d.군 === '-').length;
        console.log(`  ✓ ${rateData.length}개 (군정보: ${withGroup}개, 미확인: ${withoutGroup}개)`);
        allData.push(...rateData);
        successCount++;
        totalDepartments += rateData.length;
      }

      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.log(`  ❌ 에러: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n[서울대학교] 수동 데이터 추가 중...`);
  const snuFormatted = snuData.map(d => ({
    ...d,
    경쟁률_문자열: d.경쟁률 > 0 ? `${d.경쟁률.toFixed(2)}:1` : '-',
  }));
  allData.push(...snuFormatted);
  successCount++;
  totalDepartments += snuData.length;
  console.log(`  ✓ ${snuData.length}개 추가 (모두 나군)`);

  console.log('');
  console.log('===== 크롤링 완료 =====');
  console.log(`성공: ${successCount}개 대학`);
  console.log(`실패/데이터없음: ${failCount}개 대학`);
  console.log(`총 학과 데이터: ${totalDepartments}건`);

  const groupStats = {};
  allData.forEach(d => {
    groupStats[d.군] = (groupStats[d.군] || 0) + 1;
  });
  console.log('\n군별 데이터 현황:');
  Object.entries(groupStats).sort().forEach(([g, c]) => {
    console.log(`  ${g}: ${c}건`);
  });

  const filename = path.join(__dirname, `최종경쟁률_전체대학_v5_${dateStr}_${timeStr}.xlsx`);
  saveToExcel(allData, filename);

  const summaryData = [];
  const univGroups = {};
  allData.forEach(d => {
    if (!univGroups[d.대학명]) {
      univGroups[d.대학명] = { 가군: 0, 나군: 0, 다군: 0, 미확인: 0, 전체: 0 };
    }
    univGroups[d.대학명].전체++;
    if (d.군 === '가군') univGroups[d.대학명].가군++;
    else if (d.군 === '나군') univGroups[d.대학명].나군++;
    else if (d.군 === '다군') univGroups[d.대학명].다군++;
    else univGroups[d.대학명].미확인++;
  });

  Object.entries(univGroups).forEach(([name, stats]) => {
    summaryData.push({
      대학명: name,
      가군: stats.가군,
      나군: stats.나군,
      다군: stats.다군,
      미확인: stats.미확인,
      전체: stats.전체,
    });
  });

  const summaryFilename = path.join(__dirname, `최종경쟁률_대학별요약_v5_${dateStr}_${timeStr}.xlsx`);
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  const summaryWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(summaryWb, summaryWs, '대학별요약');
  XLSX.writeFile(summaryWb, summaryFilename);
  console.log(`✅ 대학별 요약 파일 저장 완료: ${summaryFilename}`);

  const endTime = new Date();
  console.log(`\n종료 시간: ${endTime.toLocaleString('ko-KR')}`);
  console.log(`소요 시간: ${((endTime - now) / 1000).toFixed(1)}초`);
}

main();
