import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Minus,
  ChevronRight,
  Flame,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/jungsi/competition")({
  component: CompetitionPage,
});

interface CompetitionData {
  id: string;
  name: string;
  dept: string;
  group: "가군" | "나군" | "다군";
  currentRatio: number;
  lastYearRatio: number;
  change: number;
  trend: "up" | "down" | "stable";
  applicants: number;
  capacity: number;
  hourlyData: number[];
  isHot: boolean;
}

const mockCompetitionData: CompetitionData[] = [
  {
    id: "1",
    name: "서울대",
    dept: "경영학과",
    group: "가군",
    currentRatio: 6.8,
    lastYearRatio: 5.2,
    change: 1.6,
    trend: "up",
    applicants: 340,
    capacity: 50,
    hourlyData: [4.2, 4.5, 4.8, 5.1, 5.4, 5.8, 6.2, 6.5, 6.8],
    isHot: true,
  },
  {
    id: "2",
    name: "연세대",
    dept: "경영학과",
    group: "가군",
    currentRatio: 5.2,
    lastYearRatio: 4.8,
    change: 0.4,
    trend: "up",
    applicants: 416,
    capacity: 80,
    hourlyData: [3.8, 4.0, 4.2, 4.5, 4.7, 4.9, 5.0, 5.1, 5.2],
    isHot: false,
  },
  {
    id: "3",
    name: "고려대",
    dept: "경영학부",
    group: "가군",
    currentRatio: 4.9,
    lastYearRatio: 5.1,
    change: -0.2,
    trend: "down",
    applicants: 392,
    capacity: 80,
    hourlyData: [4.5, 4.6, 4.7, 4.8, 4.8, 4.9, 4.9, 4.9, 4.9],
    isHot: false,
  },
  {
    id: "4",
    name: "성균관대",
    dept: "글로벌경영",
    group: "나군",
    currentRatio: 3.2,
    lastYearRatio: 3.4,
    change: -0.2,
    trend: "down",
    applicants: 192,
    capacity: 60,
    hourlyData: [2.5, 2.6, 2.8, 2.9, 3.0, 3.1, 3.1, 3.2, 3.2],
    isHot: false,
  },
  {
    id: "5",
    name: "한양대",
    dept: "AI학과",
    group: "가군",
    currentRatio: 8.5,
    lastYearRatio: 6.2,
    change: 2.3,
    trend: "up",
    applicants: 425,
    capacity: 50,
    hourlyData: [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.3, 8.5],
    isHot: true,
  },
  {
    id: "6",
    name: "중앙대",
    dept: "경영경제",
    group: "나군",
    currentRatio: 2.8,
    lastYearRatio: 2.9,
    change: -0.1,
    trend: "stable",
    applicants: 168,
    capacity: 60,
    hourlyData: [2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.7, 2.8, 2.8],
    isHot: false,
  },
];

