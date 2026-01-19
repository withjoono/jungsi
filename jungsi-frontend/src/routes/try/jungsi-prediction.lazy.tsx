/**
 * 정시 합격 예측 Try 랜딩 페이지
 * 무료 체험을 통해 서비스를 경험할 수 있는 페이지
 */

import { useState } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TryLandingTemplate, type TryFeature } from "@/components/try";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  IconChartBar,
  IconTarget,
  IconTrendingUp,
  IconUsers,
  IconSparkles,
  IconArrowRight,
} from "@tabler/icons-react";
import { USER_API } from "@/stores/server/features/me/apis";
import { useJungsiAccess, incrementTryUsage } from "@/hooks/use-service-access";

export const Route = createLazyFileRoute("/try/jungsi-prediction")({
  component: JungsiPredictionTryPage,
});

// 정시 합격 예측 기능 목록
const features: TryFeature[] = [
  {
    title: "합격 확률 예측",
    description: "수능 성적을 기반으로 대학별 합격 확률을 계산합니다.",
    available: true,
  },
  {
    title: "가/나/다군 분석",
    description: "각 군별 최적의 대학 조합을 추천받습니다.",
    available: true,
  },
  {
    title: "실시간 경쟁률 반영",
    description: "실시간 지원 현황을 반영한 예측을 제공합니다.",
    available: false,
  },
  {
    title: "맞춤형 전략 리포트",
    description: "개인별 맞춤 지원 전략 리포트를 받아보세요.",
    available: false,
  },
  {
    title: "무제한 시뮬레이션",
    description: "다양한 조합으로 무제한 시뮬레이션을 진행합니다.",
    available: false,
  },
  {
    title: "1:1 컨설팅 연결",
    description: "전문가와 1:1 상담을 진행할 수 있습니다.",
    available: false,
  },
];

// 샘플 대학 데이터
const sampleUniversities = [
  { name: "서울대학교", department: "경영학과", probability: 32, trend: "down" },
  { name: "연세대학교", department: "경영학과", probability: 58, trend: "up" },
  { name: "고려대학교", department: "경영학과", probability: 62, trend: "stable" },
  { name: "성균관대학교", department: "글로벌경영", probability: 78, trend: "up" },
  { name: "한양대학교", department: "경영학부", probability: 85, trend: "stable" },
];

