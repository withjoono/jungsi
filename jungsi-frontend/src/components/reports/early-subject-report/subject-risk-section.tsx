import { RiskBadge } from "@/components/custom/risk-badge";
import { GradeComparison } from "@/components/score-visualizations/grade-comparison";
import { SubjectRiskChart } from "@/components/score-visualizations/subject-risk-chart";
import { IExploreEarlySubjectDetailResponse } from "@/stores/server/features/explore/early-subject/interfaces";

interface SubjectRiskSectionProps {
  userName: string;
  earlySubject: IExploreEarlySubjectDetailResponse;
  myGrade?: number;
  subjectRisk: number | null;
}

export const SubjectRiskSection = ({
  earlySubject,
  userName,
  myGrade,
  subjectRisk,
}: SubjectRiskSectionProps) => {
  return (
    <section className="grid grid-cols-1 items-center gap-4 xl:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-l-4 border-primary pl-2 text-xl md:text-2xl">
          <span className="font-semibold">해당 전형 위험도</span>
          {myGrade && subjectRisk ? (
            <RiskBadge risk={Math.floor(subjectRisk)} />
          ) : (
            <p className="">😴 성적X</p>
          )}
        </div>
        <p className="text-sm text-foreground/60 md:text-base">
          <b className="text-primary">{userName}</b>의 교과 위험도 예측입니다.
        </p>
        <GradeComparison
          myGrade={myGrade}
          stableGrade={Math.min(earlySubject.scores?.risk_plus_2 || 9, 9)}
          riskGrade={Math.min(earlySubject.scores?.risk_minus_1 || 9, 9)}
          className="mt-4"
        />
      </div>
      <SubjectRiskChart
        myGrade={myGrade}
        stableGrade={Math.min(earlySubject.scores?.risk_plus_2 || 9, 9)}
        middleGrade={Math.min(earlySubject.scores?.risk_minus_1 || 9, 9)}
        className="h-[300px] w-full"
      />
    </section>
  );
};
