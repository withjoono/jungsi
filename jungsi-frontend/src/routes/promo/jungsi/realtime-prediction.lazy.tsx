import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Radio,
  Clock,
  Database,
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Bell,
  CheckCircle,
  ArrowRight,
  Users,
  Timer,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/promo/jungsi/realtime-prediction")({
  component: RealtimePredictionPromo,
});

const primaryColor = "#f97316"; // orange-500

// 실시간 업데이트 시뮬레이션 데이터
const timelineData = [
  { time: "12/29 오후 4시", prob: 68.0, change: 0, applicants: 0 },
  { time: "12/29 오후 6시", prob: 67.8, change: -0.2, applicants: 12 },
  { time: "12/29 오후 10시", prob: 67.5, change: -0.3, applicants: 18 },
  { time: "12/30 오전 0시", prob: 67.2, change: -0.3, applicants: 27 },
  { time: "12/30 오전 9시", prob: 66.8, change: -0.4, applicants: 35 },
  { time: "12/30 오후 3시", prob: 66.1, change: -0.7, applicants: 52 },
];

// 작동 방식 스텝
const processSteps = [
  {
    icon: Database,
    title: "경쟁률 수집",
    description: "전국 230개 대학 원서접수 사이트에서 실시간 경쟁률을 5분마다 자동 수집",
    highlight: "230개 대학",
    color: "bg-blue-500",
  },
  {
    icon: Brain,
    title: "AI 분석",
    description: "4만 건의 정시 데이터로 학습한 AI가 최종 합격선 변화를 예측",
    highlight: "4만 건 학습",
    color: "bg-purple-500",
  },
  {
    icon: Zap,
    title: "즉시 반영",
    description: "30초 안에 나의 합격 확률에 새로운 예측 결과를 반영",
    highlight: "30초 내 갱신",
    color: "bg-green-500",
  },
  {
    icon: RefreshCw,
    title: "지속 업데이트",
    description: "하루 288번, 마감 직전까지 가장 정확한 숫자를 제공",
    highlight: "288회/일",
    color: "bg-orange-500",
  },
];

// 주요 특징
const features = [
  {
    icon: Clock,
    title: "5분마다 갱신",
    description: "접수 기간 동안 5분 간격으로 전국 대학 경쟁률 업데이트",
  },
  {
    icon: Users,
    title: "실시간 지원자 추적",
    description: "방금 늘어난 지원자 수까지 바로 확인 가능",
  },
  {
    icon: BarChart3,
    title: "변화 추이 시각화",
    description: "시간대별 확률 변화를 한눈에 파악",
  },
  {
    icon: Bell,
    title: "급변동 알림",
    description: "내 관심 학과 경쟁률 급등 시 즉시 알림",
  },
];

