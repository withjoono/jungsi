import { createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import { useMemo } from "react";

export const Route = createLazyFileRoute("/jungsi/_layout/score-analysis")({
  component: JungsiScoreAnalysisPage,
});

function JungsiScoreAnalysisPage() {
  const { data: standardScores, isLoading } = useGetMockExamStandardScores();

  // 점수 데이터 정리
  const scoreData = useMemo(() => {
    if (!standardScores?.data) {
      return {
        korean: { standardScore: "-", percentile: "-", grade: "-" },
        math: { standardScore: "-", percentile: "-", grade: "-" },
        inquiry1: { standardScore: "-", percentile: "-", grade: "-" },
        inquiry2: { standardScore: "-", percentile: "-", grade: "-" },
        english: { standardScore: "-", percentile: "-", grade: "-" },
        koreanHistory: { standardScore: "-", percentile: "-", grade: "-" },
        secondLang: { standardScore: "-", percentile: "-", grade: "-" },
      };
    }

    const scores = standardScores.data;

    // 국어 점수 찾기 (S1: 언어와매체, S2: 화법과작문)
    const koreanScore = scores.find(
      (s) => s.code === "S1" || s.code === "S2"
    );

    // 수학 점수 찾기 (S4: 미적분, S5: 기하, S6: 확률과통계)
    const mathScore = scores.find(
      (s) => s.code === "S4" || s.code === "S5" || s.code === "S6"
    );

    // 탐구 점수 찾기 (science: S10-S17, society: S18-S26)
    const inquiryScores = scores.filter(
      (s) => s.subjectCategory === "science" || s.subjectCategory === "society"
    );
    const inquiry1Score = inquiryScores[0];
    const inquiry2Score = inquiryScores[1];

    // 영어 점수 (S8)
    const englishScore = scores.find((s) => s.code === "S8");

    // 한국사 점수 (S9)
    const historyScore = scores.find((s) => s.code === "S9");

    // 제2외국어 점수 (S27-S35)
    const langScore = scores.find((s) =>
      ["S27", "S28", "S29", "S30", "S31", "S32", "S33", "S34", "S35"].includes(s.code)
    );

    return {
      korean: {
        standardScore: koreanScore?.standardScore || "-",
        percentile: koreanScore?.percentile?.toString() || "-",
        grade: koreanScore?.grade?.toString() || "-",
      },
      math: {
        standardScore: mathScore?.standardScore || "-",
        percentile: mathScore?.percentile?.toString() || "-",
        grade: mathScore?.grade?.toString() || "-",
      },
      inquiry1: {
        standardScore: inquiry1Score?.standardScore || "-",
        percentile: inquiry1Score?.percentile?.toString() || "-",
        grade: inquiry1Score?.grade?.toString() || "-",
      },
      inquiry2: {
        standardScore: inquiry2Score?.standardScore || "-",
        percentile: inquiry2Score?.percentile?.toString() || "-",
        grade: inquiry2Score?.grade?.toString() || "-",
      },
      english: {
        standardScore: "-", // 영어는 표준점수 없음
        percentile: "-", // 영어는 백분위 없음
        grade: englishScore?.grade?.toString() || "-",
      },
      koreanHistory: {
        standardScore: "-", // 한국사는 표준점수 없음
        percentile: "-", // 한국사는 백분위 없음
        grade: historyScore?.grade?.toString() || "-",
      },
      secondLang: {
        standardScore: "-", // 제2외국어는 표준점수 없음
        percentile: "-", // 제2외국어는 백분위 없음
        grade: langScore?.grade?.toString() || "-",
      },
    };
  }, [standardScores]);

  // 합계 및 평균 계산
  const calculations = useMemo(() => {
    const parseScore = (value: string) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

    // 표준점수 합계 (국어, 수학, 탐구1, 탐구2만 - 표준점수가 있는 과목)
    const standardScoreValues = [
      parseScore(scoreData.korean.standardScore),
      parseScore(scoreData.math.standardScore),
      parseScore(scoreData.inquiry1.standardScore),
      parseScore(scoreData.inquiry2.standardScore),
    ];
    const validStandardScores = standardScoreValues.filter((v) => v > 0);
    const standardScoreSum = validStandardScores.reduce((a, b) => a + b, 0);
    const standardScoreAvg = validStandardScores.length > 0
      ? (standardScoreSum / validStandardScores.length).toFixed(1)
      : "-";

    // 백분위 합계 (국어, 수학, 탐구1, 탐구2만 - 백분위가 있는 과목)
    const percentileValues = [
      parseScore(scoreData.korean.percentile),
      parseScore(scoreData.math.percentile),
      parseScore(scoreData.inquiry1.percentile),
      parseScore(scoreData.inquiry2.percentile),
    ];
    const validPercentiles = percentileValues.filter((v) => v > 0);
    const percentileSum = validPercentiles.reduce((a, b) => a + b, 0);
    const percentileAvg = validPercentiles.length > 0
      ? (percentileSum / validPercentiles.length).toFixed(1)
      : "-";

    // 등급 합계 (모든 과목)
    const gradeValues = [
      parseScore(scoreData.korean.grade),
      parseScore(scoreData.math.grade),
      parseScore(scoreData.inquiry1.grade),
      parseScore(scoreData.inquiry2.grade),
      parseScore(scoreData.english.grade),
      parseScore(scoreData.koreanHistory.grade),
      parseScore(scoreData.secondLang.grade),
    ];
    const validGrades = gradeValues.filter((v) => v > 0);
    const gradeSum = validGrades.reduce((a, b) => a + b, 0);
    const gradeAvg = validGrades.length > 0
      ? (gradeSum / validGrades.length).toFixed(2)
      : "-";

    return {
      standardScore: {
        sum: standardScoreSum > 0 ? standardScoreSum.toString() : "-",
        avg: standardScoreAvg,
      },
      percentile: {
        sum: percentileSum > 0 ? percentileSum.toString() : "-",
        avg: percentileAvg,
      },
      grade: {
        sum: gradeSum > 0 ? gradeSum.toString() : "-",
        avg: gradeAvg,
      },
    };
  }, [scoreData]);

  const myScores = [
    {
      subject: "표준점수",
      korean: scoreData.korean.standardScore,
      math: scoreData.math.standardScore,
      inquiry1: scoreData.inquiry1.standardScore,
      inquiry2: scoreData.inquiry2.standardScore,
      english: scoreData.english.standardScore,
      koreanHistory: scoreData.koreanHistory.standardScore,
      secondLang: scoreData.secondLang.standardScore,
      sum: calculations.standardScore.sum,
      avg: calculations.standardScore.avg,
    },
    {
      subject: "백분위",
      korean: scoreData.korean.percentile,
      math: scoreData.math.percentile,
      inquiry1: scoreData.inquiry1.percentile,
      inquiry2: scoreData.inquiry2.percentile,
      english: scoreData.english.percentile,
      koreanHistory: scoreData.koreanHistory.percentile,
      secondLang: scoreData.secondLang.percentile,
      sum: calculations.percentile.sum,
      avg: calculations.percentile.avg,
    },
    {
      subject: "등급",
      korean: scoreData.korean.grade,
      math: scoreData.math.grade,
      inquiry1: scoreData.inquiry1.grade,
      inquiry2: scoreData.inquiry2.grade,
      english: scoreData.english.grade,
      koreanHistory: scoreData.koreanHistory.grade,
      secondLang: scoreData.secondLang.grade,
      sum: calculations.grade.sum,
      avg: calculations.grade.avg,
    },
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">성적 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <span>홈</span>
        <span>{">"}</span>
        <span>정시 서비스</span>
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
                  <th className="text-center p-3 text-sm font-medium text-gray-700">탐구1</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">탐구2</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">영어</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">한국사</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">제2외국어</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700 bg-blue-50">합계</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700 bg-blue-50">평균</th>
                </tr>
              </thead>
              <tbody>
                {myScores.map((row, index) => (
                  <tr key={index} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="p-3 text-sm font-medium text-gray-900 bg-gray-100">{row.subject}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.korean}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.math}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.inquiry1}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.inquiry2}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.english}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.koreanHistory}</td>
                    <td className="p-3 text-sm text-center text-gray-900">{row.secondLang}</td>
                    <td className="p-3 text-sm text-center text-gray-900 font-semibold bg-blue-50">{row.sum}</td>
                    <td className="p-3 text-sm text-center text-gray-900 font-semibold bg-blue-50">{row.avg}</td>
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
                  <th className="text-center p-3 text-sm font-medium text-gray-700">누적백분위</th>
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
