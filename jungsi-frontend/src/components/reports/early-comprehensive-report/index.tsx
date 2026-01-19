import NotFoundError from "@/components/errors/not-found-error";
import UnknownErrorPage from "@/components/errors/unknown-error";
import LoadingSpinner from "@/components/loading-spinner";
import {
  useGetCurrentUser,
  useGetMyGrade,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
import { RecentGradeAnalysisSection } from "./recent-grade-analysis-section";
import { CompatibilityRiskSection } from "./compatibility-risk-section";
import { useGetExploreEarlyComprehensiveDetail } from "@/stores/server/features/explore/early-comprehensive/queries";
import { useGetOfficerEvaluation } from "@/stores/server/features/susi/evaluation/queries";
import { SusiReportHeader } from "../susi-report-header";
import { EarlyComprehensiveDetailSection } from "./early-comprehensive-detail-section";
import { NonSubjectRiskSection } from "./non-subject-risk-section";
import { SubjectRiskSection } from "./subject-risk-section";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import { useMemo } from "react";
import { calculateComprehensiveRisk } from "@/lib/calculations/early-compatibility-risk";
import { calculateCompatibility } from "@/lib/calculations/compatibility/score";
import { ISeries } from "@/types/compatibility.type";
import { getUnivLevelByCode } from "@/lib/utils/services/university";
import { useGetSusiPassRecord } from "@/stores/server/features/susi/pass-record/queries";
import { PassFailAnalysisSection } from "../pass-fail-analysis-section";

interface EarlyComprehensiveReportProps {
  earlyComprehensiveId: number;
  evaluationId?: number | null;
}

export const EarlyComprehensiveReport = ({
  earlyComprehensiveId,
  evaluationId,
}: EarlyComprehensiveReportProps) => {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: earlyComprehensive, status: earlyComprehensiveStatus } =
    useGetExploreEarlyComprehensiveDetail(earlyComprehensiveId);
  const { data: evaluation, status: evaluationStatus } =
    useGetOfficerEvaluation(evaluationId);
  const { data: schoolRecord, status: schoolRecordStatus } =
    useGetSchoolRecords();
  const { data: myGrade } = useGetMyGrade();
  const { data: staticData } = useGetStaticData();
  const { data: passRecords } = useGetSusiPassRecord({
    recruitmentUnitId: earlyComprehensiveId,
  });

  const series: ISeries = {
    grandSeries: earlyComprehensive?.fields.major?.name || "",
    middleSeries: earlyComprehensive?.fields.mid?.name || "",
    rowSeries: earlyComprehensive?.fields.minor?.name || "",
  };
  const univLevel = getUnivLevelByCode(
    earlyComprehensive?.university.code || "",
    earlyComprehensive?.general_field.name || "",
  );
  const calculatedCompatibility = calculateCompatibility({
    schoolRecord,
    series,
    univLevel,
    staticData,
  });

  const risk = useMemo(() => {
    if (
      !earlyComprehensive ||
      !schoolRecord ||
      !staticData ||
      myGrade === undefined
    ) {
      return null;
    }
    return calculateComprehensiveRisk({
      recruitmentUnit: earlyComprehensive,
      myEvaluationFactorScore: evaluation?.factorScores || {},
      myGrade: myGrade || 0,
      schoolRecord,
      staticData,
    });
  }, [earlyComprehensive, evaluation, myGrade, schoolRecord, staticData]);

  if (
    earlyComprehensiveStatus === "pending" ||
    evaluationStatus === "pending" ||
    schoolRecordStatus === "pending"
  ) {
    return <LoadingSpinner />;
  }

  if (
    earlyComprehensiveStatus === "error" ||
    evaluationStatus === "error" ||
    schoolRecordStatus === "error"
  ) {
    return <UnknownErrorPage />;
  }

  if (earlyComprehensive === null) {
    return <NotFoundError />;
  }

  return (
    <div className="pb-20">
      <div className="space-y-12">
        <SusiReportHeader
          title={`${earlyComprehensive.university.name} (${earlyComprehensive.university.region})`}
          subtitle={`${earlyComprehensive.general_field.name} - ${earlyComprehensive.admission.name}`}
          recruitmentUnitName={earlyComprehensive.name || "-"}
          badges={
            earlyComprehensive.admission.subtypes.map((n) => n.id).join(",") ||
            ""
          }
          risk={risk?.subjectRisk}
        />

        <CompatibilityRiskSection
          earlyComprehensive={earlyComprehensive}
          calculatedCompatibility={calculatedCompatibility}
          userName={currentUser?.nickname || ""}
        />

        <SubjectRiskSection
          earlyComprehensive={earlyComprehensive}
          userName={currentUser?.nickname || ""}
          subjectRisk={risk?.subjectRisk}
          myGrade={myGrade}
        />

        <NonSubjectRiskSection
          earlyComprehensive={earlyComprehensive}
          evaluationScores={evaluation.factorScores}
          userName={currentUser?.nickname || ""}
        />

        <RecentGradeAnalysisSection earlyComprehensive={earlyComprehensive} />

        <PassFailAnalysisSection passRecords={passRecords || []} />

        <EarlyComprehensiveDetailSection
          earlyComprehensive={earlyComprehensive}
        />
      </div>
    </div>
  );
};