function JungsiPredictionTryPage() {
  const navigate = useNavigate();
  const access = useJungsiAccess();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: USER_API.fetchCurrentUserAPI,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 체험 폼 상태
  const [showDemo, setShowDemo] = useState(false);
  const [koreanScore, setKoreanScore] = useState("");
  const [mathScore, setMathScore] = useState("");
  const [englishGrade, setEnglishGrade] = useState("");
  const [tamgu1Score, setTamgu1Score] = useState("");
  const [tamgu2Score, setTamgu2Score] = useState("");
  const [showResult, setShowResult] = useState(false);

  // 체험하기 버튼 클릭
  const handleStartTry = () => {
    if (access.hasService) {
      // 정식 서비스 이용 중이면 바로 이동
      navigate({ to: "/jungsi/score-input" });
    } else {
      // Try 모드 - 데모 표시
      setShowDemo(true);
    }
  };

  // 예측 실행
  const handlePredict = () => {
    if (!access.hasService) {
      // Try 카운트 증가
      incrementTryUsage("J");
    }
    setShowResult(true);
  };

  // 확률에 따른 색상
  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return "text-green-600 bg-green-50";
    if (prob >= 60) return "text-blue-600 bg-blue-50";
    if (prob >= 40) return "text-orange-500 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  // 확률에 따른 상태 텍스트
  const getProbabilityStatus = (prob: number) => {
    if (prob >= 80) return "안전";
    if (prob >= 60) return "적정";
    if (prob >= 40) return "소신";
    return "상향";
  };

  return (
    <TryLandingTemplate
      serviceName="정시 합격 예측"
      serviceDescription="수능 성적을 입력하면 대학별 합격 확률을 예측하고, 최적의 지원 전략을 추천해드립니다."
      serviceColor="orange"
      remainingCount={access.remainingTryCount}
      totalCount={access.tryLimit}
      features={features}
      purchaseLink="/products"
      onStartTry={handleStartTry}
      heroImage="/images/3D/인강 컴퓨터.png"
      isLoggedIn={!!user}
    >
      {/* 데모 섹션 */}
      {showDemo && (
        <div className="max-w-4xl mx-auto">
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
              <div className="flex items-center gap-2">
                <IconSparkles className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-xl">무료 체험 - 성적 입력</CardTitle>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                수능 성적을 입력하고 합격 확률을 확인해보세요!
                <Badge className="ml-2 bg-orange-100 text-orange-700">
                  체험 {access.remainingTryCount}회 남음
                </Badge>
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {!showResult ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="korean">국어 표준점수</Label>
                      <Input
                        id="korean"
                        type="number"
                        placeholder="예: 131"
                        value={koreanScore}
                        onChange={(e) => setKoreanScore(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="math">수학 표준점수</Label>
                      <Input
                        id="math"
                        type="number"
                        placeholder="예: 140"
                        value={mathScore}
                        onChange={(e) => setMathScore(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="english">영어 등급</Label>
                      <Select value={englishGrade} onValueChange={setEnglishGrade}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="등급 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                            <SelectItem key={grade} value={String(grade)}>
                              {grade}등급
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tamgu1">탐구1 표준점수</Label>
                      <Input
                        id="tamgu1"
                        type="number"
                        placeholder="예: 68"
                        value={tamgu1Score}
                        onChange={(e) => setTamgu1Score(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tamgu2">탐구2 표준점수</Label>
                      <Input
                        id="tamgu2"
                        type="number"
                        placeholder="예: 65"
                        value={tamgu2Score}
                        onChange={(e) => setTamgu2Score(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                      onClick={handlePredict}
                      disabled={!koreanScore || !mathScore || !englishGrade}
                    >
                      <IconChartBar className="w-5 h-5 mr-2" />
                      합격 확률 예측하기
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 결과 요약 */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-50 rounded-xl p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      예측 결과 (체험 버전)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      입력하신 성적을 기반으로 분석한 결과입니다.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-3xl font-bold text-orange-500">5</div>
                        <div className="text-sm text-gray-600">분석 대학</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-3xl font-bold text-green-500">2</div>
                        <div className="text-sm text-gray-600">안전권</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-3xl font-bold text-blue-500">2</div>
                        <div className="text-sm text-gray-600">적정권</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-3xl font-bold text-red-500">1</div>
                        <div className="text-sm text-gray-600">상향권</div>
                      </div>
                    </div>
                  </div>

                  {/* 대학별 결과 */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <IconTarget className="w-5 h-5 text-orange-500" />
                      대학별 합격 확률
                    </h4>
                    {sampleUniversities.map((univ, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {univ.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {univ.department}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={cn(
                              "font-semibold",
                              getProbabilityColor(univ.probability)
                            )}
                          >
                            {getProbabilityStatus(univ.probability)}
                          </Badge>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {univ.probability}%
                            </div>
                            <div className="text-xs text-gray-500">
                              합격 확률
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 제한 안내 */}
                  <div className="bg-gray-100 rounded-xl p-6 text-center">
                    <IconTrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">
                      더 자세한 분석을 원하시나요?
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      정식 서비스에서는 실시간 경쟁률, 맞춤형 전략 리포트,
                      <br />
                      무제한 시뮬레이션 등 더 많은 기능을 이용하실 수 있습니다.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowResult(false);
                          setKoreanScore("");
                          setMathScore("");
                          setEnglishGrade("");
                          setTamgu1Score("");
                          setTamgu2Score("");
                        }}
                      >
                        다시 입력하기
                      </Button>
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => navigate({ to: "/products" })}
                      >
                        정식 서비스 구매
                        <IconArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 서비스 통계 */}
      {!showDemo && (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              거북스쿨 정시 예측의 신뢰성
            </h2>
            <p className="text-gray-600">
              수많은 수험생들이 선택한 정시 합격 예측 서비스
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center p-6">
              <IconUsers className="w-10 h-10 text-orange-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">10,000+</div>
              <div className="text-sm text-gray-600">누적 사용자</div>
            </Card>
            <Card className="text-center p-6">
              <IconTarget className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">92%</div>
              <div className="text-sm text-gray-600">예측 적중률</div>
            </Card>
            <Card className="text-center p-6">
              <IconChartBar className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">분석 대학</div>
            </Card>
            <Card className="text-center p-6">
              <IconTrendingUp className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">7회</div>
              <div className="text-sm text-gray-600">예측컷 업데이트</div>
            </Card>
          </div>
        </div>
      )}
    </TryLandingTemplate>
  );
}
