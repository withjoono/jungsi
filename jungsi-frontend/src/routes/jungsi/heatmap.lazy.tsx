import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  ArrowDown,
  Flame,
  Radio,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  Info,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/jungsi/heatmap")({
  component: UniversityHeatmap,
});

// 대학 상태 타입
type UniversityStatus = "danger" | "opportunity" | "stable" | "normal";

interface University {
  id: string;
  name: string;
  department: string;
  region: "서울" | "수도권" | "지방";
  status: UniversityStatus;
  currentRatio: number; // 현재 경쟁률
  expectedRatio: number; // 예상 최종 경쟁률
  probChange: number; // 합격확률 변화
  applicants: number; // 현재 지원자 수
  quota: number; // 모집인원
  x: number; // 지도상 x 위치 (%)
  y: number; // 지도상 y 위치 (%)
}

// 초기 대학 데이터 (한반도 지도 기준 좌표)
const initialUniversities: University[] = [
  // 서울
  { id: "snu", name: "서울대", department: "경영학과", region: "서울", status: "stable", currentRatio: 5.2, expectedRatio: 6.8, probChange: -3, applicants: 156, quota: 30, x: 35, y: 32 },
  { id: "yonsei", name: "연세대", department: "경영학과", region: "서울", status: "danger", currentRatio: 7.8, expectedRatio: 12.5, probChange: -18, applicants: 234, quota: 30, x: 33, y: 30 },
  { id: "korea", name: "고려대", department: "경영학과", region: "서울", status: "danger", currentRatio: 8.2, expectedRatio: 13.1, probChange: -22, applicants: 246, quota: 30, x: 37, y: 31 },
  { id: "skku", name: "성균관대", department: "경영학과", region: "서울", status: "opportunity", currentRatio: 4.1, expectedRatio: 5.2, probChange: 12, applicants: 123, quota: 30, x: 36, y: 33 },
  { id: "hanyang", name: "한양대", department: "AI학과", region: "서울", status: "opportunity", currentRatio: 3.8, expectedRatio: 4.5, probChange: 15, applicants: 95, quota: 25, x: 38, y: 32 },
  { id: "cau", name: "중앙대", department: "경영학과", region: "서울", status: "stable", currentRatio: 5.5, expectedRatio: 6.2, probChange: -2, applicants: 165, quota: 30, x: 34, y: 34 },
  { id: "khu", name: "경희대", department: "경영학과", region: "서울", status: "normal", currentRatio: 4.8, expectedRatio: 5.8, probChange: 0, applicants: 144, quota: 30, x: 39, y: 30 },
  { id: "hyu-erica", name: "한양대(ERICA)", department: "경영학과", region: "수도권", status: "opportunity", currentRatio: 3.2, expectedRatio: 3.8, probChange: 18, applicants: 80, quota: 25, x: 40, y: 35 },

  // 수도권
  { id: "inha", name: "인하대", department: "경영학과", region: "수도권", status: "stable", currentRatio: 4.5, expectedRatio: 5.5, probChange: -1, applicants: 135, quota: 30, x: 32, y: 35 },
  { id: "ajou", name: "아주대", department: "경영학과", region: "수도권", status: "opportunity", currentRatio: 3.5, expectedRatio: 4.2, probChange: 10, applicants: 105, quota: 30, x: 38, y: 37 },
  { id: "gachon", name: "가천대", department: "경영학과", region: "수도권", status: "normal", currentRatio: 4.2, expectedRatio: 5.0, probChange: 2, applicants: 126, quota: 30, x: 36, y: 36 },

  // 지방 - 충청
  { id: "chungnam", name: "충남대", department: "경영학과", region: "지방", status: "opportunity", currentRatio: 2.8, expectedRatio: 3.5, probChange: 20, applicants: 84, quota: 30, x: 30, y: 45 },
  { id: "kongju", name: "공주대", department: "경영학과", region: "지방", status: "opportunity", currentRatio: 2.5, expectedRatio: 3.0, probChange: 25, applicants: 75, quota: 30, x: 28, y: 48 },

  // 지방 - 호남
  { id: "chonnam", name: "전남대", department: "경영학과", region: "지방", status: "opportunity", currentRatio: 2.2, expectedRatio: 2.8, probChange: 28, applicants: 66, quota: 30, x: 22, y: 65 },
  { id: "chonbuk", name: "전북대", department: "경영학과", region: "지방", status: "stable", currentRatio: 3.8, expectedRatio: 4.5, probChange: 5, applicants: 114, quota: 30, x: 25, y: 58 },

  // 지방 - 영남
  { id: "pusan", name: "부산대", department: "경영학과", region: "지방", status: "danger", currentRatio: 6.5, expectedRatio: 9.2, probChange: -15, applicants: 195, quota: 30, x: 55, y: 72 },
  { id: "kyungpook", name: "경북대", department: "경영학과", region: "지방", status: "stable", currentRatio: 4.2, expectedRatio: 5.0, probChange: 3, applicants: 126, quota: 30, x: 52, y: 55 },
  { id: "unist", name: "UNIST", department: "경영공학과", region: "지방", status: "danger", currentRatio: 7.2, expectedRatio: 10.5, probChange: -12, applicants: 180, quota: 25, x: 58, y: 68 },

  // 지방 - 강원
  { id: "kangwon", name: "강원대", department: "경영학과", region: "지방", status: "opportunity", currentRatio: 2.0, expectedRatio: 2.5, probChange: 30, applicants: 60, quota: 30, x: 48, y: 28 },

  // 지방 - 제주
  { id: "jeju", name: "제주대", department: "경영학과", region: "지방", status: "opportunity", currentRatio: 1.8, expectedRatio: 2.2, probChange: 35, applicants: 54, quota: 30, x: 25, y: 88 },
];

