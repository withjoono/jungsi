import { cn } from "@/lib/utils";
import { Button } from "@/components/custom/button";
import { useExploreJungsiStepper } from "../../context/explore-jungsi-provider";

interface GeneralFieldSelectorProps {
  className?: string;
}

export const GeneralFieldSelector = ({
  className,
}: GeneralFieldSelectorProps) => {
  const { formData, updateFormData } = useExploreJungsiStepper();

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text:lg font-semibold md:text-xl">🔧 계열 선택</p>
      <div className="flex flex-wrap items-center gap-2">
        {["통합선발", "이과"].map((generalField) => {
          const isSelected = formData.selectedGeneralFieldName === generalField;
          return (
            <Button
              key={generalField}
              variant={isSelected ? "default" : "outline"}
              className="px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm"
              onClick={() => {
                if (isSelected) {
                  return;
                }
                updateFormData("selectedGeneralFieldName", generalField);
              }}
            >
              {generalField}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
