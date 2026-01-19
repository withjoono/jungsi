import { SearchableDropdown } from "@/components/custom/searchable-dropdown";
import {
  useGetAdmissionsByUniversityId,
  useGetAllUniversities,
  useGetRecruitmentUnitsByAdmissionId,
} from "@/stores/server/features/explore/search/queries";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface ISusiComparisonItem {
  universityId: number | null;
  universityName: string | null;
  universityRegion: string | null;
  admissionType: string | null;
  admissionId: number | null;
  admissionName: string | null;
  recruitmentUnitId: number | null;
  recruitmentUnitName: string | null;
}

interface SusiComparisonItemProps {
  item: ISusiComparisonItem;
  onItemChange: (newItem: Partial<ISusiComparisonItem>) => void;
}

export function SusiComparisonItem({
  item,
  onItemChange,
}: SusiComparisonItemProps) {
  const { data: universities } = useGetAllUniversities();
  const { data: admissions } = useGetAdmissionsByUniversityId(
    item.universityId || 0,
  );
  const { data: recruitmentUnits } = useGetRecruitmentUnitsByAdmissionId(
    item.admissionId || 0,
  );

  const filteredAdmissions = useMemo(
    () =>
      admissions?.filter((admission) =>
        item.admissionType
          ? admission.category.name === item.admissionType
          : true,
      ) || [],
    [admissions, item.admissionType],
  );

  const universityOptions = useMemo(
    () =>
      universities?.map(
        (u: { id: number; name: string; region: string }) =>
          `${u.name} (${u.region})`,
      ) || [],
    [universities],
  );

  const isComplete = item.recruitmentUnitId !== null;

  return (
    <li
      className={cn(
        "flex items-center justify-center gap-2 rounded p-1",
        isComplete && "rounded-lg border-2 border-green-500",
      )}
    >
      <SearchableDropdown
        key={`university-${item.universityId}`}
        items={universityOptions}
        placeholder="대학 선택"
        onSelect={(value) => {
          const selectedUniversity = universities?.find(
            (u) => `${u.name} (${u.region})` === value,
          );
          onItemChange({
            universityId: selectedUniversity?.id || null,
            universityName: selectedUniversity?.name || null,
            universityRegion: selectedUniversity?.region || null,
            admissionType: null,
            admissionId: null,
            admissionName: null,
            recruitmentUnitId: null,
            recruitmentUnitName: null,
          });
        }}
        selectedItem={
          item.universityName && item.universityRegion
            ? `${item.universityName} (${item.universityRegion})`
            : null
        }
      />
      <SearchableDropdown
        key={`admissionType-${item.admissionType}`}
        items={["학생부종합", "학생부교과"]}
        placeholder="학종/교과 선택"
        onSelect={(value) =>
          onItemChange({
            admissionType: value,
            admissionId: null,
            admissionName: null,
            recruitmentUnitId: null,
            recruitmentUnitName: null,
          })
        }
        selectedItem={item.admissionType}
      />
      <SearchableDropdown
        key={`admission-${item.admissionId}`}
        items={filteredAdmissions.map((a) => a.name)}
        placeholder="전형 선택"
        onSelect={(value) => {
          const selectedAdmission = filteredAdmissions.find(
            (a) => a.name === value,
          );
          onItemChange({
            admissionId: selectedAdmission?.id || null,
            admissionName: value,
            admissionType: selectedAdmission?.category.name || null,
            recruitmentUnitId: null,
            recruitmentUnitName: null,
          });
        }}
        selectedItem={item.admissionName}
      />
      <SearchableDropdown
        key={`recruitmentUnit-${item.recruitmentUnitId}`}
        items={(recruitmentUnits || []).map((r) => r.name)}
        placeholder="모집단위 선택"
        onSelect={(value) => {
          const selectedRecruitmentUnit = recruitmentUnits?.find(
            (r) => r.name === value,
          );
          onItemChange({
            recruitmentUnitId: selectedRecruitmentUnit?.id || null,
            recruitmentUnitName: value,
          });
        }}
        selectedItem={item.recruitmentUnitName}
      />
    </li>
  );
}
