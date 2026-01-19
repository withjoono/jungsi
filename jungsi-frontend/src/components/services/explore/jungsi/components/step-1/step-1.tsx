import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  useGetActiveServices,
  useGetCurrentUser,
} from "@/stores/server/features/me/queries";
import { Button, buttonVariants } from "@/components/custom/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useExploreJungsiStepper } from "../../context/explore-jungsi-provider";
import {
  useGetRegularAdmissions,
  useGetCalculatedScores,
} from "@/stores/server/features/jungsi/queries";
import { IRegularAdmission, ISavedScore } from "@/stores/server/features/jungsi/interfaces";
import { JungsiStep1Chart } from "./step-1-chart";
import { SelectedChartDataTable } from "./selected-chart-data-table";
import { RegionSelector } from "./region-selector";
import { GeneralFieldSelector } from "./general-field-selector";
import { IRegion } from "@/types/region.type";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import LoadingSpinner from "@/components/loading-spinner";
import { DEMO_MOCK_EXAM_SCORES } from "../../demo/demo-mock-exam-data";

export interface IJungsiStep1GroupData {
  university_name: string;
  university_region: string;
  general_field: string;
  items: IRegularAdmission[];
  range_min: number | null;
  range_max: number | null;
  has_valid_percentile: boolean;
  user_scores: Record<
    number,
    {
      score: number | null;
      error: string | null;
    }
  >;
  max_user_score: number | null;
}

