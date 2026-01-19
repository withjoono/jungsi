import React, { useState, useCallback } from "react";
import { RiskBadge } from "@/components/custom/risk-badge";
import { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/custom/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface ProcessedAdmission extends IRegularAdmission {
  myScore?: number;
  risk?: number;
  standardScore?: number;
  scoreDifference?: number;
  normalizedScoreDifference?: number;
  errorMessage?: string;
}

interface InterestRegularTableProps {
  data: ProcessedAdmission[];
  removeItem: (ids: number[]) => Promise<void>;
  onClickRegularDetail: (regularAdmissionId: number) => void;
  isCreatingCombination: boolean;
  selectedItems: IRegularAdmission[];
  toggleItemSelection: (item: IRegularAdmission) => void;
  admissionType: "가" | "나" | "다";
}

type SortType = "none" | "myScore" | "risk";

export const InterestRegularTable: React.FC<InterestRegularTableProps> = ({
  data,
  removeItem,
  onClickRegularDetail,
  isCreatingCombination,
  selectedItems,
  toggleItemSelection,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState<SortType>("myScore");
  const itemsPerPage = 10;

  const sortedData = React.useMemo(() => {
    switch (sortType) {
      case "myScore":
        return [...data].sort((a, b) => (b.myScore || 0) - (a.myScore || 0));
      case "risk":
        return [...data].sort((a, b) => (b.risk || 0) - (a.risk || 0));
      default:
        return data;
    }
  }, [data, sortType]);

  const currentItems = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSortChange = (newSortType: SortType) => {
    setSortType((prevSortType) =>
      prevSortType === newSortType ? "none" : newSortType,
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === data.length) {
      toggleItemSelection([] as unknown as IRegularAdmission);
    } else {
      data.forEach((item) => toggleItemSelection(item));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isCreatingCombination && (
            <Button
              className="flex items-center px-3 py-1.5"
              variant={
                selectedItems.length === data.length ? "default" : "outline"
              }
              onClick={handleSelectAll}
            >
              <span>전체 선택/해제</span>
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="myScoreSort"
              checked={sortType === "myScore"}
              onCheckedChange={() => handleSortChange("myScore")}
            />
            <Label htmlFor="myScoreSort">내 점수 정렬</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="riskSort"
              checked={sortType === "risk"}
              onCheckedChange={() => handleSortChange("risk")}
            />
            <Label htmlFor="riskSort">위험도 정렬</Label>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-96 table-fixed bg-white text-sm">
          <thead className="bg-gray-100">
            <tr>
              {isCreatingCombination && (
                <th className="w-12 py-2 text-start font-normal">선택</th>
              )}
              <th className="w-28 py-2 text-start font-normal">대학명</th>
              <th className="w-32 py-2 text-start font-normal">전형</th>
              <th className="w-32 py-2 text-start font-normal">학과</th>
              <th className="w-20 py-2 text-start font-normal">총점</th>
              <th className="w-20 py-2 text-start font-normal">환산컷</th>
              <th className="w-24 py-2 text-start font-normal">내 점수</th>
              <th className="w-24 py-2 text-start font-normal">위험도</th>
              <th className="w-20 py-2 text-start font-normal">상세보기</th>
              {!isCreatingCombination && (
                <th className="w-12 py-2 text-start font-normal"></th>
              )}
            </tr>
          </thead>
          <tbody className="font-semibold">
            {currentItems.map((item) => (
              <TableRow
                key={item.id}
                item={item}
                removeItem={removeItem}
                onClickRegularDetail={onClickRegularDetail}
                isCreatingCombination={isCreatingCombination}
                isSelected={selectedItems.includes(item)}
                toggleItemSelection={toggleItemSelection}
              />
            ))}
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
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

const TableRow: React.FC<{
  item: ProcessedAdmission;
  removeItem: (ids: number[]) => Promise<void>;
  onClickRegularDetail: (regularAdmissionId: number) => void;
  isCreatingCombination: boolean;
  isSelected: boolean;
  toggleItemSelection: (item: IRegularAdmission) => void;
}> = ({
  item,
  removeItem,
  onClickRegularDetail,
  isCreatingCombination,
  isSelected,
  toggleItemSelection,
}) => {
  const handleRowClick = useCallback(() => {
    if (isCreatingCombination) {
      toggleItemSelection(item);
    }
  }, [isCreatingCombination, toggleItemSelection, item]);

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      toggleItemSelection(item);
    },
    [toggleItemSelection, item],
  );

  return (
    <tr
      className={cn("cursor-pointer border-t", isSelected && "bg-blue-100")}
      onClick={handleRowClick}
    >
      {isCreatingCombination && (
        <td className="py-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
          />
        </td>
      )}
      <td className="py-2">
        {item.university.name}({item.university.region})
      </td>
      <td className="py-2">{item.admission_name}</td>
      <td className="break-all py-2">{item.recruitment_name}</td>
      <td className="py-2">{item.total_score}</td>
      <td className="py-2">
        {item.min_cut ? parseFloat(item.min_cut).toFixed(2) : "-"}
      </td>
      <td className="py-2">{item.errorMessage || item.myScore?.toFixed(2)}</td>
      <td className="py-2">
        {item.errorMessage || <RiskBadge risk={item.risk || 0} />}
      </td>
      <td className="py-2" onClick={(e) => e.stopPropagation()}>
        <p
          className="cursor-pointer text-primary hover:underline"
          onClick={() => onClickRegularDetail(item.id)}
        >
          입결 확인
        </p>
      </td>
      {!isCreatingCombination && (
        <td className="py-2" onClick={(e) => e.stopPropagation()}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <th className="cursor-pointer text-red-500 hover:underline">
                삭제
              </th>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말 삭제할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  {item.university.name}({item.admission_name})가 관심대학
                  목록에서 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={() => removeItem([item.id])}>
                  확인
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </td>
      )}
    </tr>
  );
};

export default InterestRegularTable;
