import { cn } from "@/lib/utils";
import { Button } from "@/components/custom/button";
import { useExploreEarlySubjectStepper } from "../../context/explore-early-subject-provider";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";

interface GeneralFieldSelectorProps {
  className?: string;
}

export const GeneralFieldSelector = ({
  className,
}: GeneralFieldSelectorProps) => {
  const { formData, updateFormData } = useExploreEarlySubjectStepper();
  const { data: staticData } = useGetStaticData();

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text:lg font-semibold md:text-xl">🔧 계열 선택</p>
      <div className="flex flex-wrap items-center gap-2">
        {Object.values(staticData?.fields.GENERAL_FIELDS || {}).map(
          (generalField) => {
            const isSelected = formData.selectedGeneralFieldIds.includes(
              generalField.id,
            );
            return (
              <Button
                key={generalField.id}
                variant={isSelected ? "default" : "outline"}
                className="px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm"
                onClick={() => {
                  if (
                    isSelected &&
                    formData.selectedGeneralFieldIds.length === 1
                  ) {
                    return;
                  }
                  updateFormData(
                    "selectedGeneralFieldIds",
                    isSelected
                      ? formData.selectedGeneralFieldIds.filter(
                          (n) => n !== generalField.id,
                        )
                      : [...formData.selectedGeneralFieldIds, generalField.id],
                  );
                }}
              >
                {generalField.name}
              </Button>
            );
          },
        )}
      </div>
    </div>
  );
};