export const JungsiStep1 = () => {
  const { data: user } = useGetCurrentUser();
  const { formData, nextStep, updateFormData, isDemo } = useExploreJungsiStepper();

  const { data: regularAdmissions, isLoading: isLoadingAdmissions } = useGetRegularAdmissions({
    year: 2026,
    admission_type: formData.admissionType,
  });
  const { data: mockExamScores } = useGetMockExamStandardScores();
  const { data: calculatedScores, isLoading: isLoadingScores } =
    useGetCalculatedScores();
  const { data: activeServices } = useGetActiveServices();

  const [isSorted, setIsSorted] = useState(false);
  const [selectedUniversitiesChart, setSelectedUniversitiesChart] = useState<
    string[]
  >([]);
  const [selectedAdmissionsTable, setSelectedAdmissionsTable] = useState<
    number[]
  >([]);
  const [
    filteredAndGroupedRegularAdmissions,
    setFilteredAndGroupedRegularAdmissions,
  ] = useState<Record<string, IJungsiStep1GroupData>>({});

  // 데모 모드에서는 샘플 데이터 사용
  const effectiveMockExamScores = isDemo ? DEMO_MOCK_EXAM_SCORES : mockExamScores;

  // 백엔드 calculatedScores를 scoreMap으로 매핑 (scoreCalculationCode 기준)
  const scoreMap = useMemo(() => {
    if (!calculatedScores) return new Map<string, ISavedScore>();

    return new Map(
      calculatedScores.map((score) => [
        `${score.universityId}_${score.scoreCalculationCode}`,
        score,
      ]),
    );
  }, [calculatedScores]);

  // 데이터 그룹화 및 필터링
  useEffect(() => {
    const processData = () => {
      if (!regularAdmissions || !effectiveMockExamScores) {
        setFilteredAndGroupedRegularAdmissions({});
        return;
      }

      const filteredData = regularAdmissions.filter((item) => {
        const regionMatch =
          formData.region.length === 0 ||
          formData.region.includes(item.university.region as IRegion);
        const generalFieldMatch =
          formData.selectedGeneralFieldName === "전체" ||
          formData.selectedGeneralFieldName === item.generalFieldName;
        return regionMatch && generalFieldMatch;
      });

      const groupedData = groupDataByUniversityGeneralField(
        filteredData,
        scoreMap,
      );

      let sortedData = groupedData;
      if (isSorted) {
        sortedData = Object.fromEntries(
          Object.entries(groupedData).sort(([, a], [, b]) => {
            // null 값 처리: null은 가장 낮은 우선순위
            if (b.range_max === null) return -1;
            if (a.range_max === null) return 1;
            return b.range_max - a.range_max;
          }),
        );
      }

      setFilteredAndGroupedRegularAdmissions(sortedData);
    };

    processData();
  }, [
    regularAdmissions,
    effectiveMockExamScores,
    scoreMap,
    formData.region,
    formData.selectedGeneralFieldName,
    isSorted,
  ]);

  const handleNextClick = () => {
    if (!user?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (!activeServices?.includes("S")) {
      toast.error("이용권 구매가 필요합니다.");
      return;
    }

    updateFormData("step1SelectedIds", [...selectedAdmissionsTable]);
    updateFormData("region", []);
    updateFormData("selectedGeneralFieldName", "전체");
    nextStep();
  };

  const handleSelectUniversity = (key: string) => {
    setSelectedUniversitiesChart((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // 차트 데이터 로딩 상태
  const isChartLoading = isLoadingAdmissions || isLoadingScores;

  return (
    <div className="space-y-3 px-4 pt-4 md:space-y-6">
      <RegionSelector />
      <GeneralFieldSelector />

      <div className="py-4">
        <div className="h-[500px] overflow-x-auto">
          {isChartLoading ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <JungsiStep1Chart
              data={filteredAndGroupedRegularAdmissions}
              onSelectUniversity={handleSelectUniversity}
              selectedKeys={selectedUniversitiesChart}
            />
          )}
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="sort-switch"
            checked={isSorted}
            onCheckedChange={setIsSorted}
          />
          <Label htmlFor="sort-switch">추합컷 정렬</Label>
        </div>
      </div>

      {user?.id ? (
        selectedUniversitiesChart.length === 0 ? (
          <NoSelectionMessage />
        ) : (
          <SelectedChartDataTable
            selectedChartKeys={selectedUniversitiesChart}
            selectedAdmissions={selectedAdmissionsTable}
            setSelectedAdmissions={setSelectedAdmissionsTable}
            data={filteredAndGroupedRegularAdmissions}
          />
        )
      ) : (
        <NoLoginMessage />
      )}

      <div className="flex items-center justify-center py-12">
        {user?.id ? (
          <Button onClick={handleNextClick}>다음 단계</Button>
        ) : (
          <Link to="/auth/login" className={cn(buttonVariants())}>
            로그인
          </Link>
        )}
      </div>
    </div>
  );
};

const NoLoginMessage = () => (
  <div className="flex w-full animate-bounce items-center justify-center py-8 font-semibold text-primary">
    🚨 로그인을 해야 서비스를 이용할 수 있습니다.
  </div>
);

const NoSelectionMessage = () => (
  <div className="flex w-full animate-bounce items-center justify-center py-8 font-semibold text-primary">
    위 차트에서 대학을 선택해주세요!
  </div>
);

const groupDataByUniversityGeneralField = (
  data: IRegularAdmission[],
  scoreMap: Map<string, ISavedScore>,
): Record<string, IJungsiStep1GroupData> => {
  const grouped: Record<string, IJungsiStep1GroupData> = {};

  for (const item of data) {
    const key = `${item.university.name}-${item.university.region}-${item.general_field_name}`;
    const totalScore = item.total_score || 1000;
    const minCut = parseFloat(item.min_cut || "0");
    const maxCut = parseFloat(item.max_cut || "0");

    // ******************** 최초컷과 추합컷이 모두 0인 경우 (임시) ****************
    if (minCut === 0 && maxCut === 0) {
      continue;
    }
    // ******************** 최초컷과 추합컷이 모두 0인 경우 (임시)  ****************

    if (!grouped[key]) {
      grouped[key] = {
        university_name: item.university.name,
        university_region: item.university.region,
        general_field: item.general_field_name,
        items: [],
        range_min: null,
        range_max: null,
        has_valid_percentile: false,
        user_scores: {},
        max_user_score: null,
      };
    }

    grouped[key].items.push(item);

    // 유효한 값만 range 계산에 포함
    if (minCut > 0) {
      const normalizedMinCut = (minCut / totalScore) * 1000;
      grouped[key].range_min =
        grouped[key].range_min === null
          ? normalizedMinCut
          : Math.min(grouped[key].range_min, normalizedMinCut);
    }
    if (maxCut > 0) {
      const normalizedMaxCut = (maxCut / totalScore) * 1000;
      grouped[key].range_max =
        grouped[key].range_max === null
          ? normalizedMaxCut
          : Math.max(grouped[key].range_max, normalizedMaxCut);
    }

    // 백엔드에서 가져온 환산점수 사용 (scoreCalculationCode 기준)
    const scoreKey = `${item.university.id}_${item.scoreCalculationCode}`;
    const savedScore = scoreMap.get(scoreKey);

    if (savedScore && savedScore.convertedScore) {
      const normalizedUserScore = (savedScore.convertedScore / totalScore) * 1000;
      grouped[key].user_scores[item.id] = {
        score: savedScore.convertedScore,
        error: null,
      };
      grouped[key].max_user_score = Math.max(
        grouped[key].max_user_score || 0,
        normalizedUserScore,
      );
    } else {
      grouped[key].user_scores[item.id] = {
        score: null,
        error: "환산점수 없음",
      };
    }
  }

  // Post-processing
  Object.keys(grouped).forEach((key) => {
    const group = grouped[key];
    if (group.range_min === null && group.range_max === null) {
      group.range_min = 0;
      group.range_max = 0;
      group.has_valid_percentile = false;
    } else if (group.range_min === null) {
      group.range_min = group.range_max!;
      group.has_valid_percentile = false;
    } else if (group.range_max === null) {
      group.range_max = group.range_min;
      group.has_valid_percentile = false;
    } else {
      if (group.range_min === group.range_max) {
        group.range_max = Math.min(group.range_max + 10, 1000);
      }
      if (group.range_min > group.range_max) {
        [group.range_min, group.range_max] = [group.range_max, group.range_min];
      }
      group.has_valid_percentile = true;
    }
  });

  return grouped;
};
