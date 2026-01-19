import { Button } from "@/components/custom/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  IExploreEarlySubjectStep1Item,
  IExploreEarlySubjectStep1Response,
} from "@/stores/server/features/explore/early-subject/interfaces";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

interface SelectedChartDataTableProps {
  className?: string;
  data: IExploreEarlySubjectStep1Response;
  myGrade?: number;
  list: string[];
  selectedUniversities: string[];
  setSelectedUniversities: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SelectedChartDataTable = ({
  data,
  list,
  myGrade,
  selectedUniversities,
  setSelectedUniversities,
  className,
}: SelectedChartDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(list.length / itemsPerPage);

  const onClick = (item: IExploreEarlySubjectStep1Item) => {
    const key = `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}`;
    if (selectedUniversities.includes(key)) {
      setSelectedUniversities(selectedUniversities.filter((n) => n !== key));
    } else {
      setSelectedUniversities([...selectedUniversities, key]);
    }
  };

  const checkSelectedItem = (item: IExploreEarlySubjectStep1Item) => {
    const key = `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}`;
    return selectedUniversities.includes(key);
  };

  const handleSelectAll = () => {
    const allKeys = list
      .map((key) => {
        const item = data.items.find(
          (item) =>
            `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}` ===
            key,
        );
        return item
          ? `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}`
          : "";
      })
      .filter(Boolean);
    const areAllSelected = allKeys.every((key) =>
      selectedUniversities.includes(key),
    );
    if (areAllSelected) {
      setSelectedUniversities([]);
    } else {
      setSelectedUniversities(allKeys);
    }
  };

  const isAllSelected = list.every((key) =>
    selectedUniversities.includes(
      `${data.items.find((item) => `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}` === key)?.university.name}-${data.items.find((item) => `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}` === key)?.name}-${data.items.find((item) => `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}` === key)?.general_type.name}`,
    ),
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-4 pb-8",
        className,
      )}
    >
      <p className="text-center text-2xl font-semibold">
        🏫 대학교 목록({selectedUniversities.length})
      </p>
      <p className="text-center text-sm text-foreground/60">
        내 등급과 비교하여 대학교를 선택해주세요!
      </p>
      <div className="flex flex-col items-center justify-center gap-2 py-4">
        <p>🙋 내 등급이 표시되지 않는다면?</p>
        <Link to="/users/school-record" className="text-sm text-blue-500">
          생기부/성적 등록하기
        </Link>
      </div>

      <div className="w-full max-w-screen-lg overflow-x-auto text-sm">
        <div className="mb-4 flex items-center justify-end gap-4">
          <p>
            {selectedUniversities.length} / {list.length}
          </p>
          <Button
            className="flex items-center px-3 py-1.5"
            variant={isAllSelected ? "default" : "outline"}
            onClick={handleSelectAll}
          >
            <span>전체 선택/해제</span>
          </Button>
        </div>
        <table className="w-full min-w-96 table-fixed bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-8 shrink-0 py-2 font-normal">선택</th>
              <th className="w-28 py-2 text-start font-normal">대학명</th>
              <th className="w-32 py-2 text-start font-normal">상세 전형</th>
              <th className="w-16 py-2 text-start font-normal">계열</th>
              <th className="w-20 py-2 text-start font-normal">최고등급</th>
              <th className="w-20 py-2 text-start font-normal">최저등급</th>
              <th className="w-32 py-2 text-start font-normal">내 등급</th>
            </tr>
          </thead>
          <tbody className="font-semibold">
            {list
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((key) => {
                const item = data.items.find(
                  (item) =>
                    `${item.university.region}-${item.university.name}-${item.name}-${item.general_type.name}` ===
                    key,
                );
                if (!item) return null;

                const isSelected = checkSelectedItem(item);
                return (
                  <tr
                    key={key}
                    className="cursor-pointer border-t hover:bg-accent"
                    onClick={() => onClick(item)}
                  >
                    <td className="align-middle">
                      <div className="flex h-full items-center justify-center">
                        <Checkbox checked={isSelected} />
                      </div>
                    </td>
                    <td className="py-2">
                      {item.university.name}({item.university.region})
                    </td>
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.general_type.name}</td>
                    <td className="py-2">
                      {item.min_cut?.toFixed(2) || "-"} 등급
                    </td>
                    <td className="py-2">
                      {item.max_cut?.toFixed(2) || "-"} 등급
                    </td>
                    <td className="py-2">
                      {myGrade ? `${myGrade} 등급` : "내 성적 없음"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-center space-y-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {currentPage} / {totalPages}
        </div>
        <div className="flex items-center justify-end space-x-2">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
