import { Button } from "@/components/custom/button";
import { useState } from "react";
import {
  ISusiComparisonItem,
  SusiComparisonItem,
} from "./susi-comparison-item";
import { SusiComparisonResult } from "./susi-comparison-result";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { toast } from "sonner";

export function SusiComparison() {
  const { data: currentUser } = useGetCurrentUser();
  const [comparisonItems, setComparisonItems] = useState<ISusiComparisonItem[]>(
    Array(6).fill({
      universityId: null,
      universityName: null,
      universityRegion: null,
      admissionType: null,
      admissionId: null,
      admissionName: null,
      recruitmentUnitId: null,
      recruitmentUnitName: null,
    }),
  );
  const [searchRecruitmentIds, setSearchRecruitmentIds] = useState<number[]>(
    [],
  );
  const [showResults, setShowResults] = useState(false);

  const handleItemChange = (
    index: number,
    newItem: Partial<ISusiComparisonItem>,
  ) => {
    setComparisonItems((prevItems) => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], ...newItem };
      return newItems;
    });
  };

  const handleSearch = () => {
    if (!currentUser) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const recruitmentIds = comparisonItems
      .map((item) => item.recruitmentUnitId)
      .filter((id): id is number => id !== null);

    if (!recruitmentIds.length) {
      toast.error("최소 한개 이상의 전형을 선택해주세요.");
      return;
    }

    setSearchRecruitmentIds(recruitmentIds);
    setShowResults(true);
  };

  return (
    <div>
      <p className="pb-2 text-center text-2xl font-semibold md:text-3xl">
        👻 수시/정시 어떤게 유리할까?
      </p>
      <p className="pb-8 text-center text-sm text-foreground/70">
        해당 수시 전형의 정시전형이 존재하는지 확인하고 어떤게 더 유리한지
        비교해보세요!
      </p>

      <ul className="mx-auto max-w-screen-md space-y-2">
        {comparisonItems.map((item, index) => (
          <SusiComparisonItem
            key={index}
            item={item}
            onItemChange={(newItem) => handleItemChange(index, newItem)}
          />
        ))}
      </ul>

      <div className="mt-4 flex justify-center">
        <Button onClick={handleSearch} className="px-20">
          정시 비교하기
        </Button>
      </div>

      {showResults && (
        <div className="mt-8">
          <SusiComparisonResult recruitmentIds={searchRecruitmentIds} />
        </div>
      )}
    </div>
  );
}
