import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Zap,
  Target,
  BarChart3,
  Star,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/promo/jungsi/realtime-heatmap")({
  component: RealtimeHeatmapPromo,
});

const primaryColor = "#f97316"; // orange-500

// 3가지 문제점 데이터
const problems = [
  {
    number: "1",
    title: "마감 10분 전 허둥지둥",
    description:
      "약대·의대·상위권 학과 눈치 보느라 \"이 대학 넣었다가 → 저 대학으로 옮겼다가\" 하다가 결국 마감 직전 잘못된 곳에 지원",
    stat: "1,200명+",
    statLabel: "매년 발생",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    number: "2",
    title: "'펑크난' 학과 놓침",
    description:
      "지원자가 갑자기 빠져서 생긴 기회의 학과를 사람들이 몰라서 그냥 지나침",
    stat: "400~600개",
    statLabel: "모집단위/년",
    icon: Target,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    number: "3",
    title: "경쟁률 확인에 30분 허비",
    description:
      "관심 있는 10개 대학 경쟁률을 탭 돌려가며 하나하나 확인하느라 시간 낭비",
    stat: "거의 100%",
    statLabel: "수험생 경험",
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
];

// 히트맵 해결책
const solutions = [
  {
    icon: Eye,
    title: "전국 자동 모니터링",
    description: "230개 대학 · 1,200개 모집단위를 5분마다 자동으로 확인",
    highlight: "230개 대학",
  },
  {
    icon: BarChart3,
    title: "직관적 색상 표시",
    description: "지원자 몰리면 빨강, 빠지면 초록, 안정되면 파랑으로 즉시 확인",
    highlight: "3색 시각화",
  },
  {
    icon: Bell,
    title: "찜한 대학 알림",
    description: "관심 대학만 찜해놓으면 경쟁률 변동 시 즉시 알림",
    highlight: "실시간 알림",
  },
  {
    icon: Zap,
    title: "빠른 의사결정",
    description: "한 화면에서 전체 현황 파악, 최적의 타이밍에 지원",
    highlight: "원클릭 확인",
  },
];

// 히트맵 시뮬레이션 대학 데이터
interface HeatmapUniv {
  id: string;
  name: string;
  dept: string;
  ratio: number;
  change: number;
  status: "hot" | "cold" | "stable";
  starred?: boolean;
}

const initialHeatmapData: HeatmapUniv[] = [
  { id: "1", name: "서울대", dept: "경영학과", ratio: 4.2, change: 0.3, status: "hot" },
  { id: "2", name: "연세대", dept: "경영학과", ratio: 3.8, change: -0.2, status: "cold", starred: true },
  { id: "3", name: "고려대", dept: "경영학부", ratio: 3.5, change: 0.1, status: "stable" },
  { id: "4", name: "서강대", dept: "경영학부", ratio: 2.9, change: 0.5, status: "hot" },
  { id: "5", name: "성균관대", dept: "글로벌경영", ratio: 3.2, change: 0, status: "stable", starred: true },
  { id: "6", name: "한양대", dept: "경영학부", ratio: 2.7, change: -0.4, status: "cold" },
  { id: "7", name: "중앙대", dept: "경영경제", ratio: 2.4, change: 0.2, status: "hot" },
  { id: "8", name: "경희대", dept: "경영학과", ratio: 2.1, change: -0.1, status: "cold" },
  { id: "9", name: "한국외대", dept: "경영학부", ratio: 1.9, change: 0, status: "stable" },
  { id: "10", name: "건국대", dept: "경영학과", ratio: 2.3, change: 0.3, status: "hot", starred: true },
  { id: "11", name: "동국대", dept: "경영학과", ratio: 1.8, change: -0.2, status: "cold" },
  { id: "12", name: "홍익대", dept: "경영학부", ratio: 2.0, change: 0.1, status: "stable" },
];

const getStatusColor = (status: "hot" | "cold" | "stable") => {
  switch (status) {
    case "hot":
      return "bg-red-500";
    case "cold":
      return "bg-green-500";
    case "stable":
      return "bg-blue-500";
  }
};

const getStatusBgColor = (status: "hot" | "cold" | "stable") => {
  switch (status) {
    case "hot":
      return "bg-red-50 border-red-200";
    case "cold":
      return "bg-green-50 border-green-200";
    case "stable":
      return "bg-blue-50 border-blue-200";
  }
};

const _getStatusText = (status: "hot" | "cold" | "stable") => {
  switch (status) {
    case "hot":
      return "경쟁 과열";
    case "cold":
      return "기회 발생";
    case "stable":
      return "안정";
  }
};

function RealtimeHeatmapPromo() {
  const [heatmapData, setHeatmapData] = useState<HeatmapUniv[]>(initialHeatmapData);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  // 히트맵 데이터 시뮬레이션 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setHeatmapData((prev) =>
        prev.map((univ) => {
          if (Math.random() > 0.7) {
            const changeAmount = (Math.random() - 0.5) * 0.6;
            const newRatio = Math.max(1.0, Math.min(6.0, univ.ratio + changeAmount));
            const newChange = parseFloat(changeAmount.toFixed(1));
            let newStatus: "hot" | "cold" | "stable" = "stable";
            if (newChange > 0.2) newStatus = "hot";
            else if (newChange < -0.2) newStatus = "cold";

            // 찜한 대학이면 알림 추가
            if (univ.starred && Math.abs(newChange) > 0.1) {
              const action = newChange > 0 ? "경쟁률 상승" : "경쟁률 하락";
              setNotifications((n) => [`${univ.name} ${univ.dept}: ${action}!`, ...n.slice(0, 2)]);
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 3000);
            }

            return {
              ...univ,
              ratio: parseFloat(newRatio.toFixed(1)),
              change: newChange,
              status: newStatus,
            };
          }
          return univ;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const hotCount = useMemo(() => heatmapData.filter((u) => u.status === "hot").length, [heatmapData]);
  const coldCount = useMemo(() => heatmapData.filter((u) => u.status === "cold").length, [heatmapData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          {/* 히트맵 패턴 배경 */}
          <div className="absolute inset-0 grid grid-cols-8 gap-2 p-4 opacity-20">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-full aspect-square rounded",
                  i % 3 === 0 ? "bg-red-300" : i % 3 === 1 ? "bg-green-300" : "bg-blue-300"
                )}
              />
            ))}
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24">
          {/* 서비스 배지 */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              <MapPin className="w-4 h-4" />
              전국 대학 실시간 모니터링
            </span>
          </div>

          {/* 메인 타이틀 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white text-center mb-6">
            경쟁률 실시간 히트맵
          </h1>

          {/* 핵심 메시지 */}
          <p className="text-xl md:text-2xl text-orange-100 text-center max-w-3xl mx-auto mb-8 leading-relaxed">
            "한 화면에서 <span className="text-white font-bold">전국 모든 대학</span>의{" "}
            <span className="text-white font-bold">경쟁률 변화</span>를 실시간으로"
          </p>

          {/* 핵심 수치 */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <p className="text-orange-200 text-sm">모니터링 대학</p>
              <p className="text-white font-bold text-lg">230개</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <p className="text-orange-200 text-sm">모집단위</p>
              <p className="text-white font-bold text-lg">1,200개</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <p className="text-orange-200 text-sm">업데이트 주기</p>
              <p className="text-white font-bold text-lg">5분마다</p>
            </div>
          </div>

          {/* 히트맵 데모 */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 relative">
            {/* 알림 팝업 */}
            {showNotification && notifications.length > 0 && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  {notifications[0]}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="font-bold text-gray-900">실시간 히트맵</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-500" />
                  과열 {hotCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-green-500" />
                  기회 {coldCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-500" />
                  안정
                </span>
              </div>
            </div>

            {/* 히트맵 그리드 */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {heatmapData.map((univ) => (
                <div
                  key={univ.id}
                  className={cn(
                    "relative p-3 rounded-xl border-2 transition-all duration-300",
                    getStatusBgColor(univ.status),
                    univ.starred && "ring-2 ring-yellow-400"
                  )}
                >
                  {univ.starred && (
                    <Star className="absolute -top-1.5 -right-1.5 w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  <div className="flex items-center gap-1 mb-1">
                    <span className={cn("w-2 h-2 rounded-full", getStatusColor(univ.status))} />
                    <span className="text-xs font-bold text-gray-800 truncate">{univ.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate mb-1">{univ.dept}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">{univ.ratio}:1</span>
                    {univ.change !== 0 && (
                      <span
                        className={cn(
                          "flex items-center text-[10px] font-medium",
                          univ.change > 0 ? "text-red-500" : "text-green-500"
                        )}
                      >
                        {univ.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {univ.change > 0 ? "+" : ""}
                        {univ.change}
                      </span>
                    )}
                    {univ.change === 0 && <Minus className="w-3 h-3 text-gray-400" />}
                  </div>
                </div>
              ))}
            </div>

            {/* 범례 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-500" />
                  빨강 = 지원자 증가
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-green-500" />
                  초록 = 지원자 감소
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-500" />
                  파랑 = 안정
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 웨이브 디바이더 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </div>

      {/* 3가지 문제 섹션 */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              정시 접수 기간에 <span style={{ color: primaryColor }}>가장 많이 일어나는</span> 3가지 일
            </h2>
            <p className="text-xl text-gray-600">
              매년 반복되는 문제들, 이제 히트맵으로 해결하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((problem) => {
              const Icon = problem.icon;
              return (
                <div
                  key={problem.number}
                  className={cn(
                    "rounded-2xl p-6 border-2 transition-all hover:shadow-lg",
                    problem.bgColor,
                    problem.borderColor
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        problem.color === "text-red-500" && "bg-red-100",
                        problem.color === "text-yellow-600" && "bg-yellow-100",
                        problem.color === "text-blue-500" && "bg-blue-100"
                      )}
                    >
                      <Icon className={cn("w-6 h-6", problem.color)} />
                    </div>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                        problem.color === "text-red-500" && "bg-red-500",
                        problem.color === "text-yellow-600" && "bg-yellow-500",
                        problem.color === "text-blue-500" && "bg-blue-500"
                      )}
                    >
                      {problem.number}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-xl mb-3">{problem.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{problem.description}</p>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-3xl font-black", problem.color)}>{problem.stat}</span>
                      <span className="text-gray-500 text-sm">{problem.statLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 해결책 섹션 */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              거북스쿨 실시간 히트맵이{" "}
              <span style={{ color: primaryColor }}>한 번에 해결</span>합니다
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, idx) => {
              const Icon = solution.icon;
              return (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-100 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{solution.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{solution.description}</p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    {solution.highlight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 색상 설명 섹션 */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span style={{ color: primaryColor }}>색상</span>만 봐도 알 수 있습니다
            </h2>
            <p className="text-xl text-gray-600">직관적인 3색 시스템으로 빠른 판단</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* 빨강 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-red-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">빨강</h3>
                  <p className="text-red-500 font-medium">경쟁 과열</p>
                </div>
              </div>
              <p className="text-gray-600">
                지원자가 <strong>몰리고 있는</strong> 학과입니다.
                <br />
                신중하게 지원을 검토하세요.
              </p>
            </div>

            {/* 초록 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-green-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">초록</h3>
                  <p className="text-green-500 font-medium">기회 발생</p>
                </div>
              </div>
              <p className="text-gray-600">
                지원자가 <strong>빠지고 있는</strong> 학과입니다.
                <br />
                지원 기회를 검토해보세요!
              </p>
            </div>

            {/* 파랑 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Minus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">파랑</h3>
                  <p className="text-blue-500 font-medium">안정</p>
                </div>
              </div>
              <p className="text-gray-600">
                경쟁률이 <strong>안정적인</strong> 학과입니다.
                <br />
                계획대로 진행하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 찜 기능 섹션 */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* 왼쪽: 설명 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#fef3c7" }}
                >
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">관심 대학 찜하기</h2>
              </div>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                관심 있는 대학만 <strong>찜</strong>해놓으면,
                <br />
                경쟁률이 변동될 때 <span style={{ color: primaryColor }}>즉시 알림</span>을 받을 수
                있습니다.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">무제한 찜하기 가능</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">경쟁률 급변 시 푸시 알림</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">찜한 대학만 모아보기</span>
                </li>
              </ul>
            </div>

            {/* 오른쪽: 알림 예시 */}
            <div className="flex-1 max-w-md">
              <div className="bg-gray-100 rounded-2xl p-6">
                <p className="text-gray-500 text-sm mb-4 text-center">알림 예시</p>
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">연세대 경영학과</p>
                      <p className="text-sm text-green-600">경쟁률 하락! 3.8:1 → 3.6:1</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">성균관대 글로벌경영</p>
                      <p className="text-sm text-gray-500">경쟁률 안정 유지 중</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">건국대 경영학과</p>
                      <p className="text-sm text-red-600">경쟁률 상승! 2.0:1 → 2.3:1</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="py-20 bg-gradient-to-br from-orange-500 to-red-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            더 이상 탭 돌려가며 확인하지 마세요
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            한 화면에서 전국 대학 경쟁률을 실시간으로 확인하고,
            <br />
            최적의 타이밍에 지원하세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/login">
              <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-lg px-8 py-6 rounded-xl shadow-lg h-auto">
                로그인하고 히트맵 보기
              </Button>
            </Link>
            <Link to="/jungsi">
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6 rounded-xl h-auto"
              >
                정시 서비스 둘러보기
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex justify-center gap-8 text-orange-100 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>정시 서비스 이용자 무료</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>접수 기간 중 24시간 운영</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>무제한 찜하기</span>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 여백 */}
      <div className="h-8 bg-gray-50" />
    </div>
  );
}
