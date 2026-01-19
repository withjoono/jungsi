import { RiskBadge } from "@/components/custom/risk-badge";
import { ScoreComparison } from "@/components/score-visualizations/score-comparison";
import { ScoreRiskChart } from "@/components/score-visualizations/score-risk-chart";
import { IRegularAdmissionDetail } from "@/stores/server/features/jungsi/interfaces";

interface SubjectRiskSectionProps {
  userName: string;
  admission: IRegularAdmissionDetail;
  myScore?: number | null;
  subjectRisk?: number | null;
}

export const SubjectRiskSection = ({
  admission,
  userName,
  myScore,
  subjectRisk,
}: SubjectRiskSectionProps) => {
  // 디버깅: 위험도 섹션에 전달된 데이터 확인
  console.log("[SubjectRiskSection] userName:", userName);
  console.log("[SubjectRiskSection] myScore:", myScore);
  console.log("[SubjectRiskSection] subjectRisk:", subjectRisk);
  console.log("[SubjectRiskSection] admission.minCut (최초컷):", admission?.minCut);
  console.log("[SubjectRiskSection] admission.maxCut (추합컷):", admission?.maxCut);
  console.log("[SubjectRiskSection] admission.totalScore:", admission?.totalScore);

  return (
    <section className="grid grid-cols-1 items-center gap-4 xl:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-l-4 border-primary pl-2 text-xl md:text-2xl">
          <span className="font-semibold">해당 전형 위험도</span>
          {myScore && subjectRisk ? (
            <RiskBadge risk={Math.floor(subjectRisk)} />
          ) : (
            <p className="">😴 성적X</p>
          )}
        </div>
        <ScoreComparison
          myScore={myScore}
          stableScore={parseFloat(admission?.minCut || "0")}
          riskScore={parseFloat(admission?.maxCut || "0")}
          totalScore={admission.totalScore || 1000}
          className="mt-4"
        />

        <div className="space-y-1 pt-4 text-sm">
          <p>
            내 점수:{" "}
            <b className="text-primary">
              {myScore ? myScore.toFixed(2) : "-"}
            </b>
          </p>
          <p>
            최초컷:{" "}
            <b className="text-primary">
              {admission.minCut
                ? parseFloat(admission.minCut).toFixed(2)
                : "-"}
            </b>
          </p>
          <p>
            추합컷:{" "}
            <b className="text-primary">
              {admission.maxCut
                ? parseFloat(admission.maxCut).toFixed(2)
                : "-"}
            </b>
          </p>
        </div>
      </div>
      <ScoreRiskChart
        myScore={myScore}
        stableScore={parseFloat(admission?.minCut || "0")}
        middleScore={parseFloat(admission?.maxCut || "0")}
        className="h-[300px] w-full"
        totalScore={admission.totalScore || 1000}
      />
    </section>
  );
};