// 상태별 색상
const statusColors: Record<UniversityStatus, { bg: string; ring: string; text: string; label: string }> = {
  danger: { bg: "bg-red-500", ring: "ring-red-400", text: "text-red-600", label: "경쟁 과열" },
  opportunity: { bg: "bg-green-500", ring: "ring-green-400", text: "text-green-600", label: "지원 기회" },
  stable: { bg: "bg-blue-500", ring: "ring-blue-400", text: "text-blue-600", label: "안정권" },
  normal: { bg: "bg-gray-400", ring: "ring-gray-300", text: "text-gray-600", label: "보통" },
};

// 상태 결정 함수
const determineStatus = (expectedRatio: number, probChange: number): UniversityStatus => {
  if (expectedRatio > 8 || probChange < -10) return "danger";
  if (probChange > 10) return "opportunity";
  if (expectedRatio < 6 && probChange >= -5 && probChange <= 5) return "stable";
  return "normal";
};

function UniversityHeatmap() {
  const [universities, setUniversities] = useState<University[]>(initialUniversities);
  const [selectedUniv, setSelectedUniv] = useState<University | null>(null);
  const [hoveredUniv, setHoveredUniv] = useState<University | null>(null);
  const [_currentTime, setCurrentTime] = useState(new Date());
  const [selectedRegion, setSelectedRegion] = useState<"전체" | "서울" | "수도권" | "지방">("전체");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 실시간 데이터 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setUniversities((prev) =>
        prev.map((univ) => {
          if (Math.random() > 0.7) {
            const ratioChange = (Math.random() - 0.5) * 0.8;
            const newCurrentRatio = Math.max(1, univ.currentRatio + ratioChange);
            const newExpectedRatio = Math.max(newCurrentRatio, univ.expectedRatio + ratioChange * 1.5);
            const probDelta = (Math.random() - 0.5) * 8;
            const newProbChange = Math.max(-50, Math.min(50, univ.probChange + probDelta));
            const applicantChange = Math.floor(Math.random() * 5);

            return {
              ...univ,
              currentRatio: parseFloat(newCurrentRatio.toFixed(1)),
              expectedRatio: parseFloat(newExpectedRatio.toFixed(1)),
              probChange: parseFloat(newProbChange.toFixed(0)),
              applicants: univ.applicants + applicantChange,
              status: determineStatus(newExpectedRatio, newProbChange),
            };
          }
          return univ;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const _formatTime = (date: Date) => {
    return date.toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleUnivClick = useCallback((univ: University, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setSelectedUniv(univ);
  }, []);

  const handleUnivHover = useCallback((univ: University | null, e?: React.MouseEvent) => {
    setHoveredUniv(univ);
    if (univ && e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  }, []);

  const filteredUniversities = universities.filter(
    (u) => selectedRegion === "전체" || u.region === selectedRegion
  );

  // 통계 계산
  const stats = {
    danger: filteredUniversities.filter((u) => u.status === "danger").length,
    opportunity: filteredUniversities.filter((u) => u.status === "opportunity").length,
    stable: filteredUniversities.filter((u) => u.status === "stable").length,
    normal: filteredUniversities.filter((u) => u.status === "normal").length,
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* 예시 안내 배너 */}
      <div className="bg-orange-500 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold text-sm md:text-base">
            ⚠️ 아래는 예시입니다. 실제 서비스는 12월 29일 오픈 예정입니다.
          </span>
        </div>
      </div>

      {/* 헤더 */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 border-b border-orange-400">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/jungsi">
                <Button variant="ghost" size="icon" className="text-white hover:bg-orange-400">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-white" />
                  26 정시 경쟁율 실시간 히트맵
                </h1>
                <p className="text-orange-100 text-sm flex items-center gap-2 mt-1">
                  <Radio className="w-3 h-3 text-green-400 animate-pulse" />
                  접수기간 중 서비스 - 12월29일 퀵오픈!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 필터 & 범례 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* 지역 필터 */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-2">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            {(["전체", "서울", "수도권", "지방"] as const).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedRegion === region
                    ? "bg-orange-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                )}
              >
                {region}
              </button>
            ))}
          </div>

          {/* 범례 */}
          <div className="flex items-center gap-4 bg-slate-800 rounded-xl px-4 py-2 flex-wrap">
            <span className="text-slate-400 text-sm">범례:</span>
            {Object.entries(statusColors).map(([status, colors]) => (
              <div key={status} className="flex items-center gap-2">
                <span className={cn("w-3 h-3 rounded-full", colors.bg)} />
                <span className="text-slate-300 text-sm">{colors.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">경쟁 과열</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.danger}개</p>
            <p className="text-red-300 text-sm">지원 주의</p>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">지원 기회</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.opportunity}개</p>
            <p className="text-green-300 text-sm">적극 고려</p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Minus className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-medium">안정권</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.stable}개</p>
            <p className="text-blue-300 text-sm">안전 지원</p>
          </div>
          <div className="bg-slate-500/20 border border-slate-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-slate-400" />
              <span className="text-slate-400 font-medium">보통</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.normal}개</p>
            <p className="text-slate-300 text-sm">평균 수준</p>
          </div>
        </div>

        {/* 메인 컨텐츠: 지도 + 리스트 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 지도 영역 */}
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-4 relative overflow-hidden">
            <div className="aspect-[4/5] md:aspect-[4/3] relative bg-slate-700/50 rounded-xl overflow-hidden">
              {/* 한반도 배경 이미지 (SVG 경로로 표현) */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full"
                style={{ filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))" }}
              >
                {/* 한반도 윤곽 (간략화) */}
                <path
                  d="M35 15 Q30 20 28 25 Q25 30 27 35 Q25 40 23 45 Q20 50 22 55 Q20 60 22 65 Q20 70 25 75 Q22 80 25 85 Q28 90 30 88 Q35 85 40 82 Q45 78 50 75 Q55 72 58 70 Q60 65 58 60 Q62 55 60 50 Q58 45 55 42 Q52 38 50 35 Q48 30 45 28 Q42 25 40 22 Q38 18 35 15 Z"
                  fill="rgba(51, 65, 85, 0.5)"
                  stroke="rgba(100, 116, 139, 0.5)"
                  strokeWidth="0.5"
                />
                {/* 서울/수도권 영역 강조 */}
                <circle cx="36" cy="33" r="8" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.3" />
                {/* 제주도 */}
                <ellipse cx="25" cy="88" rx="5" ry="3" fill="rgba(51, 65, 85, 0.5)" stroke="rgba(100, 116, 139, 0.5)" strokeWidth="0.5" />
              </svg>

              {/* 대학 마커들 */}
              {filteredUniversities.map((univ) => (
                <button
                  key={univ.id}
                  className={cn(
                    "absolute transform -translate-x-1/2 -translate-y-1/2 z-10",
                    "w-4 h-4 md:w-5 md:h-5 rounded-full",
                    "ring-2 ring-opacity-50 transition-all duration-300",
                    "hover:scale-150 hover:z-20",
                    "focus:outline-none focus:ring-4",
                    statusColors[univ.status].bg,
                    statusColors[univ.status].ring,
                    univ.status === "danger" && "animate-pulse",
                    selectedUniv?.id === univ.id && "scale-150 ring-4 ring-orange-400 z-20"
                  )}
                  style={{ left: `${univ.x}%`, top: `${univ.y}%` }}
                  onClick={(e) => handleUnivClick(univ, e)}
                  onMouseEnter={(e) => handleUnivHover(univ, e)}
                  onMouseLeave={() => handleUnivHover(null)}
                  onTouchStart={(e) => handleUnivClick(univ, e)}
                >
                  {/* 경쟁 과열 시 불꽃 아이콘 */}
                  {univ.status === "danger" && (
                    <Flame className="absolute -top-3 -right-1 w-3 h-3 text-orange-400" />
                  )}
                </button>
              ))}

              {/* 호버 툴팁 (데스크탑) */}
              {hoveredUniv && showTooltip && (
                <div
                  className="fixed z-50 bg-slate-900 border border-slate-600 rounded-xl p-3 shadow-xl pointer-events-none hidden md:block"
                  style={{
                    left: tooltipPosition.x,
                    top: tooltipPosition.y,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <p className="font-bold text-white text-sm">
                    {hoveredUniv.name} {hoveredUniv.department}
                  </p>
                  <p className="text-slate-300 text-xs mt-1">
                    현재 경쟁률 {hoveredUniv.currentRatio}:1 → 예상 최종 {hoveredUniv.expectedRatio}:1
                  </p>
                  <p className={cn(
                    "text-xs mt-1 font-medium",
                    hoveredUniv.probChange > 0 ? "text-green-400" : hoveredUniv.probChange < 0 ? "text-red-400" : "text-slate-400"
                  )}>
                    합격확률 {hoveredUniv.probChange > 0 ? "+" : ""}{hoveredUniv.probChange}%
                  </p>
                </div>
              )}

              {/* 지역 라벨 */}
              <div className="absolute top-2 left-2 text-slate-500 text-xs">강원</div>
              <div className="absolute top-[30%] left-[30%] text-blue-400 text-xs font-medium">서울·수도권</div>
              <div className="absolute top-[45%] left-[22%] text-slate-500 text-xs">충청</div>
              <div className="absolute top-[60%] left-[18%] text-slate-500 text-xs">호남</div>
              <div className="absolute top-[55%] right-[35%] text-slate-500 text-xs">영남</div>
              <div className="absolute bottom-[8%] left-[20%] text-slate-500 text-xs">제주</div>
            </div>
          </div>

          {/* 상세 정보 패널 */}
          <div className="bg-slate-800 rounded-2xl p-4">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              {selectedUniv ? (
                <>
                  <span className={cn("w-3 h-3 rounded-full", statusColors[selectedUniv.status].bg)} />
                  상세 정보
                </>
              ) : (
                <>
                  <Info className="w-5 h-5 text-slate-400" />
                  대학을 선택하세요
                </>
              )}
            </h2>

            {selectedUniv ? (
              <div className="space-y-4">
                {/* 대학 정보 */}
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedUniv.name}</h3>
                      <p className="text-slate-400">{selectedUniv.department}</p>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      selectedUniv.status === "danger" && "bg-red-500/20 text-red-400",
                      selectedUniv.status === "opportunity" && "bg-green-500/20 text-green-400",
                      selectedUniv.status === "stable" && "bg-blue-500/20 text-blue-400",
                      selectedUniv.status === "normal" && "bg-slate-500/20 text-slate-400",
                    )}>
                      {statusColors[selectedUniv.status].label}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm">{selectedUniv.region}</p>
                </div>

                {/* 경쟁률 정보 */}
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h4 className="text-slate-400 text-sm mb-3">경쟁률 분석</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-500 text-xs">현재 경쟁률</p>
                      <p className="text-2xl font-bold text-white">{selectedUniv.currentRatio}:1</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">예상 최종</p>
                      <p className="text-2xl font-bold text-orange-400">{selectedUniv.expectedRatio}:1</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">지원자 / 모집인원</span>
                      <span className="text-white font-medium">
                        {selectedUniv.applicants}명 / {selectedUniv.quota}명
                      </span>
                    </div>
                  </div>
                </div>

                {/* 합격확률 변화 */}
                <div className={cn(
                  "rounded-xl p-4",
                  selectedUniv.probChange > 0 ? "bg-green-500/20" : selectedUniv.probChange < 0 ? "bg-red-500/20" : "bg-slate-700/50"
                )}>
                  <h4 className="text-slate-400 text-sm mb-2">합격확률 변화</h4>
                  <div className="flex items-center gap-3">
                    {selectedUniv.probChange > 0 ? (
                      <ArrowUp className="w-8 h-8 text-green-400" />
                    ) : selectedUniv.probChange < 0 ? (
                      <ArrowDown className="w-8 h-8 text-red-400" />
                    ) : (
                      <Minus className="w-8 h-8 text-slate-400" />
                    )}
                    <div>
                      <p className={cn(
                        "text-3xl font-bold",
                        selectedUniv.probChange > 0 ? "text-green-400" : selectedUniv.probChange < 0 ? "text-red-400" : "text-slate-400"
                      )}>
                        {selectedUniv.probChange > 0 ? "+" : ""}{selectedUniv.probChange}%
                      </p>
                      <p className="text-slate-400 text-sm">
                        {selectedUniv.probChange > 0 ? "지원 적기!" : selectedUniv.probChange < 0 ? "지원 신중히" : "변동 없음"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="space-y-2">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    이 대학 지원 목록에 추가
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    상세 분석 보기
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">
                  지도에서 대학을 클릭하거나<br />터치하여 상세 정보를 확인하세요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 실시간 업데이트 목록 */}
        <div className="mt-6 bg-slate-800 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-green-400 animate-pulse" />
            실시간 변동 현황
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...filteredUniversities]
              .sort((a, b) => Math.abs(b.probChange) - Math.abs(a.probChange))
              .slice(0, 6)
              .map((univ) => (
                <button
                  key={univ.id}
                  onClick={(e) => handleUnivClick(univ, e)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-all",
                    "hover:bg-slate-700/50",
                    selectedUniv?.id === univ.id ? "bg-slate-700 ring-2 ring-orange-500" : "bg-slate-700/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("w-3 h-3 rounded-full", statusColors[univ.status].bg)} />
                    <div className="text-left">
                      <p className="text-white font-medium text-sm">{univ.name}</p>
                      <p className="text-slate-500 text-xs">{univ.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold text-sm flex items-center gap-1",
                      univ.probChange > 0 ? "text-green-400" : univ.probChange < 0 ? "text-red-400" : "text-slate-400"
                    )}>
                      {univ.probChange > 0 ? <TrendingUp className="w-4 h-4" /> : univ.probChange < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                      {univ.probChange > 0 ? "+" : ""}{univ.probChange}%
                    </p>
                    <p className="text-slate-500 text-xs">{univ.expectedRatio}:1</p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <Link to="/jungsi/score-input">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 text-lg rounded-2xl shadow-lg transform hover:scale-105 transition h-auto">
              내 성적 입력하고 맞춤 분석 받기 →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
