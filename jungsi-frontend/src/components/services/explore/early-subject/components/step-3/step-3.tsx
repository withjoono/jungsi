import { useMemo, useState } from "react";
import { GroupedDataTable } from "./grouped-data-table";
import { Button } from "@/components/custom/button";
import { useGetExploreEarlySubjectStep3 } from "@/stores/server/features/explore/early-subject/queries";
import { useExploreEarlySubjectStepper } from "../../context/explore-early-subject-provider";
import { IExploreEarlySubjectStep3Item } from "@/stores/server/features/explore/early-subject/interfaces";
import { useGetActiveServices } from "@/stores/server/features/me/queries";
import { toast } from "sonner";

export interface EarlySubjectStep3GroupData {
  university_name: string;
  university_region: string;
  admission_name: string;
  general_field_name: string;
  method_description: string;
  subject_ratio: number | null;
  document_ratio: number | null;
  interview_ratio: number | null;
  practical_ratio: number | null;
  ids: number[];
}

export const EarlySubjectStep3 = () => {
  const { prevStep, nextStep, formData, updateFormData } =
    useExploreEarlySubjectStepper();

  // queries
  const activeServices = useGetActiveServices();
  const earlySubjectStep3 = useGetExploreEarlySubjectStep3(
    formData.step2SelectedIds,
  );
  const data = earlySubjectStep3.data?.items || [];

  const [selectedUniversitiesTable, setSelectedUniversitiesTable] = useState<
    string[]
  >([]);

  // 대학-전형명-계열로 그룹화 (전체 데이터)
  const allGroupedData = useMemo(
    () => groupDataByUniversityAdmissionField(data),
     
    [data],
  );

  // 다음단계로 (테이블에서 선택한 그룹에 포함된 수시전형 id를 전달)
  const handleNextClick = () => {
    if (!activeServices.data?.includes("S")) {
      toast.error("이용권 구매가 필요합니다.");
      return;
    }

    updateFormData(
      "step3SelectedIds",
      selectedUniversitiesTable.flatMap(
        (key) => allGroupedData[key]?.ids || [],
      ),
    );
    nextStep();
  };

  return (
    <div className="flex flex-col items-center justify-center px-2 py-12">
      <GroupedDataTable
        selectedUniversities={selectedUniversitiesTable}
        setSelectedUniversities={setSelectedUniversitiesTable}
        groupedData={allGroupedData}
      />
      <div className="flex items-center justify-center gap-4 py-12">
        <Button variant={"outline"} onClick={prevStep}>
          이전 단계
        </Button>
        <Button
          onClick={handleNextClick}
          disabled={selectedUniversitiesTable.length === 0}
        >
          다음 단계
        </Button>
      </div>
    </div>
  );
};

const groupDataByUniversityAdmissionField = (
  data: IExploreEarlySubjectStep3Item[],
): Record<string, EarlySubjectStep3GroupData> => {
  return data.reduce<Record<string, EarlySubjectStep3GroupData>>(
    (grouped, item) => {
      const key = `${item.university.name}-${item.university.region}-${item.admission.name}-${item.general_field.name}`;
      if (!grouped[key]) {
        grouped[key] = {
          university_name: item.university.name,
          university_region: item.university.region,
          admission_name: item.admission.name,
          general_field_name: item.general_field.name,
          method_description: item.method.method_description,
          subject_ratio: item.method.subject_ratio,
          document_ratio: item.method.document_ratio,
          interview_ratio: item.method.interview_ratio,
          practical_ratio: item.method.practical_ratio,
          ids: [item.id],
        };
      } else {
        grouped[key].ids.push(item.id);
      }
      return grouped;
    },
    {},
  );
};
