import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  FileText,
  Map,
  BarChart3,
  Settings,
  ChevronRight,
  Flame,
  Target,
  Trophy,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Users,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceGate } from "@/components/try";

export const Route = createLazyFileRoute("/jungsi/dashboard")({
  component: DashboardPageWithGate,
});

function DashboardPageWithGate() {
  return (
    <ServiceGate
      serviceCode="J"
      serviceName="정시 대시보드"
      serviceColor="orange"
      purchaseLink="/products"
      tryLandingLink="/try/jungsi-prediction"
      allowTry={true}
      tryLimitDescription="체험 버전에서는 일부 기능이 제한됩니다"
    >
      <DashboardPage />
    </ServiceGate>
  );
}

interface UniversityStatus {
  id: string;
  name: string;
  dept: string;
  group: "가군" | "나군" | "다군";
  probability: number;
  change: number;
  trend: "up" | "down" | "stable";
  rank: number;
  totalApplicants: number;
  status: "safe" | "moderate" | "risky" | "danger";
}

const mockUserData = {
  name: "김민준",
  score: {
    korean: 131,
    math: 137,
    english: 1,
    history: 2,
    science1: 65,
    science2: 62,
  },
  percentile: {
    korean: 94,
    math: 96,
    total: 95.2,
  },
  standardScore: 289,
};

const mockUniversities: UniversityStatus[] = [
  { id: "1", name: "한양대", dept: "AI학과", group: "가군", probability: 91.2, change: 2.1, trend: "up", rank: 156, totalApplicants: 892, status: "safe" },
  { id: "2", name: "성균관대", dept: "글로벌경영", group: "나군", probability: 94.7, change: 0.3, trend: "stable", rank: 89, totalApplicants: 1203, status: "safe" },
  { id: "3", name: "한양대(ERICA)", dept: "경영학부", group: "다군", probability: 99.1, change: 0.1, trend: "up", rank: 23, totalApplicants: 567, status: "safe" },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "safe":
      return { color: "text-green-600", bg: "bg-green-100", label: "안전" };
    case "moderate":
      return { color: "text-blue-600", bg: "bg-blue-100", label: "적정" };
    case "risky":
      return { color: "text-orange-500", bg: "bg-orange-100", label: "소신" };
    case "danger":
      return { color: "text-red-600", bg: "bg-red-100", label: "도전" };
    default:
      return { color: "text-gray-600", bg: "bg-gray-100", label: "-" };
  }
};

