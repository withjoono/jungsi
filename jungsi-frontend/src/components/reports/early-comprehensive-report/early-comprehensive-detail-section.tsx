import { DataGrid } from "@/components/custom/data-grid";
import { IExploreEarlyComprehensiveDetailResponse } from "@/stores/server/features/explore/early-comprehensive/interfaces";

interface EarlyComprehensiveDetailSectionProps {
  earlyComprehensive: IExploreEarlyComprehensiveDetailResponse;
}

export const EarlyComprehensiveDetailSection = ({
  earlyComprehensive,
}: EarlyComprehensiveDetailSectionProps) => {
  return (
    <section className="space-y-12">
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">1.지원자격</h3>
        <p className="font-semibold">
          {earlyComprehensive.admission_method.eligibility ||
            "데이터가 존재하지 않아요ㅜㅜ"}
        </p>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">2. 선발방식</h3>
        <DataGrid
          data={[
            {
              label: "모집인원",
              value: earlyComprehensive.recruitment_number || "-",
            },
            {
              label: "전형방법",
              value:
                earlyComprehensive.admission_method.method_description || "-",
            },
          ]}
        />
      </div>

      <div>
        <h3 className="pb-4 text-xl font-medium text-primary">3. 수능 최저</h3>
        <div className="flex flex-wrap items-start justify-start gap-4 text-sm sm:text-base">
          <div className="flex w-full flex-col justify-center gap-2">
            <p className="text-sm">수능 최저학력기준</p>
            <p className="font-semibold">
              {earlyComprehensive.minimum_grade?.is_applied
                ? earlyComprehensive.minimum_grade?.description
                : "미반영"}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">4. 면접</h3>
        <DataGrid
          data={[
            {
              label: "면접 점수 반영여부",
              value:
                earlyComprehensive.interview?.is_reflected === 1
                  ? "반영"
                  : "미반영",
            },
            {
              label: "면접 유형",
              value:
                earlyComprehensive.interview?.interview_type &&
                earlyComprehensive.interview.interview_type !== "0"
                  ? earlyComprehensive.interview.interview_type
                  : "-",
            },
            {
              label: "면접시 활용자료",
              value:
                earlyComprehensive.interview?.materials_used &&
                earlyComprehensive.interview.materials_used !== "0"
                  ? earlyComprehensive.interview.materials_used
                  : "-",
            },
            {
              label: "면접 진행방식",
              value:
                earlyComprehensive.interview?.interview_process &&
                earlyComprehensive.interview.interview_process !== "0"
                  ? earlyComprehensive.interview.interview_process
                  : "-",
            },
          ]}
        />
        <DataGrid
          data={[
            {
              label: "면접 평가내용",
              value:
                earlyComprehensive.interview?.evaluation_content &&
                earlyComprehensive.interview.evaluation_content !== "0"
                  ? earlyComprehensive.interview.evaluation_content
                  : "-",
            },
            {
              label: "날짜",
              value:
                earlyComprehensive.interview?.interview_date &&
                earlyComprehensive.interview.interview_date !== "0"
                  ? earlyComprehensive.interview.interview_date
                  : "-",
            },
            {
              label: "시간",
              value:
                earlyComprehensive.interview?.interview_time &&
                earlyComprehensive.interview.interview_time !== "0"
                  ? earlyComprehensive.interview.interview_time
                  : "-",
            },
          ]}
        />
      </div>
    </section>
  );
};