const groupColors = {
  "가군": { bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-300" },
  "나군": { bg: "bg-violet-100", text: "text-violet-600", border: "border-violet-300" },
  "다군": { bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-300" },
};

function MiniChart({ data, isUp }: { data: number[]; isUp: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((value, i) => {
        const height = ((value - min) / range) * 100;
        const isLast = i === data.length - 1;
        return (
          <div
            key={i}
            className={cn(
              "w-2 rounded-t transition-all duration-300",
              isLast
                ? isUp ? "bg-green-500" : "bg-red-500"
                : "bg-gray-300"
            )}
            style={{ height: `${Math.max(10, height)}%` }}
          />
        );
      })}
    </div>
  );
}

function CompetitionCard({ data }: { data: CompetitionData }) {
  const [currentRatio, setCurrentRatio] = useState(data.currentRatio);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const delta = (Math.random() - 0.3) * 0.2;
        setCurrentRatio((prev) => Math.max(0.1, prev + delta));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const groupStyle = groupColors[data.group];
  const changePercent = ((currentRatio - data.lastYearRatio) / data.lastYearRatio) * 100;

  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-lg overflow-hidden border-l-4",
      data.isHot ? "border-l-red-500 ring-2 ring-red-100" : groupStyle.border
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", groupStyle.bg, groupStyle.text)}>
                {data.group}
              </span>
              {data.isHot && (
                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                  <Flame className="w-3 h-3" />
                  과열
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{data.name}</h3>
            <p className="text-gray-500 text-sm">{data.dept}</p>
          </div>
          <MiniChart data={data.hourlyData} isUp={data.trend === "up"} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">현재 경쟁률</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900">
                {currentRatio.toFixed(1)}
              </span>
              <span className="text-gray-500">: 1</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">작년 최종</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-400">
                {data.lastYearRatio.toFixed(1)}
              </span>
              <span className="text-gray-400">: 1</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{data.applicants}명</span>
            </div>
            <div className="text-sm text-gray-600">
              정원 {data.capacity}명
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-sm font-bold",
            data.trend === "up" ? "text-red-600" :
            data.trend === "down" ? "text-blue-600" : "text-gray-500"
          )}>
            {data.trend === "up" && <ArrowUpRight className="w-4 h-4" />}
            {data.trend === "down" && <ArrowDownRight className="w-4 h-4" />}
            {data.trend === "stable" && <Minus className="w-4 h-4" />}
            {changePercent > 0 ? "+" : ""}{changePercent.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function CompetitionPage() {
  const [selectedGroup, setSelectedGroup] = useState<"all" | "가군" | "나군" | "다군">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredData = mockCompetitionData.filter((d) => {
    const matchesGroup = selectedGroup === "all" || d.group === selectedGroup;
    const matchesSearch = searchQuery === "" ||
      d.name.includes(searchQuery) ||
      d.dept.includes(searchQuery);
    return matchesGroup && matchesSearch;
  });

  const hotCount = mockCompetitionData.filter((d) => d.isHot).length;
  const avgRatio = mockCompetitionData.reduce((sum, d) => sum + d.currentRatio, 0) / mockCompetitionData.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black">경쟁률 실시간 분석</h1>
              <p className="text-purple-200 text-sm mt-1">작년 vs 올해 경쟁률 비교</p>
            </div>
            <div className="flex items-center gap-2 text-purple-200">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{currentTime.toLocaleTimeString("ko-KR")}</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-xs text-purple-200">평균 경쟁률</p>
              <p className="text-xl font-black">{avgRatio.toFixed(1)}:1</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-xs text-purple-200">과열 학과</p>
              <p className="text-xl font-black flex items-center justify-center gap-1">
                <Flame className="w-4 h-4" />
                {hotCount}개
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-xs text-purple-200">분석 대학</p>
              <p className="text-xl font-black">{mockCompetitionData.length}개</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="대학 또는 학과 검색"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>

            {/* Group Filter */}
            <div className="flex gap-2">
              {(["all", "가군", "나군", "다군"] as const).map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={cn(
                    "px-4 py-2 rounded-xl font-medium transition-all",
                    selectedGroup === group
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {group === "all" ? "전체" : group}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hot Alert */}
        {hotCount > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-800">경쟁률 과열 경고</h3>
                <p className="text-sm text-red-600">
                  {mockCompetitionData.filter(d => d.isHot).map(d => `${d.name} ${d.dept}`).join(", ")} -
                  작년 대비 30% 이상 상승 중
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Competition Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((data) => (
            <CompetitionCard key={data.id} data={data} />
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="font-bold text-gray-700 mb-3">범례</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>경쟁률 하락 (안정)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>경쟁률 상승 (주의)</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-600" />
              <span>과열 (작년 대비 30%↑)</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-black mb-2">내 지원 대학 경쟁률만 보고 싶다면?</h3>
          <p className="text-purple-100 mb-4">
            배치 시뮬레이션에서 대학을 선택하면 맞춤 알림을 받을 수 있어요
          </p>
          <Link to="/jungsi/simulation">
            <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-6 py-3 h-auto">
              배치 시뮬레이션 가기 <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
