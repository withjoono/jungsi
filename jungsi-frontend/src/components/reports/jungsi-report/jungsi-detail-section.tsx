import React from "react";
import { DataGrid } from "@/components/custom/data-grid";
import { IRegularAdmissionDetail } from "@/stores/server/features/jungsi/interfaces";

interface JungsiDetailSectionProps {
  admission: IRegularAdmissionDetail;
}

export const JungsiDetailSection: React.FC<JungsiDetailSectionProps> = ({
  admission,
}) => {
  return (
    <section className="space-y-12">
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">1. 전형 개요</h3>
        <DataGrid
          data={[
            { label: "전형명", value: admission.admissionName },
            { label: "모집군", value: admission.admissionType },
            { label: "계열", value: admission.generalFieldName },
            { label: "모집단위", value: admission.recruitmentName || "-" },
            { label: "모집인원", value: admission.recruitmentNumber },
          ]}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">2. 전형 방법</h3>
        <DataGrid
          data={[
            { label: "선발방식", value: admission.selectionMethod || "-" },
            { label: "수능 비율", value: `${admission.csatRatio || 0}%` },
            {
              label: "학생부 비율",
              value: `${admission.schoolRecordRatio || 0}%`,
            },
            { label: "면접 비율", value: `${admission.interviewRatio || 0}%` },
            { label: "기타 비율", value: `${admission.otherRatio || 0}%` },
          ]}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">3. 수능 반영 방법</h3>
        <DataGrid
          data={[
            { label: "수능 요소", value: admission.csatElements || "-" },
            { label: "수능 조합", value: admission.csatCombination || "-" },
            { label: "필수 영역", value: admission.csatRequired || "-" },
            { label: "선택 영역", value: admission.csatOptional || "-" },
            {
              label: "탐구 과목 수",
              value: admission.researchSubjectCount || "-",
            },
          ]}
        />
        <h4 className="text-lg font-medium">영역별 반영 점수</h4>
        <DataGrid
          data={[
            {
              label: "국어",
              value: admission.koreanReflectionScore
                ? parseFloat(admission.koreanReflectionScore).toFixed(2)
                : "-",
            },
            {
              label: "수학",
              value: admission.mathReflectionScore
                ? parseFloat(admission.mathReflectionScore).toFixed(2)
                : "-",
            },
            {
              label: "탐구",
              value: admission.researchReflectionScore
                ? parseFloat(admission.researchReflectionScore).toFixed(2)
                : "-",
            },
            {
              label: "영어",
              value: admission.englishReflectionScore
                ? parseFloat(admission.englishReflectionScore).toFixed(2)
                : "-",
            },
            {
              label: "한국사",
              value: admission.koreanHistoryReflectionScore
                ? parseFloat(admission.koreanHistoryReflectionScore).toFixed(
                    2,
                  )
                : "-",
            },
            {
              label: "제2외국어",
              value: admission.secondForeignLanguageReflectionScore
                ? parseFloat(
                    admission.secondForeignLanguageReflectionScore,
                  ).toFixed(2)
                : "-",
            },
          ]}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">4-1. 가산점 (수학)</h3>
        <DataGrid
          data={[
            {
              label: "선택과목",
              value: admission.mathElectiveSubject || "-",
            },
            {
              label: "확률과통계 가산점",
              value:
                admission.mathProbabilityStatisticsAdditionalPoints || "-",
            },
            {
              label: "미적분 가산점",
              value: admission.mathCalculusAdditionalPoints || "-",
            },
            {
              label: "기하 가산점",
              value: admission.mathGeometryAdditionalPoints || "-",
            },
          ]}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">4-2. 가산점 (탐구)</h3>
        <DataGrid
          data={[
            { label: "유형", value: admission.researchType || "-" },
            {
              label: "사회 가산점",
              value: admission.researchSocialAdditionalPoints || "-",
            },
            {
              label: "과학 가산점",
              value: admission.researchScienceAdditionalPoints || "-",
            },
          ]}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">
          5. 영어/한국사 등급별 점수
        </h3>
        <h4 className="text-lg font-medium">
          영어 ({admission.englishApplicationCriteria})
        </h4>
        <DataGrid
          data={[
            { label: "1등급", value: admission.englishGrade1Score || "-" },
            { label: "2등급", value: admission.englishGrade2Score || "-" },
            { label: "3등급", value: admission.englishGrade3Score || "-" },
            { label: "4등급", value: admission.englishGrade4Score || "-" },
            { label: "5등급", value: admission.englishGrade5Score || "-" },
            { label: "6등급", value: admission.englishGrade6Score || "-" },
            { label: "7등급", value: admission.englishGrade7Score || "-" },
            { label: "8등급", value: admission.englishGrade8Score || "-" },
            { label: "9등급", value: admission.englishGrade9Score || "-" },
          ]}
        />
        <h4 className="text-lg font-medium">
          한국사 ({admission.koreanHistoryApplicationCriteria})
        </h4>
        <DataGrid
          data={[
            {
              label: "1등급",
              value: admission.koreanHistoryGrade1Score || "-",
            },
            {
              label: "2등급",
              value: admission.koreanHistoryGrade2Score || "-",
            },
            {
              label: "3등급",
              value: admission.koreanHistoryGrade3Score || "-",
            },
            {
              label: "4등급",
              value: admission.koreanHistoryGrade4Score || "-",
            },
            {
              label: "5등급",
              value: admission.koreanHistoryGrade5Score || "-",
            },
            {
              label: "6등급",
              value: admission.koreanHistoryGrade6Score || "-",
            },
            {
              label: "7등급",
              value: admission.koreanHistoryGrade7Score || "-",
            },
            {
              label: "8등급",
              value: admission.koreanHistoryGrade8Score || "-",
            },
            {
              label: "9등급",
              value: admission.koreanHistoryGrade9Score || "-",
            },
          ]}
        />
      </div>
    </section>
  );
};
