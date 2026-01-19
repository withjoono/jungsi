// 이 페이지는 더 이상 사용되지 않습니다. (2024-12 비활성화)
// 대시보드로 리다이렉트됩니다.

import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

function RedirectToJungsi() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/jungsi", replace: true });
  }, [navigate]);

  return null;
}

export const Route = createLazyFileRoute("/jungsi/realtime-dashboard")({
  component: RedirectToJungsi,
});

/*
========================================
이전 실시간 대시보드 코드 (비활성화됨)
========================================

import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Flame, Radio, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/jungsi/realtime-dashboard")({
  component: RealtimeDashboard,
});

interface RankingItem {
  id: string;
  univ: string;
  dept: string;
  prob: number;
  change: number;
  hot: boolean;
}

interface GroupData {
  group: "가군" | "나군" | "다군";
  color: string;
  bgColor: string;
  borderColor: string;
  rankings: RankingItem[];
}

const initialGroupData: GroupData[] = [
  {
    group: "가군",
    color: "text-red-600",
    bgColor: "bg-white",
    borderColor: "border-gray-200",
    rankings: [
      { id: "ga-1", univ: "연세대", dept: "경영학과", prob: 72.4, change: 1.2, hot: true },
      { id: "ga-2", univ: "고려대", dept: "경영학부", prob: 68.4, change: 2.8, hot: true },
      { id: "ga-3", univ: "서강대", dept: "경영학부", prob: 85.2, change: -0.5, hot: false },
    ],
  },
  {
    group: "나군",
    color: "text-blue-600",
    bgColor: "bg-white",
    borderColor: "border-gray-200",
    rankings: [
      { id: "na-1", univ: "성균관대", dept: "글로벌경영", prob: 94.7, change: 0.4, hot: false },
      { id: "na-2", univ: "한양대", dept: "경영학부", prob: 91.2, change: -0.4, hot: false },
      { id: "na-3", univ: "중앙대", dept: "경영경제", prob: 97.3, change: 0, hot: false },
    ],
  },
  {
    group: "다군",
    color: "text-green-600",
    bgColor: "bg-white",
    borderColor: "border-gray-200",
    rankings: [
      { id: "da-1", univ: "한양대(ERICA)", dept: "경영학부", prob: 99.1, change: 0.1, hot: false },
      { id: "da-2", univ: "건국대", dept: "경영학과", prob: 98.5, change: 0.3, hot: false },
      { id: "da-3", univ: "동국대", dept: "경영학과", prob: 96.8, change: -0.2, hot: false },
    ],
  },
];

const getBarColor = (prob: number): string => {
  if (prob >= 90) return "#22c55e";
  if (prob >= 70) return "#3b82f6";
  if (prob >= 50) return "#f97316";
  return "#ef4444";
};

const getStatusText = (prob: number): string => {
  if (prob >= 90) return "안전";
  if (prob >= 70) return "적정";
  if (prob >= 50) return "소신";
  return "상향";
};

const getStatusColor = (prob: number): string => {
  if (prob >= 90) return "bg-green-100 text-green-700";
  if (prob >= 70) return "bg-blue-100 text-blue-700";
  if (prob >= 50) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
};

const getGroupAverage = (rankings: RankingItem[]): number => {
  if (rankings.length === 0) return 0;
  const sum = rankings.reduce((acc, item) => acc + item.prob, 0);
  return sum / rankings.length;
};

interface GroupCardProps {
  groupData: GroupData;
  isExpanded: boolean;
  onToggle: () => void;
  isDesktop?: boolean;
}

function GroupCard({ groupData, isExpanded, onToggle, isDesktop = false }: GroupCardProps) {
  const average = getGroupAverage(groupData.rankings);
  const hotCount = groupData.rankings.filter((r) => r.hot).length;
  const showContent = isDesktop || isExpanded;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 overflow-hidden transition-all duration-300 h-full",
        groupData.borderColor,
        groupData.bgColor
      )}
    >
      <div
        onClick={isDesktop ? undefined : onToggle}
        className={cn(
          "w-full p-4 flex items-center justify-between",
          !isDesktop && "cursor-pointer"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-xl font-black px-3 py-1 rounded-lg bg-white shadow-sm",
              groupData.color
            )}
          >
            {groupData.group}
          </span>
          <div className="text-left">
            <p className="text-sm text-gray-600">평균 합격확률</p>
            <p className={cn("text-2xl font-black", groupData.color)}>
              {average.toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hotCount > 0 && (
            <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
              <Flame className="w-4 h-4" />
              {hotCount}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Radio className="w-3 h-3 animate-pulse" />
            실시간
          </span>
          {!isDesktop && (
            isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )
          )}
        </div>
      </div>

      {showContent && (
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-white rounded-xl p-3 space-y-2">
            {groupData.rankings.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="w-20 text-xs text-gray-600 text-right truncate">
                  {item.univ}
                </span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${item.prob}%`,
                      backgroundColor: getBarColor(item.prob),
                    }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-700">
                    {item.prob.toFixed(1)}%
                  </span>
                </div>
                {item.hot && <Flame className="w-4 h-4 text-red-500 flex-shrink-0" />}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {groupData.rankings.map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl bg-white",
                  item.hot && "ring-2 ring-red-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-6 h-6 flex items-center justify-center text-sm font-black text-white rounded-full",
                      groupData.color.replace("text-", "bg-")
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {item.univ} {item.dept}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          getStatusColor(item.prob)
                        )}
                      >
                        {getStatusText(item.prob)}
                      </span>
                      <span
                        className={cn(
                          "text-xs flex items-center gap-0.5",
                          item.change > 0
                            ? "text-green-600"
                            : item.change < 0
                              ? "text-red-600"
                              : "text-gray-500"
                        )}
                      >
                        {item.change > 0 && <ArrowUp className="w-3 h-3" />}
                        {item.change < 0 && <ArrowDown className="w-3 h-3" />}
                        {item.change === 0
                          ? "유지"
                          : `${item.change > 0 ? "+" : ""}${item.change.toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={cn("text-xl font-black", groupData.color)}>
                    {item.prob.toFixed(1)}%
                  </p>
                  {item.hot && <Flame className="w-4 h-4 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RealtimeDashboard() {
  const [groupData, setGroupData] = useState<GroupData[]>(initialGroupData);
  const [_currentTime, setCurrentTime] = useState(new Date());
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    가군: false,
    나군: false,
    다군: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGroupData((prev) =>
        prev.map((group) => ({
          ...group,
          rankings: group.rankings.map((item) => {
            if (Math.random() > 0.7) {
              const delta = (Math.random() - 0.5) * 1.2;
              return {
                ...item,
                prob: Math.max(0, Math.min(99.9, item.prob + delta)),
                change: parseFloat(delta.toFixed(1)),
              };
            }
            return item;
          }),
        }))
      );
    }, 8000);
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

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const allRankings = groupData.flatMap((g) => g.rankings);
  const totalAverage =
    allRankings.reduce((acc, item) => acc + item.prob, 0) / allRankings.length;
  const totalHotCount = allRankings.filter((r) => r.hot).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white py-3 px-4">
        <div className="max-w-lg lg:max-w-7xl mx-auto flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold text-sm md:text-base">
            ⚠️ 아래는 예시입니다. 실제 서비스는 12월 29일 오픈 예정입니다.
          </span>
        </div>
      </div>

      <div className="max-w-lg lg:max-w-7xl mx-auto bg-white min-h-screen shadow-xl">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white pt-8 pb-8 px-6">
          <div className="text-center">
            <h1 className="text-2xl font-black">26 정시 실시간 예측</h1>
            <p className="mt-2 text-orange-100">
              접수기간 중 서비스 - 12월29일 퀵오픈!
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 max-w-md mx-auto lg:max-w-lg">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs text-orange-200">전체 평균</p>
              <p className="text-xl font-black">{totalAverage.toFixed(1)}%</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs text-orange-200">지원 대학</p>
              <p className="text-xl font-black">{allRankings.length}개</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs text-orange-200">경쟁 과열</p>
              <p className="text-xl font-black flex items-center justify-center gap-1">
                <Flame className="w-4 h-4" />
                {totalHotCount}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-4 space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-3 max-w-md mx-auto lg:max-w-full">
            <div className="flex justify-center gap-3 text-xs flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-500"></span>
                안전(90%+)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500"></span>
                적정(70-89%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-orange-500"></span>
                소신(50-69%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-500"></span>
                상향(&lt;50%)
              </span>
            </div>
          </div>

          <div className="lg:hidden space-y-4">
            {groupData.map((group) => (
              <GroupCard
                key={group.group}
                groupData={group}
                isExpanded={expandedGroups[group.group]}
                onToggle={() => toggleGroup(group.group)}
                isDesktop={false}
              />
            ))}
          </div>

          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
            {groupData.map((group) => (
              <GroupCard
                key={group.group}
                groupData={group}
                isExpanded={true}
                onToggle={() => {}}
                isDesktop={true}
              />
            ))}
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white text-center max-w-md mx-auto lg:max-w-full">
            <p className="text-xl font-black">전국 대학 실시간 히트맵</p>
            <p className="mt-2 opacity-90 text-sm">
              지금 한양대 AI 초록불 켜짐 → 안전지원 가능
            </p>
          </div>

          <div className="max-w-md mx-auto lg:max-w-md">
            <Link to="/jungsi">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-5 rounded-2xl shadow-lg transform hover:scale-105 transition h-auto"
              >
                내 성적 입력하고 실시간 예측 시작하기 →
              </Button>
            </Link>
          </div>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}
*/
