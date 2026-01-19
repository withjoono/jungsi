import { useMemo } from "react";
import { RecentGradeCutChart } from "@/components/score-visualizations/recent-grade-cut-chart";
import { IExploreEarlyComprehensiveDetailResponse } from "@/stores/server/features/explore/early-comprehensive/interfaces";

interface RecentGradeAnalysisSectionProps {
  myGrade?: number;
  earlyComprehensive: IExploreEarlyComprehensiveDetailResponse;
}

export const RecentGradeAnalysisSection = ({
  myGrade,
  earlyComprehensive,
}: RecentGradeAnalysisSectionProps) => {
  const chartData = useMemo(() => {
    if (!earlyComprehensive) return null;

    return earlyComprehensive.previous_results
      ?.filter((item) => item.grade_cut !== null)
      .map((item) => {
        return {
          year: item.year,
          ranking: Number(item.grade_cut) || 9,
        };
      });
  }, [earlyComprehensive]);

  return (
    <section className="space-y-2">
      <h3 className="text-xl">최근 입결 분석</h3>
      <div className="grid grid-cols-1 items-center gap-4 xl:grid-cols-2">
        <RecentGradeCutChart
          data={chartData || []}
          myGrade={myGrade}
          className="h-[400px] w-full"
        />
        <div className="mx-auto flex max-w-xl flex-wrap items-start justify-start gap-2 text-sm sm:text-base">
          <div className="grid w-full grid-cols-4 text-sm">
            <p>년도</p>
            <p>등급</p>
            <p>경쟁률</p>
            <p>충원인원</p>
          </div>
          {earlyComprehensive.previous_results?.map((item, idx) => {
            return (
              <div key={idx} className="grid w-full grid-cols-4 font-bold">
                <p>{item.year}</p>
                <p>{parseFloat(item.grade_cut + "") || "-"}</p>
                <p>{parseFloat(item.competition_ratio + "") || "-"}</p>
                <p>{parseFloat(item.recruitment_number + "") || "-"}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
