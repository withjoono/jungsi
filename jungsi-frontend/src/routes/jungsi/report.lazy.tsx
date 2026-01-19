import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  Download,
  Share2,
  MessageSquare,
  Mail,
  Printer,
  Eye,
  GraduationCap,
  Trophy,
  Target,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceGate } from "@/components/try";

export const Route = createLazyFileRoute("/jungsi/report")({
  component: ReportPageWithGate,
});

function ReportPageWithGate() {
  return (
    <ServiceGate
      serviceCode="J"
      serviceName="정시 리포트"
      serviceColor="orange"
      purchaseLink="/products"
      tryLandingLink="/try/jungsi-prediction"
      allowTry={false}
      tryLimitDescription="리포트 기능은 정식 서비스에서만 이용 가능합니다"
    >
      <ReportPage />
    </ServiceGate>
  );
}

const mockUserData = {
  name: "김민준",
  birthYear: 2007,
  school: "서울고등학교",
  score: {
    korean: 131,
    math: 137,
    english: 1,
    history: 2,
    science1: 65,
    science2: 62,
  },
  standardScore: 289,
  percentile: 95.2,
};

const mockUniversities = [
  { name: "한양대", dept: "AI학과", group: "가군", probability: 91.2, status: "안전", rank: 156 },
  { name: "성균관대", dept: "글로벌경영", group: "나군", probability: 94.7, status: "안전", rank: 89 },
  { name: "한양대(ERICA)", dept: "경영학부", group: "다군", probability: 99.1, status: "안전", rank: 23 },
];

const groupColors = {
  "가군": "bg-rose-100 text-rose-600",
  "나군": "bg-violet-100 text-violet-600",
  "다군": "bg-emerald-100 text-emerald-600",
};

function ReportPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "image">("pdf");
  const [includeOptions, setIncludeOptions] = useState({
    score: true,
    universities: true,
    probability: true,
    competition: true,
    recommendation: true,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setIsGenerated(true);
  };

  const handleDownload = () => {
    // In real implementation, this would trigger PDF download
    alert("PDF 다운로드가 시작됩니다!");
  };

  const handleShareKakao = () => {
    alert("카카오톡으로 공유합니다!");
  };

  const overallProbability = mockUniversities.reduce((sum, u) => sum + u.probability, 0) / mockUniversities.length;
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-black">부모님용 PDF 리포트</h1>
          <p className="text-emerald-100 text-sm mt-1">
            현재 지원 현황을 정리하여 부모님께 전달하세요
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Preview Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">리포트 미리보기</h2>
            </div>
            <span className="text-xs text-gray-400">{today} 기준</span>
          </div>

          {/* Report Preview */}
          <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
            {/* Report Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-emerald-200">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4" />
                2026학년도 정시 지원 분석 리포트
              </div>
              <h3 className="text-3xl font-black text-gray-900">{mockUserData.name} 학생</h3>
              <p className="text-gray-500 mt-2">{mockUserData.school} | 생년: {mockUserData.birthYear}</p>
            </div>

            {/* Score Summary */}
            {includeOptions.score && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  수능 성적 요약
                </h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">표준점수 합계</p>
                      <p className="text-2xl font-black text-gray-900">{mockUserData.standardScore}점</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">전체 백분위</p>
                      <p className="text-2xl font-black text-indigo-600">{mockUserData.percentile}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">국어</p>
                      <p className="text-2xl font-black text-gray-900">{mockUserData.score.korean}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">수학</p>
                      <p className="text-2xl font-black text-gray-900">{mockUserData.score.math}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Universities */}
            {includeOptions.universities && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  지원 대학 현황
                </h4>
                <div className="space-y-3">
                  {mockUniversities.map((uni, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-sm px-3 py-1 rounded-full font-bold",
                          groupColors[uni.group as keyof typeof groupColors]
                        )}>
                          {uni.group}
                        </span>
                        <div>
                          <p className="font-bold text-gray-900">{uni.name} {uni.dept}</p>
                          <p className="text-gray-500 text-sm">현재 {uni.rank}위</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-2xl font-black",
                          uni.probability >= 90 ? "text-green-600" : "text-blue-600"
                        )}>
                          {uni.probability}%
                        </p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {uni.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Analysis */}
            {includeOptions.probability && (
              <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-6 text-center">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-80" />
                <p className="text-emerald-100 mb-2">종합 합격 예상률</p>
                <p className="text-5xl font-black">{overallProbability.toFixed(1)}%</p>
                <p className="text-emerald-100 mt-3">
                  현재 배치는 <span className="font-bold text-white">상위 5%</span> 안에 드는 최적의 선택입니다
                </p>
              </div>
            )}

            {/* Recommendation */}
            {includeOptions.recommendation && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  전문가 의견
                </h4>
                <p className="text-orange-600 text-sm leading-relaxed">
                  {mockUserData.name} 학생의 현재 배치는 매우 안정적입니다.
                  가군 한양대 AI학과는 최근 인기가 높아지고 있으나, 현재 성적으로는 충분히 합격 가능합니다.
                  나군과 다군은 안전권으로, 최소 1개 대학 이상 합격이 거의 확실합니다.
                  원서 접수 시까지 경쟁률 변동을 주시하시기 바랍니다.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-400 text-xs">
              <p>본 리포트는 {today} 기준으로 생성되었습니다.</p>
              <p>거북스쿨 정시 예측 서비스 | www.geobukschool.com</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="font-bold text-gray-900 mb-4">포함할 내용 선택</h3>
          <div className="space-y-3">
            {[
              { key: "score", label: "수능 성적 요약" },
              { key: "universities", label: "지원 대학 현황" },
              { key: "probability", label: "종합 합격 예상률" },
              { key: "competition", label: "경쟁률 분석" },
              { key: "recommendation", label: "전문가 의견" },
            ].map((option) => (
              <label
                key={option.key}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100"
              >
                <span className="font-medium text-gray-700">{option.label}</span>
                <input
                  type="checkbox"
                  checked={includeOptions[option.key as keyof typeof includeOptions]}
                  onChange={() =>
                    setIncludeOptions((prev) => ({
                      ...prev,
                      [option.key]: !prev[option.key as keyof typeof includeOptions],
                    }))
                  }
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="font-bold text-gray-900 mb-4">파일 형식</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedFormat("pdf")}
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                selectedFormat === "pdf"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <FileText className={cn(
                "w-8 h-8 mx-auto mb-2",
                selectedFormat === "pdf" ? "text-emerald-600" : "text-gray-400"
              )} />
              <p className={cn(
                "font-bold",
                selectedFormat === "pdf" ? "text-emerald-700" : "text-gray-600"
              )}>PDF 문서</p>
              <p className="text-gray-400 text-xs mt-1">인쇄 및 저장용</p>
            </button>
            <button
              onClick={() => setSelectedFormat("image")}
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                selectedFormat === "image"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Share2 className={cn(
                "w-8 h-8 mx-auto mb-2",
                selectedFormat === "image" ? "text-emerald-600" : "text-gray-400"
              )} />
              <p className={cn(
                "font-bold",
                selectedFormat === "image" ? "text-emerald-700" : "text-gray-600"
              )}>이미지</p>
              <p className="text-gray-400 text-xs mt-1">카톡 공유용</p>
            </button>
          </div>
        </div>

        {/* Generate Button */}
        {!isGenerated ? (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl h-auto text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                리포트 생성 중...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                리포트 생성하기
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-green-800">리포트가 생성되었습니다!</p>
                <p className="text-green-600 text-sm">아래 버튼으로 다운로드하거나 공유하세요</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleDownload}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 h-auto"
              >
                <Download className="w-5 h-5 mr-2" />
                다운로드
              </Button>
              <Button
                onClick={handleShareKakao}
                className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 h-auto"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                카톡 전송
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="py-4 h-auto">
                <Mail className="w-5 h-5 mr-2" />
                이메일 전송
              </Button>
              <Button variant="outline" className="py-4 h-auto">
                <Printer className="w-5 h-5 mr-2" />
                바로 인쇄
              </Button>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center">
          <Link to="/jungsi/dashboard" className="text-gray-500 text-sm hover:text-gray-700">
            ← 대시보드로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
