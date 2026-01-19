import React, { useMemo } from "react";
import NotFoundError from "@/components/errors/not-found-error";
import UnknownErrorPage from "@/components/errors/unknown-error";
import LoadingSpinner from "@/components/loading-spinner";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { SubjectRiskSection } from "./subject-risk-section";
import { RecentGradeAnalysisSection } from "./recent-grade-analysis-section";
import { SusiReportHeader } from "../susi-report-header";
import {
  useGetRegularAdmissionDetail,
  useGetCalculatedScores,
} from "@/stores/server/features/jungsi/queries";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import { JungsiDetailSection } from "./jungsi-detail-section";
import { MockApplicationSection } from "./mock-application-section";
import { calc정시위험도 } from "@/lib/calculations/regular-v2/risk";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, FileText } from "lucide-react";

interface RegularReportProps {
  admissionId: number;
}

export const JungsiReport: React.FC<RegularReportProps> = ({ admissionId }) => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: admission, status: admissionStatus } =
    useGetRegularAdmissionDetail({ admissionId });
  const { data: mockExamScores } = useGetMockExamStandardScores();
  const { data: calculatedScores, isLoading: isLoadingScores } =
    useGetCalculatedScores();

  // 백엔드에서 계산된 나의 누적백분위 사용
  const userPercentile = useMemo(() => {
    if (!mockExamScores) return 0;
    return mockExamScores.myCumulativePercentile;
  }, [mockExamScores]);

  // 저장된 환산점수에서 해당 대학의 점수 찾기
  // universityId + scoreCalculationCode로 정확한 매칭 필요 (같은 대학에 여러 학과가 있음)
  const savedScore = useMemo(() => {
    if (!calculatedScores || !admission) return null;
    return calculatedScores.find(
      (score) =>
        score.universityId === admission.university.id &&
        score.scoreCalculationCode === admission.scoreCalculationCode
    );
  }, [calculatedScores, admission]);

  const myScore = savedScore?.convertedScore;
  const calculationError = savedScore ? null : "환산점수가 없습니다.";

  // 디버깅: JungsiReport에서 사용되는 데이터 확인
  console.log("[JungsiReport] admissionId:", admissionId);
  console.log("[JungsiReport] admission:", admission);
  console.log("[JungsiReport] admission.university.id:", admission?.university?.id);
  console.log("[JungsiReport] admission.scoreCalculationCode:", admission?.scoreCalculationCode);
  console.log("[JungsiReport] calculatedScores:", calculatedScores);
  console.log("[JungsiReport] calculatedScores length:", calculatedScores?.length);

  // 첫 번째 calculatedScore의 구조 확인
  if (calculatedScores && calculatedScores.length > 0) {
    console.log("[JungsiReport] First calculatedScore keys:", Object.keys(calculatedScores[0]));
    console.log("[JungsiReport] First calculatedScore:", calculatedScores[0]);
    console.log("[JungsiReport] Sample universityId:", calculatedScores[0].universityId, typeof calculatedScores[0].universityId);
    console.log("[JungsiReport] Sample scoreCalculationCode:", calculatedScores[0].scoreCalculationCode);

    // 같은 대학 ID를 가진 점수 찾기
    const sameUnivScores = calculatedScores.filter(s => s.universityId === admission?.university?.id);
    console.log("[JungsiReport] Scores with same universityId:", sameUnivScores);

    // 같은 scoreCalculationCode를 가진 점수 찾기
    const sameCodeScores = calculatedScores.filter(s => s.scoreCalculationCode === admission?.scoreCalculationCode);
    console.log("[JungsiReport] Scores with same scoreCalculationCode:", sameCodeScores);
  }

  console.log("[JungsiReport] savedScore:", savedScore);
  console.log("[JungsiReport] myScore:", myScore);
  console.log("[JungsiReport] mockExamScores:", mockExamScores);
  console.log("[JungsiReport] userPercentile:", userPercentile);

  const risk = useMemo(() => {
    if (!myScore || !admission) return null;

    return calc정시위험도(myScore, {
      risk_10: parseFloat(admission.riskPlus5 || "0"),
      risk_9: parseFloat(admission.riskPlus4 || "0"),
      risk_8: parseFloat(admission.riskPlus3 || "0"),
      risk_7: parseFloat(admission.riskPlus2 || "0"),
      risk_6: parseFloat(admission.riskPlus1 || "0"),
      risk_5: parseFloat(admission.riskMinus1 || "0"),
      risk_4: parseFloat(admission.riskMinus2 || "0"),
      risk_3: parseFloat(admission.riskMinus3 || "0"),
      risk_2: parseFloat(admission.riskMinus4 || "0"),
      risk_1: parseFloat(admission.riskMinus5 || "0"),
    });
  }, [myScore, admission]);

  if (admissionStatus === "pending" || isLoadingScores) {
    return <LoadingSpinner />;
  }

  if (admissionStatus === "error") {
    return <UnknownErrorPage />;
  }

  if (admission === null) {
    return <NotFoundError />;
  }

  return (
    <div className="pb-20">
      <div className="space-y-8">
        <SusiReportHeader
          title={`${admission.university.name} (${admission.university.region})`}
          subtitle={`${admission.generalFieldName} - ${admission.admissionName}`}
          recruitmentUnitName={admission.recruitmentName || "-"}
          badges={`${admission.admissionType}, ${admission.university.establishmentType}`}
          risk={risk}
        />

        {calculationError && (
          <div
            className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
            role="alert"
          >
            <strong className="font-bold">오류 발생:</strong>
            <span className="block sm:inline"> {calculationError}</span>
          </div>
        )}

        <Tabs defaultValue="prediction" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger
              value="prediction"
              className="gap-2 h-12 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-slate-600 rounded-lg transition-all"
            >
              <BarChart3 className="h-5 w-5" />
              예측 분석
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="gap-2 h-12 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-slate-600 rounded-lg transition-all"
            >
              <FileText className="h-5 w-5" />
              전형 안내
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prediction" className="space-y-12">
            {myScore ? (
              <>
                <SubjectRiskSection
                  myScore={myScore}
                  admission={admission}
                  userName={currentUser?.nickname || ""}
                  subjectRisk={risk}
                />

                <RecentGradeAnalysisSection
                  myScore={myScore}
                  admissionId={admissionId}
                  admission={admission}
                  userPercentile={userPercentile}
                />

                {/* 모의지원 현황 섹션 */}
                <MockApplicationSection
                  universityCode={admission.university.code}
                  universityName={admission.university.name}
                  recruitmentUnit={admission.recruitmentName || ""}
                  admissionType={admission.admissionType}
                  myScore={myScore}
                />
              </>
            ) : (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
                <p className="text-yellow-800">
                  환산점수가 없어 예측 분석을 표시할 수 없습니다.
                  <br />
                  <span className="text-sm text-yellow-600">
                    모의고사 성적을 입력하고 환산점수를 계산해주세요.
                  </span>
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="info">
            <JungsiDetailSection admission={admission} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
