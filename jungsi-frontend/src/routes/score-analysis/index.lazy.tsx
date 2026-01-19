import { createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { RequireLoginMessage } from "@/components/require-login-message";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

export const Route = createLazyFileRoute("/score-analysis/")({
  component: ScoreAnalysisPage,
});

function ScoreAnalysisPage() {
  const { data: currentUser, isLoading: isUserLoading } = useGetCurrentUser();
  const { data: standardScores, isLoading: isScoreLoading } = useGetMockExamStandardScores();

  // 점수 데이터 정리
  const scoreData = useMemo(() => {
    if (!standardScores?.data) {
      return {
        korean: { standardScore: "-", percentile: "-", grade: "-", name: "국어" },
        math: { standardScore: "-", percentile: "-", grade: "-", name: "수학" },
        inquiry1: { standardScore: "-", percentile: "-", grade: "-", name: "탐구1" },
        inquiry2: { standardScore: "-", percentile: "-", grade: "-", name: "탐구2" },
        english: { standardScore: "-", percentile: "-", grade: "-", name: "영어" },
        koreanHistory: { standardScore: "-", percentile: "-", grade: "-", name: "한국사" },
        secondLang: { standardScore: "-", percentile: "-", grade: "-", name: "제2외국어" },
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
        name: koreanScore?.subjectName || "국어",
      },
      math: {
        standardScore: mathScore?.standardScore || "-",
        percentile: mathScore?.percentile?.toString() || "-",
        grade: mathScore?.grade?.toString() || "-",
        name: mathScore?.subjectName || "수학",
      },
      inquiry1: {
        standardScore: inquiry1Score?.standardScore || "-",
        percentile: inquiry1Score?.percentile?.toString() || "-",
        grade: inquiry1Score?.grade?.toString() || "-",
        name: inquiry1Score?.subjectName || "탐구1",
      },
      inquiry2: {
        standardScore: inquiry2Score?.standardScore || "-",
        percentile: inquiry2Score?.percentile?.toString() || "-",
        grade: inquiry2Score?.grade?.toString() || "-",
        name: inquiry2Score?.subjectName || "탐구2",
      },
      english: {
        standardScore: "-", // 영어는 표준점수 없음
        percentile: "-", // 영어는 백분위 없음
        grade: englishScore?.grade?.toString() || "-",
        name: "영어",
      },
      koreanHistory: {
        standardScore: "-", // 한국사는 표준점수 없음
        percentile: "-", // 한국사는 백분위 없음
        grade: historyScore?.grade?.toString() || "-",
        name: "한국사",
      },
      secondLang: {
        standardScore: "-", // 제2외국어는 표준점수 없음
        percentile: "-", // 제2외국어는 백분위 없음
        grade: langScore?.grade?.toString() || "-",
        name: langScore?.subjectName || "제2외국어",
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

    // 등급 합계 (주요 4과목)
    const gradeValues = [
      parseScore(scoreData.korean.grade),
      parseScore(scoreData.math.grade),
      parseScore(scoreData.inquiry1.grade),
      parseScore(scoreData.inquiry2.grade),
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

  // 로딩 중
  if (isUserLoading || isScoreLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 로그인 필요
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <RequireLoginMessage />
      </div>
    );
  }

  const subjects = [
    { key: "korean", label: "국어", data: scoreData.korean },
    { key: "math", label: "수학", data: scoreData.math },
    { key: "inquiry1", label: "탐구1", data: scoreData.inquiry1 },
    { key: "inquiry2", label: "탐구2", data: scoreData.inquiry2 },
    { key: "english", label: "영어", data: scoreData.english },
    { key: "koreanHistory", label: "한국사", data: scoreData.koreanHistory },
    { key: "secondLang", label: "제2외국어", data: scoreData.secondLang },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">정시 성적 분석</h1>
          <p className="text-sm text-gray-500 mt-1">2026학년도 수능 성적 기준</p>
        </div>

        {/* 거북쌤 안내 */}
        <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <img
            src="/images/turtle-teacher.png"
            alt="거북쌤"
            className="w-16 h-16 object-contain flex-shrink-0"
          />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">성적 분석 안내</p>
            <p className="leading-relaxed text-xs">
              입력하신 수능 성적을 기반으로 표준점수, 백분위, 등급을 분석합니다.
              정시 지원 전략 수립에 참고하세요.
            </p>
          </div>
        </div>

        {/* 내 성적 요약 카드 */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-xs opacity-80">표준점수 합계</p>
              <p className="text-2xl font-bold mt-1">{calculations.standardScore.sum}</p>
              <p className="text-xs opacity-80 mt-1">평균 {calculations.standardScore.avg}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-xs opacity-80">백분위 합계</p>
              <p className="text-2xl font-bold mt-1">{calculations.percentile.sum}</p>
              <p className="text-xs opacity-80 mt-1">평균 {calculations.percentile.avg}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4 text-center">
              <p className="text-xs opacity-80">등급 합계</p>
              <p className="text-2xl font-bold mt-1">{calculations.grade.sum}</p>
              <p className="text-xs opacity-80 mt-1">평균 {calculations.grade.avg}</p>
            </CardContent>
          </Card>
        </div>

        {/* 과목별 상세 성적 */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">과목별 상세 성적</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-y">
                    <th className="text-left p-3 text-xs font-medium text-gray-600">과목</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-600">표준점수</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-600">백분위</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-600">등급</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => (
                    <tr
                      key={subject.key}
                      className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="p-3">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{subject.label}</span>
                          {subject.data.name !== subject.label && (
                            <span className="text-xs text-gray-500 ml-1">({subject.data.name})</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-sm font-semibold ${
                          subject.data.standardScore !== "-" ? "text-blue-600" : "text-gray-400"
                        }`}>
                          {subject.data.standardScore}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-sm font-semibold ${
                          subject.data.percentile !== "-" ? "text-green-600" : "text-gray-400"
                        }`}>
                          {subject.data.percentile}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <GradeBadge grade={subject.data.grade} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 주요 과목 분석 (국수탐) */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">주요 영역 분석 (국수탐)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 국어 */}
              <SubjectAnalysisRow
                label="국어"
                subjectName={scoreData.korean.name}
                standardScore={scoreData.korean.standardScore}
                percentile={scoreData.korean.percentile}
                grade={scoreData.korean.grade}
                color="blue"
              />
              {/* 수학 */}
              <SubjectAnalysisRow
                label="수학"
                subjectName={scoreData.math.name}
                standardScore={scoreData.math.standardScore}
                percentile={scoreData.math.percentile}
                grade={scoreData.math.grade}
                color="green"
              />
              {/* 탐구1 */}
              <SubjectAnalysisRow
                label="탐구1"
                subjectName={scoreData.inquiry1.name}
                standardScore={scoreData.inquiry1.standardScore}
                percentile={scoreData.inquiry1.percentile}
                grade={scoreData.inquiry1.grade}
                color="orange"
              />
              {/* 탐구2 */}
              <SubjectAnalysisRow
                label="탐구2"
                subjectName={scoreData.inquiry2.name}
                standardScore={scoreData.inquiry2.standardScore}
                percentile={scoreData.inquiry2.percentile}
                grade={scoreData.inquiry2.grade}
                color="purple"
              />
            </div>
          </CardContent>
        </Card>

        {/* 안내 문구 */}
        <div className="bg-gray-100 rounded-lg p-4 text-xs text-gray-600">
          <p className="font-medium mb-2">유의사항</p>
          <ul className="list-disc list-inside space-y-1">
            <li>영어, 한국사는 절대평가로 등급만 표시됩니다.</li>
            <li>표준점수 및 백분위 합계/평균은 국어, 수학, 탐구1, 탐구2 기준입니다.</li>
            <li>정확한 지원 전략은 모의지원 시뮬레이션을 통해 확인하세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 등급 배지 컴포넌트
function GradeBadge({ grade }: { grade: string }) {
  if (grade === "-") {
    return <span className="text-sm text-gray-400">-</span>;
  }

  const gradeNum = parseInt(grade);
  let bgColor = "bg-gray-100 text-gray-600";

  if (gradeNum <= 2) {
    bgColor = "bg-blue-100 text-blue-700";
  } else if (gradeNum <= 4) {
    bgColor = "bg-green-100 text-green-700";
  } else if (gradeNum <= 6) {
    bgColor = "bg-yellow-100 text-yellow-700";
  } else {
    bgColor = "bg-red-100 text-red-700";
  }

  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${bgColor}`}>
      {grade}
    </span>
  );
}

// 과목별 분석 행 컴포넌트
function SubjectAnalysisRow({
  label,
  subjectName,
  standardScore,
  percentile,
  grade,
  color
}: {
  label: string;
  subjectName: string;
  standardScore: string;
  percentile: string;
  grade: string;
  color: "blue" | "green" | "orange" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  };

  const percentileNum = parseFloat(percentile);
  const barWidth = !isNaN(percentileNum) ? percentileNum : 0;

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-medium text-gray-900">{label}</span>
          {subjectName !== label && (
            <span className="text-xs text-gray-500 ml-1">({subjectName})</span>
          )}
        </div>
        <GradeBadge grade={grade} />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
        <div>
          <span className="text-gray-500">표준점수: </span>
          <span className="font-semibold">{standardScore}</span>
        </div>
        <div>
          <span className="text-gray-500">백분위: </span>
          <span className="font-semibold">{percentile}</span>
        </div>
      </div>
      {barWidth > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${colorClasses[color]}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      )}
    </div>
  );
}
