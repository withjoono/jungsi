import NotFoundError from "@/components/errors/not-found-error";
import UnknownErrorPage from "@/components/errors/unknown-error";
import LoadingSpinner from "@/components/loading-spinner";
import {
  useGetCurrentUser,
  useGetMyGrade,
} from "@/stores/server/features/me/queries";
import { SubjectRiskSection } from "./subject-risk-section";
import { RecentGradeAnalysisSection } from "./recent-grade-analysis-section";
import { useMemo } from "react";
import { useGetExploreEarlySubjectDetail } from "@/stores/server/features/explore/early-subject/queries";
import { SusiReportHeader } from "../susi-report-header";
import { EarlySubjectDetailSection } from "./early-subject-detail-section";
import { calculateSubjectRisk } from "@/lib/calculations/subject/risk";
import { useGetSusiPassRecord } from "@/stores/server/features/susi/pass-record/queries";
import { PassFailAnalysisSection } from "../pass-fail-analysis-section";

interface EarlySubjectReportProps {
  earlySubjectId: number;
}

export const EarlySubjectReport = ({
  earlySubjectId,
}: EarlySubjectReportProps) => {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: earlySubject, status: earlySubjectStatus } =
    useGetExploreEarlySubjectDetail(earlySubjectId);
  const { data: passRecords } = useGetSusiPassRecord({
    recruitmentUnitId: earlySubjectId,
  });
  const { data: myGrade } = useGetMyGrade();

  // 교과 위험도
  const subjectRisk = useMemo(() => {
    if (!myGrade || !earlySubject?.scores) return null;
    return calculateSubjectRisk(myGrade, {
      risk_1: earlySubject.scores.risk_plus_5,
      risk_2: earlySubject.scores.risk_plus_4,
      risk_3: earlySubject.scores.risk_plus_3,
      risk_4: earlySubject.scores.risk_plus_2,
      risk_5: earlySubject.scores.risk_plus_1,
      risk_6: earlySubject.scores.risk_minus_1,
      risk_7: earlySubject.scores.risk_minus_2,
      risk_8: earlySubject.scores.risk_minus_3,
      risk_9: earlySubject.scores.risk_minus_4,
      risk_10: earlySubject.scores.risk_minus_5,
    });
  }, [earlySubject, myGrade]);

  if (earlySubjectStatus === "pending") {
    return <LoadingSpinner />;
  }

  if (earlySubjectStatus === "error") {
    return <UnknownErrorPage />;
  }

  if (earlySubject === null) {
    return <NotFoundError />;
  }

  return (
    <div className="pb-20">
      <div className="space-y-12">
        <SusiReportHeader
          title={`${earlySubject.university.name} (${earlySubject.university.region})`}
          subtitle={`${earlySubject.general_field.name} - ${earlySubject.admission.name}`}
          recruitmentUnitName={earlySubject.name || "-"}
          badges={
            earlySubject.admission.subtypes.map((n) => n.id).join(",") || ""
          }
          risk={subjectRisk || undefined}
        />

        <SubjectRiskSection
          myGrade={myGrade}
          earlySubject={earlySubject}
          userName={currentUser?.nickname || ""}
          subjectRisk={subjectRisk}
        />

        <RecentGradeAnalysisSection
          myGrade={myGrade}
          earlySubject={earlySubject}
        />

        <PassFailAnalysisSection passRecords={passRecords || []} />

        <EarlySubjectDetailSection earlySubject={earlySubject} />
      </div>
    </div>
  );
};
