/**
 * 실시간 경쟁률 관련 타입 정의
 */

// 크롤러 데이터 항목
export interface CrawlerDataEntry {
  대학명: string;
  캠퍼스: string;
  전형명: string;
  모집단위: string;
  모집인원: string | number;
  지원인원: string | number;
  경쟁률: string;
  지역?: string;
  // 추합 관련 필드
  정원?: number;
  최종경쟁률?: string;  // 현재경쟁률에서 명칭 변경
  작년추합?: number;
  예상최종경쟁?: string;
  예상실질경쟁?: string;
  예상실질경쟁값?: number;
  _matchType?: "exact" | "group" | "univ" | null;
  _chuhapMatchType?: "exact" | "group" | "univ" | null;
  // 예측 관련 필드
  예상최종경쟁값?: number;
  증가율?: string;
  _predictionType?: "exact" | "group" | "univ" | "overall";
  // 전형유형 관련 필드
  전형유형?: "일반" | "특별";
  특별전형카테고리?: string | null;
}

// 크롤러 데이터 (군별 분류)
export interface CrawlerData {
  가군: CrawlerDataEntry[];
  나군: CrawlerDataEntry[];
  다군: CrawlerDataEntry[];
}

// 군 타입
export type AdmissionGroup = "가군" | "나군" | "다군";

// 전형유형
export type AdmissionType = "전체" | "일반" | "특별";

// 특별전형 카테고리
export type SpecialAdmissionCategory =
  | "기회균등"
  | "농어촌"
  | "특성화고"
  | "지역인재"
  | "장애/특수"
  | "재외국민"
  | "성인학습"
  | "기타특별";

export const SPECIAL_ADMISSION_CATEGORIES: SpecialAdmissionCategory[] = [
  "기회균등",
  "농어촌",
  "특성화고",
  "지역인재",
  "장애/특수",
  "재외국민",
  "성인학습",
  "기타특별",
];

// 지역 목록
export const REGIONS = [
  { id: "all", name: "전국" },
  { id: "seoul", name: "서울" },
  { id: "gyeonggi", name: "경기" },
  { id: "incheon", name: "인천" },
  { id: "daejeon", name: "대전" },
  { id: "sejong", name: "세종" },
  { id: "chungnam", name: "충남" },
  { id: "chungbuk", name: "충북" },
  { id: "gwangju", name: "광주" },
  { id: "jeonnam", name: "전남" },
  { id: "jeonbuk", name: "전북" },
  { id: "daegu", name: "대구" },
  { id: "gyeongbuk", name: "경북" },
  { id: "gyeongnam", name: "경남" },
  { id: "busan", name: "부산" },
  { id: "ulsan", name: "울산" },
  { id: "gangwon", name: "강원" },
  { id: "jeju", name: "제주" },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];

// 지역 ID를 이름으로 변환
export function getRegionName(id: RegionId): string {
  const region = REGIONS.find((r) => r.id === id);
  return region ? region.name : "전국";
}

// 군별 색상
export const GROUP_COLORS = {
  가군: {
    bg: "bg-rose-100",
    text: "text-rose-600",
    border: "border-rose-400",
    gradient: "from-rose-500 to-pink-500",
  },
  나군: {
    bg: "bg-violet-100",
    text: "text-violet-600",
    border: "border-violet-400",
    gradient: "from-violet-500 to-purple-500",
  },
  다군: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    border: "border-emerald-400",
    gradient: "from-emerald-500 to-teal-500",
  },
};

// 예상실질경쟁 계산 함수
export function calcRealRate(item: CrawlerDataEntry): number {
  const 정원 = item.정원 ?? (parseInt(String(item.모집인원)) || 0);
  const 예상최종 = item.예상최종경쟁값 ?? 0;
  const 작년추합 = item.작년추합 ?? 0;
  const 분모 = 정원 + 작년추합;
  return 분모 > 0 ? (정원 * 예상최종) / 분모 : 0;
}

// 예상실질경쟁 색상
export function getRateColor(value: number): string {
  if (value <= 1) return "text-red-600 bg-red-50";
  if (value < 3) return "text-green-600 bg-green-50";
  if (value < 5) return "text-amber-600 bg-amber-50";
  return "text-rose-600 bg-rose-50";
}
