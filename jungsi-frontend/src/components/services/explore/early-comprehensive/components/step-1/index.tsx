import { useMemo, useState } from "react";
import { BasicTypeSelector } from "./basic-type.selector";
import { RegionSelector } from "./region-selector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/custom/button";
import {
  useGetActiveServices,
  useGetMyGrade,
} from "@/stores/server/features/me/queries";
import { toast } from "sonner";
import { useExploreEarlyComprehensiveStepper } from "../../context/explore-early-comprehensive-provider";
import { useGetExploreEarlyComprehensiveStep1 } from "@/stores/server/features/explore/early-comprehensive/queries";
import { SelectedChartDataTable } from "./selected-chart-data-table";
import { AdmissionSubtypeSelector } from "./admission-subtype-selector";
import { Step1Chart } from "./step1-chart";
import { IExploreEarlyComprehensiveStep1Item } from "@/stores/server/features/explore/early-comprehensive/interfaces";

export const EarlyComprehensiveStep1 = () => {
  const { formData, nextStep, updateFormData, prevStep } =
    useExploreEarlyComprehensiveStepper();

  const { data: activeServices } = useGetActiveServices();

  const susiComprehensiveStep1 = useGetExploreEarlyComprehensiveStep1({
    year: 2025,
    basicType: formData.basicType,
    minorFieldId: formData.minorField?.id || null,
  });
  const [isSorted, setIsSorted] = useState(false);
  const { data: myGrade } = useGetMyGrade();
  const [selectedUniversitiesTable, setSelectedUniversitiesTable] = useState<
    number[]
  >([]);

  const filteredData = useMemo(
    () =>
      filterData(susiComprehensiveStep1.data?.items || [], formData, isSorted),
    [formData, susiComprehensiveStep1.data, isSorted],
  );

  const handleNextClick = () => {
    if (!activeServices?.includes("S")) {
      toast.error("이용권 구매가 필요합니다.");
      return;
    }

    updateFormData("step1SelectedIds", selectedUniversitiesTable);
    nextStep();
  };

  const resetSelect = () => {
    setSelectedUniversitiesTable([]);
  };

  return (
    <div className="space-y-2 px-2 pt-4">
      <BasicTypeSelector resetSelect={resetSelect} />
      <RegionSelector />
      {formData.basicType === "특별" ? <AdmissionSubtypeSelector /> : null}

      <div className="py-4">
        <ChartViewer data={filteredData} myGrade={myGrade ?? 0} />
        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="airplane-mode"
            checked={isSorted}
            onCheckedChange={setIsSorted}
          />
          <Label htmlFor="airplane-mode">추합컷 정렬</Label>
        </div>
      </div>

      <SelectedChartDataTable
        data={filteredData}
        myGrade={myGrade ?? 0}
        selectedUniversities={selectedUniversitiesTable}
        setSelectedUniversities={setSelectedUniversitiesTable}
      />

      <div className="flex items-center justify-center gap-4 py-12">
        <Button onClick={prevStep} variant={"outline"}>
          이전 단계
        </Button>
        <Button
          disabled={selectedUniversitiesTable.length === 0}
          onClick={handleNextClick}
        >
          다음 단계
        </Button>
      </div>
    </div>
  );
};

const ChartViewer = ({
  data,
  myGrade,
}: {
  data: IExploreEarlyComprehensiveStep1Item[];
  myGrade: number;
}) => {
  return (
    <div className="h-[500px] overflow-x-auto">
      <Step1Chart data={data} myGrade={myGrade} />
    </div>
  );
};

const filterData = (
  data: IExploreEarlyComprehensiveStep1Item[] | null,
  formData: any,
  isSorted: boolean,
): IExploreEarlyComprehensiveStep1Item[] => {
  if (!data) return [];

  let filteredItems = data.filter((item) => {
    if (!item.general_field.name) return false;

    // 지역 필터
    if (
      formData.region.length > 0 &&
      !formData.region.includes(item.admission.university.region)
    ) {
      return false;
    }

    // 특별전형 필터
    if (
      formData.basicType === "특별" &&
      formData.selectedSubtypeIds.length > 0 &&
      !formData.selectedSubtypeIds.some((id: number) =>
        item.admission.subtypes.map((n) => n.id).includes(id),
      )
    ) {
      return false;
    }

    return true;
  });

  if (isSorted) {
    filteredItems = filteredItems.sort(
      (a, b) => (a.scores?.grade_50_cut || 0) - (b.scores?.grade_50_cut || 0),
    );
  }

  return filteredItems;
};
