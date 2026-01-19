import { Link } from "@tanstack/react-router";
import { createLazyFileRoute } from "@tanstack/react-router";
import { IconChevronRight, IconDeviceMobile, IconChartBar, IconUserCheck, IconUser, IconSettings, IconFileText, IconCalculator, IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Flame, Radio, TrendingUp, MapPin, TrendingDown, Minus } from "lucide-react";
import ReactPlayer from "react-player";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/custom/button";
import { USER_API } from "@/stores/server/features/me/apis";
import { useGetInterestRegularAdmissions } from "@/stores/server/features/jungsi/queries";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import type { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";

export const Route = createLazyFileRoute("/jungsi/")({
  component: JungsiHome,
});

// 배너 슬라이드 데이터
const bannerSlides = [
  {
    id: 1,
    title: "거북스쿨 예측의 정확성",
    description: "타사와는 다른 거북스쿨만의 정확한 정시 예측 시스템",
    features: ["타사 현황 환산으로 실제 지원자 표본 수집", "무료 모의지원 어플로 무장한 표본 확대", "과거 컷라인 데이터 분석에 7차에 걸친 예측컷 업데이트"],
    image: "/images/3D/우승 트로피.png",
    bgColor: "#fe5e41",
  },
  {
    id: 2,
    title: "정시 합격 예측 서비스",
    description: "수능 성적 기반 맞춤형 정시 지원 전략을 제공합니다.",
    features: ["실시간 환산점수 계산", "가/나/다군 최적 배치", "위험도 분석 리포트"],
    image: "/images/3D/인강 컴퓨터.png",
    bgColor: "#2dd4c8",
  },
  {
    id: 3,
    title: "거북쌤 대면 컨설팅",
    description: "대치동 20년 경력의 거북쌤이 직접 컨설팅합니다.",
    features: ["비대면 컨설팅 3회", "최종 대면 컨설팅 1회", "카톡채널 수시 질의응답"],
    image: "/images/3D/스탠드 조명.png",
    bgColor: "#f7b538",
  },
];

// 프로그램 카드 데이터
const programs = [
  {
    title: "무료 정시 모의지원 앱",
    description: "국내유일 모의지원 전문 앱\n앱기반의 신속, 편리성\n사용자 확대와 데이터 교류를 위한 협력 고교 확대중",
    price: "무료",
    imageUrl: "/images/ETC/무료 모의지원 앱.jpg",
    href: "/products",
    icon: IconDeviceMobile,
  },
  {
    title: "2026 정시합격예측",
    description: "예측은 당근, 단계별 프로세스식 최적 조합 제시\n무료 모의지원 앱 '거북정모'에서 교차지원률, 연쇄이동률 파악 예측컷에 반영",
    price: "유료 - 59,000원",
    imageUrl: "/images/ETC/정시.jpg",
    href: "/products",
    icon: IconChartBar,
  },
  {
    title: "거북쌤의 대면 컨설팅",
    description: "비대면 1회 + 모의지원과 경쟁율 변동에 맞춘 지원 의견서 총 3회 + 지원기간 긴급 상담 무제한",
    price: "유료 - 50만원",
    imageUrl: "/images/ETC/거북쌤.png",
    href: "/products",
    icon: IconUserCheck,
  },
];

// 컨설팅 특장점
const consultingFeatures = [
  { title: "단계별 필터링 프로세스로 본인에게 최적의 대학 제시(특허출원)" },
  { title: "특정 대학/학과의 나에게 '유불리한 점수 차이' 제시(특허출원)" },
  { title: "계정 공유로 주변 선생님, 지인과 함께 거북스쿨 정시 서비스를 공유하면서 협의 가능" },
  { title: "AI 정시 컨설팅 챗봇 이용 가능(12월 둘째주까지)" },
  { title: "대치동 22년 학원장의 '정시 컨설팅 노하우'를 집대성" },
];

// 군별 실시간 예측 데이터
interface RankingItem {
  id: string;
  univ: string;
  prob: number;
  change: number;
  hot: boolean;
}

// 미사용 - 필요시 사용
// const initialRankingsByGroup: Record<string, RankingItem[]> = {
//   가군: [],
//   나군: [],
//   다군: [],
// };

// IRegularAdmission을 RankingItem으로 변환하는 함수
const transformToRankingItems = (admissions: IRegularAdmission[] | undefined): RankingItem[] => {
  if (!admissions || admissions.length === 0) return [];
  return admissions.map((admission) => {
    // 대학명 + 모집단위명 조합
    const univName = admission.university?.name || "대학명 없음";
    const recruitmentName = admission.recruitmentName || admission.admissionName || "";
    const displayName = recruitmentName ? `${univName} ${recruitmentName}` : univName;

    // 합격 확률 계산 (minCutPercent 기반, 없으면 기본값 70%)
    const prob = admission.minCutPercent
      ? Math.min(99.9, Math.max(0, 100 - parseFloat(admission.minCutPercent)))
      : 70;

    return {
      id: String(admission.id),
      univ: displayName,
      prob: Math.round(prob * 10) / 10,
      change: 0, // 실시간 변동은 초기값 0
      hot: prob < 50, // 50% 미만이면 hot으로 표시
    };
  });
};

// 확률에 따른 색상 반환
const getBarColor = (prob: number): string => {
  if (prob >= 90) return "#22c55e"; // green-500 - 안전
  if (prob >= 70) return "#3b82f6"; // blue-500 - 적정
  if (prob >= 50) return "#f97316"; // orange-500 - 소신
  return "#ef4444"; // red-500 - 상향
};

// 확률에 따른 상태 텍스트
const getStatusText = (prob: number): string => {
  if (prob >= 90) return "안전";
  if (prob >= 70) return "적정";
  if (prob >= 50) return "소신";
  return "상향";
};

// 확률에 따른 상태 색상
const getStatusColor = (prob: number): string => {
  if (prob >= 90) return "bg-green-100 text-green-700";
  if (prob >= 70) return "bg-blue-100 text-blue-700";
  if (prob >= 50) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
};

const primaryColor = "#f97316"; // orange-500

// ==========================================
// 로그인 후 대시보드 컴포넌트
// ==========================================
interface DashboardProps {
  user: unknown;
  hasJungsiService: boolean;
  rankingsByGroup: Record<string, RankingItem[]>;
  selectedGroup: "가군" | "나군" | "다군";
  setSelectedGroup: (group: "가군" | "나군" | "다군") => void;
  currentTime: Date;
  formatTime: (date: Date) => string;
}

function JungsiDashboard({
  user,
  hasJungsiService,
  rankingsByGroup,
  selectedGroup,
  setSelectedGroup,
  currentTime: _currentTime,
  formatTime: _formatTime,
}: DashboardProps) {
  // 모의고사 성적 조회
  const { data: mockExamScores } = useGetMockExamStandardScores();

  // 성적 입력 여부 확인
  const hasScores = mockExamScores?.data && mockExamScores.data.length > 0;

  // 빠른 메뉴
  const quickMenus = [
    { title: "성적 입력", icon: IconCalculator, href: "/jungsi/score-input", color: "bg-blue-500" },
    { title: "분석 리포트", icon: IconFileText, href: "/jungsi/report", color: "bg-green-500" },
    { title: "설정", icon: IconSettings, href: "/users/profile", color: "bg-gray-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 대시보드 헤더 */}
      <div className="w-full bg-gradient-to-r from-orange-500 to-orange-600 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <IconUser className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.nickname}님, 환영합니다!</h1>
                <p className="text-orange-100">
                  {user.memberType === 'teacher' ? '멘토' : user.memberType === 'parent' ? '학부모' : '학생'} 계정
                </p>
              </div>
            </div>
            <div className="text-right">
              {hasJungsiService ? (
                <span className="inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
                  정시 서비스 이용중
                </span>
              ) : (
                <Link to="/products">
                  <Button className="bg-white text-orange-500 hover:bg-orange-50">
                    정시 서비스 신청하기
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 성적 미입력 안내 배너 */}
      {!hasScores && (
        <div className="container mx-auto px-4 pt-6">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                  <IconAlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800">성적을 입력해야, 데이터가 보입니다</h3>
                  <p className="text-amber-700">수능 성적을 입력하시면 맞춤형 대학 분석과 합격 예측을 확인하실 수 있습니다.</p>
                </div>
              </div>
              <Link to="/jungsi/score-input">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 text-base whitespace-nowrap">
                  성적 입력 바로가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 빠른 메뉴 */}
      <div className={cn("container mx-auto px-4", hasScores ? "-mt-6" : "mt-6")}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickMenus.map((menu, idx) => {
            const Icon = menu.icon;
            return (
              <Link key={idx} to={menu.href}>
                <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", menu.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900">{menu.title}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 군별 실시간 예측 섹션 */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">군별 실시간 합격 예측</h2>
                <p className="text-base text-orange-500">(현재는 정적 합격율을 보여드리지만, 접수 기간 동안 <span className="font-bold underline">실시간 경쟁율 추이를 반영한 동적인 합격 예측율</span>을 보여줍니다)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-sm text-green-600 font-medium">실시간</span>
            </div>
          </div>

          {/* 군 탭 */}
          <div className="flex gap-2 mb-6">
            {(["가군", "나군", "다군"] as const).map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all",
                  selectedGroup === group
                    ? "bg-orange-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {group}
              </button>
            ))}
          </div>

          {/* 3개 군 모두 표시 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {(["가군", "나군", "다군"] as const).map((group) => {
              const groupData = [...rankingsByGroup[group]]
                .sort((a, b) => b.prob - a.prob)
                .map((item) => ({
                  ...item,
                  shortName: item.univ.split(" ")[0],
                }));

              return (
                <div
                  key={group}
                  className={cn(
                    "bg-white rounded-2xl p-5 border-2 transition-all",
                    selectedGroup === group
                      ? "border-orange-400 shadow-lg"
                      : "border-gray-100"
                  )}
                >
                  <h3 className={cn(
                    "text-lg font-bold mb-4 flex items-center gap-2",
                    selectedGroup === group ? "text-orange-500" : "text-gray-700"
                  )}>
                    {group}
                    {selectedGroup === group && (
                      <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">
                        선택됨
                      </span>
                    )}
                  </h3>

                  {/* 수평 막대 그래프 */}
                  <div className="space-y-2.5">
                    {groupData.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="w-14 text-xs text-gray-600 text-right truncate">
                          {item.shortName}
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
                        {item.hot && <Flame className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>

                  {/* 상세 리스트 */}
                  <div className="mt-4 space-y-1.5">
                    {rankingsByGroup[group].map((item, idx) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg text-sm",
                          item.hot ? "bg-red-50" : "bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-gray-400 rounded-full">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-gray-800 truncate max-w-[120px]">
                            {item.univ}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", getStatusColor(item.prob))}>
                            {getStatusText(item.prob)}
                          </span>
                          <span
                            className={cn(
                              "text-xs flex items-center",
                              item.change > 0 ? "text-green-600" : item.change < 0 ? "text-red-600" : "text-gray-500"
                            )}
                          >
                            {item.change > 0 && <ArrowUp className="w-3 h-3" />}
                            {item.change < 0 && <ArrowDown className="w-3 h-3" />}
                            {item.change !== 0 && `${item.change > 0 ? "+" : ""}${item.change.toFixed(1)}`}
                          </span>
                          {item.hot && <Flame className="w-3 h-3 text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 범례 */}
          <div className="flex justify-center gap-4 mt-6 text-xs">
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
      </div>
    </div>
  );
}

// ==========================================
// 로그인 전 홍보 페이지 컴포넌트
// ==========================================
interface PromoProps {
  api: any;
  setApi: (api: any) => void;
  current: number;
  rankingsByGroup: Record<string, RankingItem[]>;
  selectedGroup: "가군" | "나군" | "다군";
  setSelectedGroup: (group: "가군" | "나군" | "다군") => void;
  currentTime: Date;
  formatTime: (date: Date) => string;
}

function JungsiPromo({
  api,
  setApi,
  current,
  rankingsByGroup,
  selectedGroup,
  setSelectedGroup,
  currentTime: _currentTime,
  formatTime: _formatTime,
}: PromoProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner Section */}
      <div className="w-full py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* 캐러셀 영역 */}
            <div className="flex-1 lg:flex-[2]">
              <Carousel
                setApi={setApi}
                opts={{ align: "start", loop: true }}
                plugins={[
                  Autoplay({
                    delay: 5000,
                    stopOnInteraction: false,
                    stopOnMouseEnter: true,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent>
                  {bannerSlides.map((slide) => (
                    <CarouselItem key={slide.id}>
                      <div
                        className="rounded-2xl overflow-hidden h-[280px] flex items-center"
                        style={{ backgroundColor: slide.bgColor }}
                      >
                        <div className="flex-1 p-6 md:p-8">
                          <h2 className="mb-2 text-xl font-bold text-white md:text-2xl">
                            {slide.title}
                          </h2>
                          <p className="mb-4 text-sm text-white/80">
                            {slide.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {slide.features.map((feature, idx) => (
                              <span
                                key={idx}
                                className="inline-block rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-[180px] h-[220px] md:w-[220px] md:h-[260px] pr-4">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-contain drop-shadow-lg"
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {bannerSlides.map((_, index) => (
                    <button
                      key={index}
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: current === index ? "24px" : "8px",
                        backgroundColor: current === index ? primaryColor : "#d1d5db",
                      }}
                      onClick={() => api?.scrollTo(index)}
                    />
                  ))}
                </div>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>

            {/* 사용자 정보 패널 (비로그인) */}
            <div className="lg:flex-1">
              <Card className="h-[280px] border-gray-100 shadow-sm flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-sm text-gray-500">
                    2026 정시 서비스
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col justify-center">
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <IconUser className="h-7 w-7 text-gray-400" />
                    </div>
                    <p className="text-center text-sm text-gray-500">
                      로그인하시면 정시 서비스를
                      <br />
                      이용하실 수 있습니다.
                    </p>
                    <Link to="/auth/login" className="w-full">
                      <Button className="w-full text-white" style={{ backgroundColor: primaryColor }}>
                        로그인
                      </Button>
                    </Link>
                    <Link to="/auth/register" className="w-full">
                      <Button variant="outline" className="w-full">
                        회원가입
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 무료 체험 CTA 배너 */}
      <div className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">
                대학별 유불리, 직접 체험해보세요!
              </h3>
              <p className="text-teal-100">
                내 점수로 어느 대학이 유리한지 무료로 확인해보세요. 상위 3개 대학 결과를 무료로 제공합니다.
              </p>
            </div>
            <Link to="/jungsi/demo">
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-teal-50 font-bold px-8 py-6 text-lg shadow-lg"
              >
                무료 체험하기 →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 프로그램 카드 섹션 */}
      <div className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              2026년 <span style={{ color: primaryColor }}>정시 프로그램</span>
            </h2>
            <p className="text-gray-500">거북스쿨만의 차별화된 정시 예측 서비스</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {programs.map((program, index) => {
              const Icon = program.icon;
              return (
                <Link
                  key={index}
                  to={program.href}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative w-full h-96 overflow-hidden">
                    <img
                      src={program.imageUrl}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                      </div>
                      <span
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                      >
                        {program.price}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{program.title}</h3>
                    <p className="text-gray-500 text-sm whitespace-pre-line line-clamp-3 mb-4">
                      {program.description}
                    </p>
                    <div
                      className="flex items-center text-sm font-medium group-hover:gap-2 transition-all"
                      style={{ color: primaryColor }}
                    >
                      <span>자세히 보기</span>
                      <IconChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 컨설팅 특장점 */}
          <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              정시 컨설팅 <span style={{ color: primaryColor }}>특장점</span>
            </h3>
            <div className="space-y-4">
              {consultingFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-5 border border-gray-100">
                  <h4 className="font-semibold text-gray-900 flex items-start gap-2">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {index + 1}
                    </span>
                    {feature.title}
                  </h4>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/products">
                <button
                  className="px-8 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  정시 프로그램 신청하기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 거북스쿨 정시 서비스 특징 - 대제목 */}
      <div className="w-full bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              거북스쿨 <span style={{ color: primaryColor }}>정시 서비스 특징</span>
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="w-16 h-1 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>
          </div>
        </div>
      </div>

      {/* 특징 1: 26 정시 실시간 예측 (배경색 있음) */}
      <div className="w-full bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* 왼쪽: 글 */}
              <div className="flex-1 lg:pr-8">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <TrendingUp className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">26 정시 실시간 예측</h3>
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  <span className="font-semibold" style={{ color: primaryColor }}>
                    "작년 데이터가 아닌, 지금 이 순간 지원 상황을 예측합니다."
                  </span>
                </p>
                <div className="space-y-4 text-gray-600">
                  <p>
                    접수 기간(12/29~12/31) 동안 <span className="font-semibold text-gray-800">매 5분마다 전국 230개 대학</span>의
                    실시간 경쟁률을 수집합니다.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">124만 건의 정시 데이터로 학습한 AI</span>가
                    "지금 이 경쟁률이면 최종 합격선이 얼마나 갈까?"를 즉시 계산합니다.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">하루 288번 갱신</span>으로
                    마감 직전까지 가장 정확한 합격 예측을 제공합니다.
                  </p>
                </div>
                <div className="mt-8">
                  <Link to="/promo/jungsi/realtime-prediction">
                    <Button
                      variant="outline"
                      className="border-orange-500 text-orange-500 hover:bg-orange-50"
                    >
                      자세히 알아보기 →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 오른쪽: 미니 실시간 예측 박스 */}
              <div className="flex-1 lg:max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                  {/* 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <span className="font-bold text-gray-900">실시간 예측</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-green-500 animate-pulse" />
                      <span className="text-xs text-green-600 font-medium">LIVE</span>
                    </div>
                  </div>

                  {/* 미니 군 탭 */}
                  <div className="flex gap-1 mb-4">
                    {(["가군", "나군", "다군"] as const).map((group) => (
                      <button
                        key={group}
                        onClick={() => setSelectedGroup(group)}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all",
                          selectedGroup === group
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                      >
                        {group}
                      </button>
                    ))}
                  </div>

                  {/* 미니 막대 그래프 */}
                  <div className="space-y-2">
                    {[...rankingsByGroup[selectedGroup]]
                      .sort((a, b) => b.prob - a.prob)
                      .slice(0, 4)
                      .map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="w-12 text-xs text-gray-600 text-right truncate">
                            {item.univ.split(" ")[0]}
                          </span>
                          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
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
                          {item.hot && <Flame className="w-3 h-3 text-red-500 flex-shrink-0" />}
                        </div>
                      ))}
                  </div>

                  {/* 미니 범례 */}
                  <div className="flex justify-center gap-3 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-green-500"></span>
                      안전
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-blue-500"></span>
                      적정
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-orange-500"></span>
                      소신
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-red-500"></span>
                      상향
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link to="/auth/login">
                      <Button
                        className="w-full text-white text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        로그인하고 내 예측 확인 →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 특징 2: 경쟁률 실시간 히트맵 (배경색 없음) */}
      <div className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row-reverse gap-8 items-center">
              {/* 오른쪽: 미니 히트맵 박스 */}
              <div className="flex-1 lg:max-w-md">
                <div className="bg-gray-50 rounded-2xl shadow-lg p-5 border border-gray-100">
                  {/* 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <span className="font-bold text-gray-900">실시간 히트맵</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-red-500" />
                        과열
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-green-500" />
                        기회
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-blue-500" />
                        안정
                      </span>
                    </div>
                  </div>

                  {/* 미니 히트맵 그리드 */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "서울대", ratio: "4.2:1", status: "hot", change: 0.3 },
                      { name: "연세대", ratio: "3.8:1", status: "cold", change: -0.2 },
                      { name: "고려대", ratio: "3.5:1", status: "stable", change: 0 },
                      { name: "서강대", ratio: "2.9:1", status: "hot", change: 0.5 },
                      { name: "성균관대", ratio: "3.2:1", status: "stable", change: 0 },
                      { name: "한양대", ratio: "2.7:1", status: "cold", change: -0.4 },
                    ].map((univ, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-2 rounded-lg border text-center",
                          univ.status === "hot" && "bg-red-50 border-red-200",
                          univ.status === "cold" && "bg-green-50 border-green-200",
                          univ.status === "stable" && "bg-blue-50 border-blue-200"
                        )}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              univ.status === "hot" && "bg-red-500",
                              univ.status === "cold" && "bg-green-500",
                              univ.status === "stable" && "bg-blue-500"
                            )}
                          />
                          <span className="text-xs font-bold text-gray-800">{univ.name}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs font-medium text-gray-600">{univ.ratio}</span>
                          {univ.change !== 0 && (
                            <span
                              className={cn(
                                "text-[10px] flex items-center",
                                univ.change > 0 ? "text-red-500" : "text-green-500"
                              )}
                            >
                              {univ.change > 0 ? (
                                <TrendingUp className="w-2.5 h-2.5" />
                              ) : (
                                <TrendingDown className="w-2.5 h-2.5" />
                              )}
                            </span>
                          )}
                          {univ.change === 0 && <Minus className="w-2.5 h-2.5 text-gray-400" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 설명 */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-center text-gray-600">
                      <span className="text-red-500 font-medium">빨강</span> = 지원자 증가 |{" "}
                      <span className="text-green-500 font-medium">초록</span> = 지원자 감소 |{" "}
                      <span className="text-blue-500 font-medium">파랑</span> = 안정
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link to="/auth/login">
                      <Button
                        className="w-full text-white text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        로그인하고 히트맵 보기 →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 왼쪽: 글 */}
              <div className="flex-1 lg:pl-8">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">경쟁률 실시간 히트맵</h3>
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  <span className="font-semibold" style={{ color: primaryColor }}>
                    "한 화면에서 전국 모든 대학의 경쟁률 변화를 실시간으로"
                  </span>
                </p>
                <div className="space-y-4 text-gray-600">
                  <p>
                    매년 <span className="font-semibold text-gray-800">1,200명 이상</span>이 마감 직전 허둥지둥
                    잘못된 곳에 지원합니다. 더 이상 탭 돌려가며 확인하지 마세요.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">230개 대학 · 1,200개 모집단위</span>를
                    5분마다 자동으로 확인하고, 색상으로 즉시 상황을 파악합니다.
                  </p>
                  <p>
                    관심 대학만 <span className="font-semibold text-gray-800">찜</span>해놓으면
                    경쟁률 변동 시 <span className="font-semibold text-gray-800">즉시 알림</span>을 받을 수 있습니다.
                  </p>
                </div>
                <div className="mt-8">
                  <Link to="/promo/jungsi/realtime-heatmap">
                    <Button
                      variant="outline"
                      className="border-orange-500 text-orange-500 hover:bg-orange-50"
                    >
                      자세히 알아보기 →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube 영상 섹션 */}
      <div className="w-full bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              정시 서비스 <span style={{ color: primaryColor }}>영상 안내</span>
            </h2>
            <p className="text-gray-500">거북스쿨 정시 서비스 사용법을 영상으로 확인하세요</p>
          </div>
          <div className="flex flex-col gap-8 md:flex-row max-w-5xl mx-auto">
            <div className="flex-1">
              <div className="relative w-full pt-[56.25%] rounded-2xl overflow-hidden shadow-lg">
                <ReactPlayer
                  url="https://www.youtube.com/watch?v=K7ZGIsuYISo"
                  width="100%"
                  controls
                  height="100%"
                  className="absolute inset-0 left-0 top-0 h-full w-full"
                />
              </div>
              <p className="mt-4 text-center text-muted-foreground font-medium">
                정시 서비스 사용안내
              </p>
            </div>

            <div className="flex-1">
              <div className="relative w-full pt-[56.25%] rounded-2xl overflow-hidden shadow-lg">
                <ReactPlayer
                  url="https://www.youtube.com/watch?v=PO_GI9diEvc"
                  width="100%"
                  controls
                  height="100%"
                  className="absolute inset-0 left-0 top-0 h-full w-full"
                />
              </div>
              <p className="mt-4 text-center text-muted-foreground font-medium">
                정시 지원 시 나에게 유리한 대학 찾는 법
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 메인 컴포넌트 (로그인 여부에 따라 분기)
// ==========================================
function JungsiHome() {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<"가군" | "나군" | "다군">("가군");
  const [currentTime, setCurrentTime] = useState(new Date());

  // 사용자 정보 조회
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: USER_API.fetchCurrentUserAPI,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 활성 서비스 조회 (계약 기반)
  const { data: activeServiceCodes } = useQuery({
    queryKey: ["me", "active"],
    queryFn: USER_API.fetchCurrentUserActiveServicesAPI,
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 정시(J) 또는 통합(J포함) 서비스 이용 중 여부
  const hasJungsiService = activeServiceCodes?.includes("J") || false;

  // 관심대학 API 조회 (군별)
  const { data: gagunData } = useGetInterestRegularAdmissions("가");
  const { data: nagunData } = useGetInterestRegularAdmissions("나");
  const { data: dagunData } = useGetInterestRegularAdmissions("다");

  // API 데이터를 RankingItem 형태로 변환
  const rankingsByGroup = useMemo<Record<string, RankingItem[]>>(() => {
    const gagunItems = transformToRankingItems(gagunData);
    const nagunItems = transformToRankingItems(nagunData);
    const dagunItems = transformToRankingItems(dagunData);

    // 데이터가 없으면 빈 배열 반환
    return {
      가군: gagunItems,
      나군: nagunItems,
      다군: dagunItems,
    };
  }, [gagunData, nagunData, dagunData]);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // 타이머 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const formatTime = (date: Date) => {
    return date.toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 로그인 여부에 따라 다른 페이지 렌더링
  if (user) {
    return (
      <JungsiDashboard
        user={user}
        hasJungsiService={hasJungsiService}
        rankingsByGroup={rankingsByGroup}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        currentTime={currentTime}
        formatTime={formatTime}
      />
    );
  }

  return (
    <JungsiPromo
      api={api}
      setApi={setApi}
      current={current}
      rankingsByGroup={rankingsByGroup}
      selectedGroup={selectedGroup}
      setSelectedGroup={setSelectedGroup}
      currentTime={currentTime}
      formatTime={formatTime}
    />
  );
}
