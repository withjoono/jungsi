import { createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createLazyFileRoute("/mock-analysis/_layout/score-analysis")({
  component: MockExamScoreAnalysisPage,
});

function MockExamScoreAnalysisPage() {
  const myScores = [
    { subject: "표준점수", korean: "120", math: "130", math2: "60", inquiry1: "65", inquiry2: "125", inquiry3: "-", english: "-", koreanHistory: "-", secondLang: "-" },
    { subject: "백분위", korean: "89", math: "89", math2: "89", inquiry1: "90", inquiry2: "95", inquiry3: "-", english: "-", koreanHistory: "-", secondLang: "-" },
    { subject: "등급", korean: "2", math: "2", math2: "2", inquiry1: "2", inquiry2: "2", inquiry3: "1", english: "2", koreanHistory: "2", secondLang: "-" },
    { subject: "상대등급", korean: "2", math: "2", math2: "2", inquiry1: "2", inquiry2: "2", inquiry3: "2%", english: "2%", koreanHistory: "2%", secondLang: "-" },
  ];

  const reflectionAnalysis = [
    { subject: "국어", a: "33.3", b: "100", c: "25", d: "130", e: "40", f: "100", g: "35", h: "120", total: "30%" },
    { subject: "수학", a: "33.3", b: "100", c: "40", d: "130", e: "40", f: "130", g: "35", h: "130", total: "30%" },
    { subject: "탐구", a: "33.3", b: "100", c: "35", d: "130", e: "40", f: "130", g: "35", h: "130", total: "40%" },
    { subject: "합계", a: "130", b: "300", c: "-", d: "390", e: "-", f: "370", g: "-", h: "395", total: "100%" },
    { subject: "등급", a: "1.5등급", b: "1.2등급", c: "-", d: "1.5등급", e: "-", f: "1.3등급", g: "-", h: "1.3등급", total: "-" },
  ];

  const combinationAnalysis = [
    { subject: "국어+수학+한국사", standardScore: "-", percentile: "-", grade: "-", relativeGrade: "97", rank: "1" },
    { subject: "국어+수학+한국사", standardScore: "-", percentile: "-", grade: "-", relativeGrade: "97", rank: "9" },
    { subject: "국어+영어", standardScore: "-", percentile: "-", grade: "-", relativeGrade: "97", rank: "3" },
    { subject: "국어+탐구", standardScore: "-", percentile: "-", grade: "-", relativeGrade: "97", rank: "4" },
    { subject: "국어+영어", standardScore: "90", percentile: "90", grade: "1", relativeGrade: "97", rank: "5" },
    { subject: "국어+탐구", standardScore: "90", percentile: "90", grade: "1", relativeGrade: "97", rank: "7" },
    { subject: "국어+", standardScore: "-", percentile: "-", grade: "-", relativeGrade: "97", rank: "6" },
    { subject: "국어", standardScore: "90", percentile: "90", grade: "1", relativeGrade: "97", rank: "2" },
  ];

  const chartData = [
    { name: "국어+수학+영어", value: 15 },
    { name: "국어+수학+탐구", value: 25 },
    { name: "국어+영어+탐구", value: 35 },
    { name: "국어+수학+탐구", value: 20 },
    { name: "국어+영어+탐구", value: 30 },
    { name: "국어+수학+영어", value: 25 },
    { name: "국어+수학+탐구", value: 40 },
    { name: "국어+영어+탐구", value: 35 },
    { name: "국어+수학+영어", value: 30 },
    { name: "국어+수학+탐구", value: 35 },
    { name: "국어+영어+탐구", value: 40 },
    { name: "국어+수학+영어", value: 45 },
  ];

  const maxChartValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <span>홈</span>
        <span>{">"}</span>
        <span>모의고사 분석</span>
        <span>{">"}</span>
        <span className="text-gray-900 font-medium">성적분석</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">성적 분석</h1>

      {/* My Scores Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">내 성적</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 text-sm font-medium text-gray-700">구분</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">국어</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">수학</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700 border-r">수학</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">탐구1</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">탐구2</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">탐구3</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">영어</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">한국사</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">제2외국어</th>
                </tr>
              </thead>
              <tbody>
                {myScores.map((row, index) => (
                  <tr key={index} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="p-3 text-sm font-medium text-gray-900 bg-gray-100">{row.subject}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.korean}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.math}</td>
                    <td className="p-3 text-sm text-center text-gray-900 border-r">{row.math2}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.inquiry1}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.inquiry2}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.inquiry3}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.english}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.koreanHistory}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.secondLang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reflection Ratio Analysis Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">반영비율 차이에 따른 분석 (국수탐(2) 기준)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th rowSpan={2} className="text-left p-2 text-xs font-medium text-gray-700 border-r">과목</th>
                    <th colSpan={2} className="text-center p-2 text-xs font-medium text-gray-700 border-r">A대학</th>
                    <th colSpan={2} className="text-center p-2 text-xs font-medium text-gray-700 border-r">B대학</th>
                    <th colSpan={2} className="text-center p-2 text-xs font-medium text-gray-700 border-r">C대학</th>
                    <th colSpan={2} className="text-center p-2 text-xs font-medium text-gray-700">D대학</th>
                    <th rowSpan={2} className="text-center p-2 text-xs font-medium text-gray-700">비율</th>
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <th className="text-center p-2 text-xs font-medium text-gray-700">반영비율</th>
                    <th className="text-center p-2 text-xs font-medium text-gray-700 border-r">내 점수</th>
                    <th className="text-center p-2 text-xs font-medium text-gray-700">반영비율</th>
                    <th className="text-center p-2 text-xs font-medium text-gray-700 border-r">내 점수</th>
                    <th className="text-center p-2 text-xs font-medium text-gray-700">반영비율</th>
                    <th className="text-center p-2 text-xs font-medium text-gray-700 border-r">내 점수</th>
                    <th className="text-center p-2 text-xs font-medium text-gray-700">반영비율</th>
                    <th className="text-center p-2 text-xs font-medium text-gray-700">내 점수</th>
                  </tr>
                </thead>
                <tbody>
                  {reflectionAnalysis.map((row, index) => (
                    <tr key={index} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="p-2 text-xs font-medium text-gray-900 bg-gray-100">{row.subject}</td>
                      <td className="p-2 text-xs text-center text-gray-900">{row.a}</td>
                      <td className="p-2 text-xs text-center text-gray-900 border-r">{row.b}</td>
                      <td className="p-2 text-xs text-center text-gray-900">{row.c}</td>
                      <td className="p-2 text-xs text-center text-gray-900 border-r">{row.d}</td>
                      <td className="p-2 text-xs text-center text-gray-900">{row.e}</td>
                      <td className="p-2 text-xs text-center text-gray-900 border-r">{row.f}</td>
                      <td className="p-2 text-xs text-center text-gray-900">{row.g}</td>
                      <td className="p-2 text-xs text-center text-gray-900">{row.h}</td>
                      <td className="p-2 text-xs text-center text-gray-900">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col">
              <div className="h-48 flex items-end justify-between space-x-1 mb-4">
                {["7월모의고사", "7월모의고사", "7월모의고사", "7월모의고사"].map((label, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-orange-500 rounded-t-sm" style={{ height: `${(index + 1) * 30 + 20}px` }}></div>
                    <div className="mt-2 text-xs text-gray-600 text-center transform -rotate-45 origin-top-left">{label}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4">반영 비율이 반영비율에 따라 대학별 내 점수가 다르게 산출되니 대학별 반영비율을 확인하여 지원전략을 세우시기 바랍니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combination Analysis Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">조합별 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 text-sm font-medium text-gray-700">과목</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">표준점수</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">백분위</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">등급</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">상대등급</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">순위</th>
                </tr>
              </thead>
              <tbody>
                {combinationAnalysis.map((row, index) => (
                  <tr key={index} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="p-3 text-sm font-medium text-gray-900 bg-gray-100">{row.subject}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.standardScore}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.percentile}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.grade}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.relativeGrade}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Level by Combination Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">조합별 성취수준</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-xs text-gray-700 text-right">{item.name}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2" style={{ width: `${(item.value / maxChartValue) * 100}%` }}>
                    <span className="text-xs text-white font-medium">{item.value}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
