import { DataGrid } from "@/components/custom/data-grid";
import { IExploreEarlySubjectDetailResponse } from "@/stores/server/features/explore/early-subject/interfaces";

interface EarlySubjectDetailSectionProps {
  earlySubject: IExploreEarlySubjectDetailResponse;
}

export const EarlySubjectDetailSection = ({
  earlySubject,
}: EarlySubjectDetailSectionProps) => {
  return (
    <section className="space-y-12">
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">1.지원자격</h3>
        <p className="font-semibold">
          {earlySubject.admission_method.eligibility ||
            "데이터가 존재하지 않아요ㅜㅜ"}
        </p>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">2. 선발방식</h3>
        <DataGrid
          data={[
            {
              label: "모집인원",
              value: earlySubject.recruitment_number || "-",
            },
            {
              label: "전형방법",
              value: earlySubject.admission_method.method_description || "-",
            },
          ]}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">3. 학생부 비율</h3>
        <p className="text-base font-medium text-blue-500">
          일괄선발/1단계 비율
        </p>
        <DataGrid
          data={[
            {
              label: "교과",
              value: `${earlySubject.admission_method.subject_ratio || 0}%`,
            },
            {
              label: "비교과 (정성평가)",
              value: `${earlySubject.admission_method.document_ratio || 0}%`,
            },
            {
              label: "면접",
              value: `${earlySubject.admission_method.interview_ratio || 0}%`,
            },
            {
              label: "실기",
              value: `${earlySubject.admission_method.practical_ratio || 0}%`,
            },
          ]}
        />

        {earlySubject.admission_method.second_stage_first_ratio ||
        earlySubject.admission_method.second_stage_interview_ratio ||
        (earlySubject.admission_method.second_stage_other_ratio &&
          earlySubject.admission_method.second_stage_other_details !== "0") ? (
          <>
            <p className="text-base font-medium text-blue-500">2단계 비율</p>
            <DataGrid
              data={[
                {
                  label: "1단계 성적",
                  value: `${earlySubject.admission_method.second_stage_first_ratio || 0}%`,
                },
                {
                  label: "2단계 면접",
                  value: `${earlySubject.admission_method.second_stage_interview_ratio || 0}%`,
                },
                {
                  label: "그외",
                  value: `${earlySubject.admission_method.second_stage_other_ratio || 0}%`,
                },
                {
                  label: "그외 내역",
                  value:
                    earlySubject.admission_method.second_stage_other_details ||
                    "-",
                },
              ]}
            />
          </>
        ) : null}
      </div>
      {/* <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">4. 교과 반영 방식</h3>
        <DataGrid
          data={[
            {
              label: "교과 반영학기",
              value: formatCurriculumReflectionSemester(
                earlySubject.curriculum_reflection_semester + "",
              ),
            },
            {
              label: "학생부활용지표",
              value: earlySubject.student_record_utilization_index || "-",
            },
            {
              label: "공통일반반영방식",
              value: earlySubject.common_general_reflection_method || "-",
            },
            {
              label: "진로과목반영방식",
              value: earlySubject.career_subject_reflection_method || "-",
            },
          ]}
        />
        <p className="text-base font-medium text-blue-500">학년별 비율</p>
        <DataGrid
          data={[
            {
              label: "1학년 비율",
              value: `${earlySubject.first_year_ratio || 0}%`,
            },
            {
              label: "2학년 비율",
              value: `${earlySubject.second_year_ratio || 0}%`,
            },
            {
              label: "3학년 비율",
              value: `${earlySubject.third_year_ratio || 0}%`,
            },
            {
              label: "2-3학년 비율",
              value: `${earlySubject.second_third_year_ratio || 0}%`,
            },
            {
              label: "1-2-3학년 비율",
              value: `${earlySubject.first_second_third_year_ratio || 0}%`,
            },
          ]}
        />
      </div> */}
      <div>
        <h3 className="pb-4 text-xl font-medium text-primary">4. 수능 최저</h3>
        <div className="flex flex-wrap items-start justify-start gap-4 text-sm sm:text-base">
          <div className="flex w-full flex-col justify-center gap-2">
            <p className="text-sm">수능 최저학력기준</p>
            <p className="font-semibold">
              {earlySubject.minimum_grade?.is_applied
                ? earlySubject.minimum_grade?.description
                : "미반영"}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">5. 면접</h3>
        <DataGrid
          data={[
            {
              label: "면접 점수 반영여부",
              value:
                earlySubject.interview?.is_reflected === 1 ? "반영" : "미반영",
            },
            {
              label: "면접 유형",
              value:
                earlySubject.interview?.interview_type &&
                earlySubject.interview.interview_type !== "0"
                  ? earlySubject.interview.interview_type
                  : "-",
            },
            {
              label: "면접시 활용자료",
              value:
                earlySubject.interview?.materials_used &&
                earlySubject.interview.materials_used !== "0"
                  ? earlySubject.interview.materials_used
                  : "-",
            },
            {
              label: "면접 진행방식",
              value:
                earlySubject.interview?.interview_process &&
                earlySubject.interview.interview_process !== "0"
                  ? earlySubject.interview.interview_process
                  : "-",
            },
          ]}
        />
        <DataGrid
          data={[
            {
              label: "면접 평가내용",
              value:
                earlySubject.interview?.evaluation_content &&
                earlySubject.interview.evaluation_content !== "0"
                  ? earlySubject.interview.evaluation_content
                  : "-",
            },
            {
              label: "날짜",
              value:
                earlySubject.interview?.interview_date &&
                earlySubject.interview.interview_date !== "0"
                  ? earlySubject.interview.interview_date
                  : "-",
            },
            {
              label: "시간",
              value:
                earlySubject.interview?.interview_time &&
                earlySubject.interview.interview_time !== "0"
                  ? earlySubject.interview.interview_time
                  : "-",
            },
          ]}
        />
      </div>
    </section>
  );
};
