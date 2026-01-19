import React from "react";
import { useMockApplicationData } from "./use-mock-application-data";
import { ApplicantHistogram } from "./applicant-histogram";
import { StatisticsBasedChart } from "./statistics-based-chart";
import { FrequencyDistributionTable } from "./frequency-distribution-table";
import { Loader2, AlertCircle } from "lucide-react";

interface MockApplicationSectionProps {
  universityCode: string;
  universityName: string;
  recruitmentUnit: string;
  admissionType: string;
  myScore?: number;
}

export const MockApplicationSection: React.FC<MockApplicationSectionProps> = ({
  universityCode,
  universityName,
  recruitmentUnit,
  admissionType,
  myScore,
}) => {
  const { isLoading, error, basicInfo, frequencyDistribution, applicants, rowId } =
    useMockApplicationData({
      universityCode,
      universityName,
      recruitmentUnit,
      admissionType,
    });

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">모의지원 데이터를 불러오는 중...</span>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  // 데이터 없음
  if (!rowId || (!applicants.length && !frequencyDistribution.length)) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>해당 대학/학과의 모의지원 데이터가 없습니다.</p>
        <p className="text-sm mt-2">
          검색 조건: {universityCode} / {recruitmentUnit} / {admissionType}군
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 지원현황 히스토그램 (상단) - applicants가 있으면 기존 컴포넌트 사용 */}
      {applicants.length > 0 ? (
        <ApplicantHistogram
          applicants={applicants}
          universityName={universityName}
          recruitmentUnit={recruitmentUnit}
          myScore={myScore}
        />
      ) : (
        /* applicants가 없으면 통계 기반 차트 사용 */
        basicInfo?.stats && (
          <StatisticsBasedChart
            basicInfo={basicInfo}
            frequencyDistribution={frequencyDistribution}
            universityName={universityName}
            recruitmentUnit={recruitmentUnit}
            myScore={myScore}
          />
        )
      )}

      {/* 도수분포표 (하단) */}
      {frequencyDistribution.length > 0 && (
        <FrequencyDistributionTable
          frequencyDistribution={frequencyDistribution}
          basicInfo={basicInfo}
          myScore={myScore}
        />
      )}
    </div>
  );
};
