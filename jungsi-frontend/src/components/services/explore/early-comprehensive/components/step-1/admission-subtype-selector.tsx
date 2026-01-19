import { cn } from "@/lib/utils";
import { Button } from "@/components/custom/button";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import { useExploreEarlyComprehensiveStepper } from "../../context/explore-early-comprehensive-provider";

interface AdmissionSubtypeSelectorProps {
  className?: string;
}

export const AdmissionSubtypeSelector = ({
  className,
}: AdmissionSubtypeSelectorProps) => {
  const { formData, updateFormData } = useExploreEarlyComprehensiveStepper();
  const { data: staticData } = useGetStaticData();

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-lg font-semibold md:text-xl">🔥 상세 전형 선택</p>
      <p className="text-sm text-foreground/60">
        선택한 전형이 하나라도 포함된 대학을 찾아요
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {Object.values(staticData?.fields.ADMISSION_SUBTYPES || {}).map(
          (type) => {
            const isSelected = formData.selectedSubtypeIds.includes(type.id);
            return (
              <Button
                key={type.id}
                variant={isSelected ? "default" : "outline"}
                className="px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm"
                onClick={() => {
                  updateFormData(
                    "selectedSubtypeIds",
                    isSelected
                      ? formData.selectedSubtypeIds.filter((n) => n !== type.id)
                      : [...formData.selectedSubtypeIds, type.id],
                  );
                }}
              >
                {type.name}
              </Button>
            );
          },
        )}
      </div>
    </div>
  );
};