const groupColors = {
  "가군": "from-rose-500 to-pink-500",
  "나군": "from-violet-500 to-purple-500",
  "다군": "from-emerald-500 to-teal-500",
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 0.4;
      setDisplayValue((prev) => {
        const newVal = prev + delta;
        return Math.max(0, Math.min(100, newVal));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="tabular-nums">
      {displayValue.toFixed(1)}{suffix}
    </span>
  );
}

function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [universities, setUniversities] = useState(mockUniversities);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUniversities((prev) =>
        prev.map((u) => {
          if (Math.random() > 0.7) {
            const delta = (Math.random() - 0.5) * 1.5;
            const newProb = Math.max(0, Math.min(99.9, u.probability + delta));
            return {
              ...u,
              probability: newProb,
              change: parseFloat(delta.toFixed(1)),
              trend: delta > 0.2 ? "up" : delta < -0.2 ? "down" : "stable",
            };
          }
          return u;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const overallProbability = universities.reduce((sum, u) => sum + u.probability, 0) / universities.length;
  const dDay = 17; // 12월 29일까지

  const quickLinks = [
    { icon: Target, label: "배치 시뮬레이션", href: "/jungsi/simulation", color: "bg-indigo-500" },
    { icon: BarChart3, label: "경쟁률 분석", href: "/jungsi/competition", color: "bg-purple-500" },
    { icon: Map, label: "전국 히트맵", href: "/jungsi/heatmap", color: "bg-pink-500" },
    { icon: Bell, label: "알림 설정", href: "/jungsi/notifications", color: "bg-orange-500" },
    { icon: FileText, label: "PDF 리포트", href: "/jungsi/report", color: "bg-emerald-500" },
    { icon: Settings, label: "성적 수정", href: "/jungsi", color: "bg-gray-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-200 text-sm">안녕하세요</p>
              <h1 className="text-2xl font-black">{mockUserData.name}님</h1>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-indigo-200 text-sm">
                <Clock className="w-4 h-4" />
                {currentTime.toLocaleTimeString("ko-KR")}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-300">실시간 업데이트 중</span>
              </div>
            </div>
          </div>

          {/* D-Day Banner */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-indigo-200 text-sm">2026 정시 원서 접수까지</p>
                <p className="text-3xl font-black">D-{dDay}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">내 표준점수</p>
              <p className="text-2xl font-black">{mockUserData.standardScore}점</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Trophy className="w-4 h-4" />
              종합 합격률
            </div>
            <p className="text-3xl font-black text-green-600">
              <AnimatedNumber value={overallProbability} suffix="%" />
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <GraduationCap className="w-4 h-4" />
              지원 대학
            </div>
            <p className="text-3xl font-black text-indigo-600">{universities.length}개</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Users className="w-4 h-4" />
              전체 백분위
            </div>
            <p className="text-3xl font-black text-purple-600">{mockUserData.percentile.total}%</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Flame className="w-4 h-4" />
              경쟁 과열
            </div>
            <p className="text-3xl font-black text-orange-500">2건</p>
          </div>
        </div>

        {/* My Universities */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">내 지원 대학 실시간 현황</h2>
            <Link to="/jungsi/simulation" className="text-indigo-600 text-sm font-medium flex items-center gap-1">
              배치 수정 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {universities.map((uni) => {
              const statusConfig = getStatusConfig(uni.status);
              return (
                <div key={uni.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm bg-gradient-to-br",
                        groupColors[uni.group]
                      )}>
                        {uni.group.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{uni.name} {uni.dept}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusConfig.bg, statusConfig.color)}>
                            {statusConfig.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {uni.rank}위 / {uni.totalApplicants}명
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-2xl font-black",
                        uni.probability >= 90 ? "text-green-600" :
                        uni.probability >= 70 ? "text-blue-600" :
                        uni.probability >= 50 ? "text-orange-500" : "text-red-600"
                      )}>
                        {uni.probability.toFixed(1)}%
                      </p>
                      <div className={cn(
                        "flex items-center justify-end gap-1 text-sm",
                        uni.trend === "up" ? "text-green-600" :
                        uni.trend === "down" ? "text-red-600" : "text-gray-500"
                      )}>
                        {uni.trend === "up" && <TrendingUp className="w-4 h-4" />}
                        {uni.trend === "down" && <TrendingDown className="w-4 h-4" />}
                        {uni.trend === "stable" && <Minus className="w-4 h-4" />}
                        {uni.change > 0 ? "+" : ""}{uni.change.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center"
            >
              <div className={cn("w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-white", link.color)}>
                <link.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700">{link.label}</p>
            </Link>
          ))}
        </div>

        {/* Alerts */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-orange-700">실시간 알림</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Flame className="w-4 h-4" />
                  <span>한양대 AI학과 경쟁률 급등 중 (+0.8:1)</span>
                  <span className="text-orange-500">2분 전</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>성균관대 글로벌경영 안전권 진입</span>
                  <span className="text-orange-500">15분 전</span>
                </div>
              </div>
            </div>
            <Link to="/jungsi/notifications">
              <Button variant="outline" size="sm" className="flex-shrink-0">
                설정
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <h3 className="text-xl font-black mb-2">부모님께 리포트 보내기</h3>
          <p className="text-indigo-100 mb-4 text-sm">
            현재 지원 현황을 PDF로 정리해서 카톡으로 바로 전송할 수 있어요
          </p>
          <Link to="/jungsi/report">
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-6 py-3 h-auto">
              PDF 리포트 생성하기 <ArrowUpRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
