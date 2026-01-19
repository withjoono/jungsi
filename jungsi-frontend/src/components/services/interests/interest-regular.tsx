import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/custom/button";
import { Trash } from "lucide-react";
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
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import UnknownErrorPage from "@/components/errors/unknown-error";
import LoadingSpinner from "@/components/loading-spinner";
import {
  useGetInterestRegularAdmissions,
  useGetCalculatedScores,
} from "@/stores/server/features/jungsi/queries";
import { useRemoveInterestRegularAdmission } from "@/stores/server/features/jungsi/mutations";
import {
  InterestRegularTable,
  ProcessedAdmission,
} from "./interest-regular-table";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";
import { calc정시위험도 } from "@/lib/calculations/regular-v2/risk";

type InterestRegularProps = {
  onClickRegularDetail: (regularAdmissionId: number) => void;
  className?: string;
  isCreatingCombination: boolean;
  selectedItems: IRegularAdmission[];
  toggleItemSelection: (item: IRegularAdmission) => void;
  admissionType: "가" | "나" | "다";
};

export const InterestRegular = React.memo(
  ({
    onClickRegularDetail,
    className,
    isCreatingCombination,
    selectedItems,
    toggleItemSelection,
    admissionType,
  }: InterestRegularProps) => {
    const {
      data: interestUnits,
      refetch: refetchInterestUnits,
      status: interestUnitsStatus,
    } = useGetInterestRegularAdmissions(admissionType);

    const removeInterestUniv = useRemoveInterestRegularAdmission();
    useGetMockExamStandardScores(); // Query hook - data used for cache warming
    const { data: calculatedScores, isLoading: isLoadingScores } =
      useGetCalculatedScores();

    const [processedAdmissions, setProcessedAdmissions] = useState<
      ProcessedAdmission[]
    >([]);

    // 환산점수를 기반으로 admission 데이터 처리
    useEffect(() => {
      const processAdmissions = () => {
        if (!interestUnits || !calculatedScores) return;

        const processed: ProcessedAdmission[] = [];

        // 환산점수를 universityId + scoreCalculationCode로 매핑
        // 같은 대학에 여러 학과가 있고, 각 학과마다 다른 환산점수 공식을 사용
        const scoreMap = new Map(
          calculatedScores.map((score) => [
            `${score.universityId}_${score.scoreCalculationCode}`,
            score,
          ]),
        );

        for (const admission of interestUnits) {
          // universityId + scoreCalculationCode로 정확한 매칭
          const scoreKey = `${admission.university.id}_${admission.scoreCalculationCode}`;
          const savedScore = scoreMap.get(scoreKey);

          if (savedScore && savedScore.convertedScore) {
            const myScore = savedScore.convertedScore;
            const risk = calc정시위험도(myScore, {
              risk_10: parseFloat(admission.riskPlus5 || "0"),
              risk_9: parseFloat(admission.riskPlus4 || "0"),
              risk_8: parseFloat(admission.riskPlus3 || "0"),
              risk_7: parseFloat(admission.riskPlus2 || "0"),
              risk_6: parseFloat(admission.riskPlus1 || "0"),
              risk_5: parseFloat(admission.riskMinus1 || "0"),
              risk_4: parseFloat(admission.riskMinus2 || "0"),
              risk_3: parseFloat(admission.riskMinus3 || "0"),
              risk_2: parseFloat(admission.riskMinus4 || "0"),
              risk_1: parseFloat(admission.riskMinus5 || "0"),
            });
            const standardScoreSum = savedScore.standardScoreSum || 0;

            // 유불리 점수 차이 계산 (백엔드에서 유불리 점수를 제공하지 않으므로 0 설정)
            const scoreDifference = 0; // TODO: 백엔드에서 유불리 점수 제공 시 수정
            const normalizedScoreDifference = 0;

            processed.push({
              ...admission,
              myScore,
              risk,
              standardScore: standardScoreSum,
              scoreDifference,
              normalizedScoreDifference,
            });
          } else {
            processed.push({
              ...admission,
              errorMessage: "환산점수 없음",
            });
          }
        }

        setProcessedAdmissions(processed);
      };

      processAdmissions();
    }, [interestUnits, calculatedScores]);

    const removeItem = useCallback(
      async (ids: number[]) => {
        if (!interestUnits) return;
        const result = await removeInterestUniv.mutateAsync({
          targetIds: ids,
          admissionType: admissionType,
        });
        if (result.success) {
          await refetchInterestUnits();
          toast.success(`성공적으로 대학을 삭제했습니다.`);
        } else {
          toast.error(result.error);
        }
      },
      [interestUnits, removeInterestUniv, refetchInterestUnits, admissionType],
    );

    const removeAllItems = useCallback(async () => {
      if (!interestUnits) return;
      const result = await removeInterestUniv.mutateAsync({
        targetIds: interestUnits.map((item) => item.id),
        admissionType: admissionType,
      });
      if (result.success) {
        await refetchInterestUnits();
        toast.success(`성공적으로 모든 대학을 삭제했습니다.`);
      } else {
        toast.error(result.error);
      }
    }, [
      interestUnits,
      removeInterestUniv,
      refetchInterestUnits,
      admissionType,
    ]);

    if (interestUnitsStatus === "pending" || isLoadingScores) {
      return <LoadingSpinner />;
    }

    if (interestUnitsStatus === "error") {
      return <UnknownErrorPage />;
    }

    if (processedAdmissions.length === 0) {
      return (
        <div className="flex w-full flex-col items-center justify-center space-y-2 py-20">
          <p className="text-base font-semibold sm:text-lg">
            관심대학으로 선택된 대학 목록이 비어있어요 🥲
          </p>
          <p className="text-sm text-foreground/70">
            <Link
              to={`/jungsi/${admissionType === "가" ? "a" : admissionType === "나" ? "b" : "c"}`}
              className="text-blue-500"
            >
              {admissionType}군 탐색
            </Link>
            에서 대학을 탐색해서 관심목록에 담아보세요!
          </p>
        </div>
      );
    }

    return (
      <div className={cn("", className)}>
        <div className="flex items-center justify-end pb-2">
          {!isCreatingCombination && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  variant={"destructive"}
                >
                  <Trash className="size-4" />
                  전체삭제({processedAdmissions.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 삭제할까요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    관심대학으로 선택된 모든 대학 목록(교과)이 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={removeAllItems}>
                    확인
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <InterestRegularTable
          data={processedAdmissions}
          removeItem={removeItem}
          isCreatingCombination={isCreatingCombination}
          selectedItems={selectedItems}
          toggleItemSelection={toggleItemSelection}
          onClickRegularDetail={onClickRegularDetail}
          admissionType={admissionType}
        />
      </div>
    );
  },
);
