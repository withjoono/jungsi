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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/loading-spinner";

import 가군데이터 from "@/constants/백분위/202509_가군.json";
import 나군데이터 from "@/constants/백분위/202509_나군.json";
import 다군데이터 from "@/constants/백분위/202509_다군.json";
import { IRegion } from "@/types/region.type";
import { RegionSelector } from "../step-1/region-selector";
import JungsiStep1Chart from "./step-1-chart";
import SelectedChartDataTable from "./selected-chart-data-table";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";

export interface I대학백분위 {
  대학명: string;
  지역: string;
  최저값: string;
  최고값: string;
}

export const JungsiStep1v2 = () => {
  const { data: user } = useGetCurrentUser();
  const { formData, nextStep, updateFormData } = useExploreJungsiStepper();
  const { data: activeServices } = useGetActiveServices();
  const { data: mockExamScores } = useGetMockExamStandardScores();

  const [isSorted, setIsSorted] = useState(false);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    [],
  );
  const [filteredData, setFilteredData] = useState<I대학백분위[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 백엔드에서 계산된 나의 누적백분위 사용
  const userPercentile = useMemo(() => {
    if (!mockExamScores) return 0;
    return mockExamScores.myCumulativePercentile;
  }, [mockExamScores]);

  useEffect(() => {
    setIsLoading(true);
    let data: I대학백분위[];
    switch (formData.admissionType) {
      case "가":
        data = 가군데이터;
        break;
      case "나":
        data = 나군데이터;
        break;
      case "다":
        data = 다군데이터;
        break;
      default:
        data = [];
    }

    const filtered = data.filter(
      (item) =>
        formData.region.length === 0 ||
        formData.region.includes(item.지역 as IRegion),
    );

    let sortedData = filtered;
    if (isSorted) {
      sortedData = [...filtered].sort(
        (a, b) => parseFloat(a.최고값) - parseFloat(b.최고값),
      );
    }

    setFilteredData(sortedData);
    setIsLoading(false);
  }, [formData.admissionType, formData.region, isSorted]);

  const handleNextClick = () => {
    if (!user?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (!activeServices?.includes("S")) {
      toast.error("이용권 구매가 필요합니다.");
      return;
    }
    if (selectedUniversities.length > 20) {
      toast.error("한번에 최대 20개의 대학만 선택할 수 있습니다.");
      return;
    }
    updateFormData(
      "step1SelectedItems",
      selectedUniversities.map((n) => {
        const [name, region] = n.split("-");
        return {
          universityName: name,
          region: region,
        };
      }),
    );
    nextStep();
  };

  const handleSelectUniversity = (key: string) => {
    if (selectedUniversities.length >= 20) {
      toast.error("한번에 최대 20개의 대학만 선택할 수 있습니다.");
      return;
    }
    setSelectedUniversities((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };
  if (isLoading) {
    return <LoadingSpinner className="pt-40" />;
  }

  return (
    <div className="space-y-3 px-4 pt-4 md:space-y-6">
      <RegionSelector />
      <p className="text-red-500">
        ⭐ 차트에서는 원활한 대학 비교를 위해 총점과 점수가 통일되어 있습니다.
      </p>

      <div className="py-4">
        <div className="h-[500px] overflow-x-scroll">
          <JungsiStep1Chart
            data={filteredData}
            onSelectUniversity={handleSelectUniversity}
            selectedKeys={selectedUniversities}
            myScore={userPercentile}
          />
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="sort-switch"
            checked={isSorted}
            onCheckedChange={setIsSorted}
          />
          <Label htmlFor="sort-switch">최고점 기준 정렬</Label>
        </div>
      </div>

      {user?.id ? (
        <SelectedChartDataTable
          selectedUniversities={selectedUniversities}
          setSelectedUniversities={setSelectedUniversities}
          data={filteredData}
          myScore={userPercentile}
        />
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

export default JungsiStep1v2;