function RealtimePredictionPromo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedProb, setAnimatedProb] = useState(68.0);

  // 타임라인 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % timelineData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 확률 애니메이션
  useEffect(() => {
    const targetProb = timelineData[currentStep].prob;
    const diff = targetProb - animatedProb;
    if (Math.abs(diff) > 0.01) {
      const timer = setTimeout(() => {
        setAnimatedProb((prev) => prev + diff * 0.1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProb(targetProb);
    }
  }, [currentStep, animatedProb]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24">
          {/* 서비스 배지 */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              <Radio className="w-4 h-4 animate-pulse" />
              접수기간 중 실시간 서비스
            </span>
          </div>

          {/* 메인 타이틀 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white text-center mb-6">
            26 정시 실시간 예측 서비스
          </h1>

          {/* 핵심 메시지 */}
          <p className="text-xl md:text-2xl text-orange-100 text-center max-w-3xl mx-auto mb-8 leading-relaxed">
            "거북스쿨은 <span className="text-white font-bold">작년 데이터가 아니라</span>,{" "}
            <span className="text-white font-bold">지금 이 순간</span> 지원 상황을 보고 예측합니다."
          </p>

          {/* 서비스 기간 */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <p className="text-orange-200 text-sm">서비스 기간</p>
              <p className="text-white font-bold text-lg">12/29(월) ~ 12/31(수)</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <p className="text-orange-200 text-sm">업데이트 주기</p>
              <p className="text-white font-bold text-lg">5분마다</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <p className="text-orange-200 text-sm">대상 대학</p>
              <p className="text-white font-bold text-lg">전국 230개</p>
            </div>
          </div>

          {/* 실시간 데모 카드 */}
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm">고려대학교 경영학부</p>
                <p className="text-gray-400 text-xs">{timelineData[currentStep].time}</p>
              </div>
              <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                <Radio className="w-3 h-3 animate-pulse" />
                실시간
              </div>
            </div>

            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">합격 확률</p>
                <p className="text-5xl font-black" style={{ color: primaryColor }}>
                  {animatedProb.toFixed(1)}%
                </p>
              </div>
              {timelineData[currentStep].change !== 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
                    timelineData[currentStep].change < 0
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  )}
                >
                  {timelineData[currentStep].change < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  {timelineData[currentStep].change > 0 ? "+" : ""}
                  {timelineData[currentStep].change.toFixed(1)}%
                </div>
              )}
            </div>

            {timelineData[currentStep].applicants > 0 && (
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-orange-600 text-sm font-medium">
                  방금 지원자 <span className="font-bold">{timelineData[currentStep].applicants}명</span> 늘었음
                </p>
              </div>
            )}

            {/* 타임라인 인디케이터 */}
            <div className="flex justify-center gap-1.5 mt-4">
              {timelineData.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === currentStep ? "w-6 bg-orange-500" : "w-1.5 bg-gray-200"
                  )}
                />
              ))}
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

      {/* 왜 실시간인가 섹션 */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 <span style={{ color: primaryColor }}>실시간</span>이어야 할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              컷에 가장 영향을 많이 주는 것 중 하나가 <strong>경쟁률</strong>이란 것은 누구나 동감하실 겁니다.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* 왼쪽: 비교 */}
              <div className="space-y-6">
                <div className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-600">기존 예측 서비스</p>
                      <p className="text-sm text-gray-400">작년 데이터 기반</p>
                    </div>
                  </div>
                  <p className="text-gray-500">
                    작년 경쟁률과 합격선을 기준으로 예측하기 때문에,
                    <br />
                    <span className="text-red-500 font-medium">올해 변수를 반영하지 못함</span>
                  </p>
                </div>

                <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-300 relative">
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                    거북스쿨
                  </div>
                  <div className="flex items-center gap-3 mb-3 mt-2">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <Radio className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">실시간 예측 서비스</p>
                      <p className="text-sm text-orange-600">지금 이 순간 데이터</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    접수 기간 동안 실시간 경쟁률을 수집하여,
                    <br />
                    <span className="text-orange-600 font-bold">마감 직전까지 정확한 예측 제공</span>
                  </p>
                </div>
              </div>

              {/* 오른쪽: 통계 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white text-center">
                  <Timer className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-4xl font-black">5분</p>
                  <p className="text-orange-200 text-sm">업데이트 주기</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-4xl font-black">230</p>
                  <p className="text-blue-200 text-sm">대학 모니터링</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white text-center">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-4xl font-black">4만</p>
                  <p className="text-purple-200 text-sm">AI 학습 데이터</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-4xl font-black">288</p>
                  <p className="text-green-200 text-sm">일일 갱신 횟수</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 작동 방식 섹션 */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              어떻게 <span style={{ color: primaryColor }}>작동</span>하나요?
            </h2>
            <p className="text-xl text-gray-600">
              접수 기간 동안, 아래 과정을 <strong>매 5분마다</strong> 자동으로 반복합니다
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative">
                  {/* 연결선 */}
                  {idx < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gray-200">
                      <ArrowRight className="absolute right-0 -top-2 w-5 h-5 text-gray-300" />
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow relative z-10">
                    {/* 스텝 넘버 */}
                    <div
                      className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {idx + 1}
                    </div>

                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4", step.color)}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    >
                      {step.highlight}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 실시간 예시 섹션 */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              이렇게 <span style={{ color: primaryColor }}>변화</span>합니다
            </h2>
            <p className="text-xl text-gray-600">
              고려대 경영학부 예시 - 시간에 따른 합격 확률 변화
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              {timelineData.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all",
                    idx === currentStep ? "bg-orange-50 ring-2 ring-orange-300" : "bg-gray-50"
                  )}
                >
                  {/* 시간 */}
                  <div className="w-32 flex-shrink-0">
                    <p className={cn("font-medium", idx === currentStep ? "text-orange-600" : "text-gray-500")}>
                      {item.time}
                    </p>
                  </div>

                  {/* 확률 바 */}
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.prob}%`,
                          backgroundColor: idx === currentStep ? primaryColor : "#9ca3af",
                        }}
                      />
                    </div>
                  </div>

                  {/* 확률 */}
                  <div className="w-20 text-right">
                    <p
                      className={cn("text-xl font-bold", idx === currentStep ? "text-orange-600" : "text-gray-700")}
                    >
                      {item.prob}%
                    </p>
                  </div>

                  {/* 변화 */}
                  <div className="w-28">
                    {item.change !== 0 ? (
                      <div
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          item.change < 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        )}
                      >
                        {item.change < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {item.applicants > 0 && `+${item.applicants}명`}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">시작</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <p className="text-center text-orange-700">
                <strong>288번의 업데이트</strong>를 통해 마감 직전까지 가장 정확한 예측을 제공합니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 주요 특징 섹션 */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              핵심 <span style={{ color: primaryColor }}>기능</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="py-20 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            12월 29일, 실시간 예측을 시작하세요
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            접수 기간 동안 가장 정확한 합격 확률을 확인하고,
            <br />
            최적의 지원 전략을 세우세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/login">
              <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-lg px-8 py-6 rounded-xl shadow-lg h-auto">
                로그인하고 시작하기
              </Button>
            </Link>
            <Link to="/jungsi/realtime-dashboard">
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6 rounded-xl h-auto"
              >
                미리보기 체험
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
          </div>
        </div>
      </div>

      {/* 푸터 여백 */}
      <div className="h-8 bg-gray-50" />
    </div>
  );
}
