import { useMemo, useState } from "react";
import { Step1Chart } from "./step-1-chart";
import { BasicTypeSelector } from "./basic-type-selector";
import { RegionSelector } from "./region-selector";
import { GeneralFieldSelector } from "./general-field-selector";
import { AdmissionSubtypeSelector } from "./admission-subtype-selector";
import { SelectedChartDataTable } from "./selected-chart-data-table";
import { toast } from "sonner";
import {
  useGetCurrentUser,
  useGetMyGrade,
} from "@/stores/server/features/me/queries";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/custom/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useExploreEarlySubjectStepper } from "../../context/explore-early-subject-provider";
import { IRegion } from "@/types/region.type";
import { useGetExploreEarlySubjectStep1 } from "@/stores/server/features/explore/early-subject/queries";
import {
  IExploreEarlySubjectStep1Item,
  IExploreEarlySubjectStep1Response,
} from "@/stores/server/features/explore/early-subject/interfaces";

export const EarlySubjectStep1 = () => {
  const user = useGetCurrentUser();
  const { formData, nextStep, updateFormData } =
    useExploreEarlySubjectStepper();

  const earlySubjectStep1 = useGetExploreEarlySubjectStep1({
    year: 2025,
    basicType: formData.basicType,
  });
  const data = earlySubjectStep1.data || { items: [] };

  const [isSorted, setIsSorted] = useState(false);
  const [selectedUniversitiesChart, setSelectedUniversitiesChart] = useState<
    string[]
  >([]);
  const [selectedUniversitiesTable, setSelectedUniversitiesTable] = useState<
    string[]
  >([]);
  const { data: myGrade } = useGetMyGrade();

  const filteredData = useMemo(
    () => filterData(data, formData, isSorted),
     
    [formData, data, isSorted],
  );

  const handleNextClick = () => {
    if (!user.data?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    updateFormData(
      "step1SelectedIds",
      selectedUniversitiesTable.flatMap(
        (key) =>
          data.items.find(
            (item) =>
              `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}` ===
              key,
          )?.recruitment_unit_ids || [],
      ),
    );
    nextStep();
  };

  const resetSelect = () => {
    setSelectedUniversitiesChart([]);
    setSelectedUniversitiesTable([]);
  };

  return (
    <div className="space-y-3 px-2 pt-4 md:space-y-6">
      <BasicTypeSelector resetSelect={resetSelect} />
      <RegionSelector />
      <GeneralFieldSelector />
      {formData.basicType === "특별" ? <AdmissionSubtypeSelector /> : null}

      <div className="py-4">
        <ChartViewer
          data={filteredData}
          selectedUniversities={selectedUniversitiesChart}
          setSelectedUniversities={setSelectedUniversitiesChart}
          myGrade={myGrade}
        />
        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="airplane-mode"
            checked={isSorted}
            onCheckedChange={setIsSorted}
          />
          <Label htmlFor="airplane-mode">추합컷 정렬</Label>
        </div>
      </div>

      {user.data?.id ? (
        selectedUniversitiesChart.length === 0 ? (
          <NoSelectionMessage />
        ) : (
          <SelectedChartDataTable
            list={selectedUniversitiesChart}
            myGrade={myGrade}
            selectedUniversities={selectedUniversitiesTable}
            setSelectedUniversities={setSelectedUniversitiesTable}
            data={data}
          />
        )
      ) : (
        <NoLoginMessage />
      )}

      <div className="flex items-center justify-center py-12">
        {user.data?.id ? (
          <Button
            disabled={
              selectedUniversitiesChart.length === 0 ||
              selectedUniversitiesTable.length === 0
            }
            onClick={handleNextClick}
          >
            다음 단계
          </Button>
        ) : (
          <Link to="/auth/login" className={cn(buttonVariants())}>
            로그인
          </Link>
        )}
      </div>
    </div>
  );
};

const ChartViewer = ({
  data,
  selectedUniversities,
  setSelectedUniversities,
  myGrade,
}: {
  data: IExploreEarlySubjectStep1Response;
  selectedUniversities: string[];
  setSelectedUniversities: React.Dispatch<React.SetStateAction<string[]>>;
  myGrade?: number | null;
}) => {
  const handleChartClick = (item: IExploreEarlySubjectStep1Item | string) => {
    if (typeof item === "string") {
      setSelectedUniversities((prevSelected) =>
        prevSelected.includes(item)
          ? prevSelected.filter((n) => n !== item)
          : [...prevSelected, item],
      );
    } else {
      const key = `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}`;
      setSelectedUniversities((prevSelected) =>
        prevSelected.includes(key)
          ? prevSelected.filter((n) => n !== key)
          : [...prevSelected, key],
      );
    }
  };

  const isSelected = (item: IExploreEarlySubjectStep1Item | string) => {
    if (typeof item === "string") {
      return selectedUniversities.includes(item);
    } else {
      const key = `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}`;
      return selectedUniversities.includes(key);
    }
  };

  if (!data) return <div></div>;

  return (
    <div className="h-[500px] overflow-x-auto">
      <Step1Chart
        data={data}
        myGrade={myGrade}
        onClickItem={handleChartClick}
        checkSelectedItem={isSelected}
      />
    </div>
  );
};

const filterData = (
  data: IExploreEarlySubjectStep1Response | null,
  formData: any,
  isSorted: boolean,
): IExploreEarlySubjectStep1Response => {
  if (!data) return { items: [] };

  let filteredItems = data.items.filter((item) => {
    if (!item.general_type.name) return false;

    // 지역 필터
    if (
      formData.region.length > 0 &&
      !formData.region.includes(item.university.region as IRegion)
    ) {
      return false;
    }

    // 계열 필터
    if (
      formData.selectedGeneralFieldIds.length > 0 &&
      !formData.selectedGeneralFieldIds.includes(item.general_type.id)
    ) {
      return false;
    }

    // 특별전형 필터
    if (
      formData.basicType === "특별" &&
      formData.selectedSubtypeIds.length > 0 &&
      !formData.selectedSubtypeIds.some((id: number) =>
        item.subtype_ids.includes(id),
      )
    ) {
      return false;
    }

    return true;
  });

  if (isSorted) {
    filteredItems = filteredItems.sort(
      (a, b) => (a.max_cut || 0) - (b.max_cut || 0),
    );
  }

  return { items: filteredItems };
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
