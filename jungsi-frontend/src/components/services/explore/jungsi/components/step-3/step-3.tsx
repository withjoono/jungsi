import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/custom/button";
import { useExploreJungsiStepper } from "../../context/explore-jungsi-provider";
import {
  useGetRegularAdmissions,
  useGetCalculatedScores,
} from "@/stores/server/features/jungsi/queries";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import { calc정시위험도 } from "@/lib/calculations/regular-v2/risk";
import JungsiStep3TableComponent from "./step-3-data-table";
import { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";
import { JungsiStep3Chart } from "./step-3-chart";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { JungsiReport } from "@/components/reports/jungsi-report";
import LoadingSpinner from "@/components/loading-spinner";
import { DEMO_MOCK_EXAM_SCORES } from "../../demo/demo-mock-exam-data";

export interface ProcessedAdmission extends IRegularAdmission {
  myScore?: number;
  risk?: number;
  standardScore?: number;
  optimalScore?: number;      // 동점수 평균
  scoreDifference?: number;   // 유불리 (음수면 유리)
  errorMessage?: string;
}

export const JungsiStep3: React.FC = () => {
  const { prevStep, nextStep, updateFormData, formData, isDemo } =
    useExploreJungsiStepper();
  const { data: regularAdmissions } = useGetRegularAdmissions({
    year: 2026,
    admission_type: formData.admissionType,
  });
  const { data: mockExamScores } = useGetMockExamStandardScores();

  // 데모 모드에서는 샘플 데이터 사용
  const effectiveMockExamScores = isDemo ? DEMO_MOCK_EXAM_SCORES : mockExamScores;
  const { data: calculatedScores, isLoading: isLoadingScores } =
    useGetCalculatedScores();

  const [processedAdmissions, setProcessedAdmissions] = useState<
    ProcessedAdmission[]
  >([]);
  const [selectedAdmissions, setSelectedAdmissions] = useState<number[]>([]);
  const [isSorted, setIsSorted] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const selectedItems = useMemo(() => {
    if (!regularAdmissions) return [];
    return [
      ...new Set([...formData.step1SelectedIds, ...formData.step2SelectedIds]),
    ];
  }, [formData.step1SelectedIds, formData.step2SelectedIds, regularAdmissions]);

  // 환산점수를 기반으로 admission 데이터 처리
  useEffect(() => {
    const processAdmissions = () => {
      if (!regularAdmissions || !calculatedScores) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const filtered = regularAdmissions.filter((admission) =>
        selectedItems.includes(admission.id),
      );
      const processed: ProcessedAdmission[] = [];

      // 환산점수를 universityId + scoreCalculationCode로 매핑
      // 같은 대학에 여러 학과가 있고, 각 학과마다 다른 환산점수 공식을 사용
      const scoreMap = new Map(
        calculatedScores.map((score) => [
          `${score.universityId}_${score.scoreCalculationCode}`,
          score,
        ]),
      );

      // 디버깅: 매칭 분석
      console.log("[Step3 Debug] === 매칭 분석 시작 ===");
      console.log("[Step3 Debug] calculatedScores 개수:", calculatedScores.length);
      console.log("[Step3 Debug] filtered admissions 개수:", filtered.length);
      console.log("[Step3 Debug] scoreMap 키 샘플 (처음 5개):",
        Array.from(scoreMap.keys()).slice(0, 5)
      );

      for (const admission of filtered) {
        // universityId + scoreCalculationCode로 정확한 매칭
        const scoreKey = `${admission.university.id}_${admission.scoreCalculationCode}`;
        const savedScore = scoreMap.get(scoreKey);

        // 디버깅: 각 admission의 매칭 시도 로그
        console.log(`[Step3 Debug] 매칭 시도:`, {
          admissionId: admission.id,
          universityId: admission.university.id,
          universityName: admission.university.name,
          scoreCalculationCode: admission.scoreCalculationCode,
          scoreKey,
          found: !!savedScore,
        });

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
          processed.push({
            ...admission,
            myScore,
            risk,
            standardScore: savedScore.standardScoreSum || 0,
            optimalScore: savedScore.optimalScore,
            scoreDifference: savedScore.scoreDifference,
          });
        } else {
          // 환산점수가 없는 경우 (필수과목 미충족 등)
          processed.push({
            ...admission,
            errorMessage: "환산점수 없음",
          });
        }
      }

      // 디버깅: 매칭 결과 요약
      const matched = processed.filter((p) => p.myScore !== undefined);
      const unmatched = processed.filter((p) => p.errorMessage);
      console.log("[Step3 Debug] === 매칭 결과 요약 ===");
      console.log("[Step3 Debug] 전체:", processed.length);
      console.log("[Step3 Debug] 매칭 성공:", matched.length);
      console.log("[Step3 Debug] 매칭 실패:", unmatched.length);
      if (unmatched.length > 0) {
        console.log("[Step3 Debug] 매칭 실패 목록:", unmatched.map((u) => ({
          id: u.id,
          name: u.university?.name,
          scoreCalculationCode: u.scoreCalculationCode,
        })));
      }

      setProcessedAdmissions(processed);
      setIsLoading(false);
    };

    processAdmissions();
  }, [regularAdmissions, calculatedScores, selectedItems]);

  const toggleSelection = (id: number) => {
    setSelectedAdmissions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedAdmissions.length === processedAdmissions.length) {
      setSelectedAdmissions([]);
    } else {
      setSelectedAdmissions(processedAdmissions.map((item) => item.id));
    }
  };

  const handleNextClick = async () => {
    updateFormData("step3SelectedIds", selectedAdmissions);
    nextStep();
  };

  const resetSelectedItems = () => {
    setSelectedAdmissionId(null);
  };

  const onClickDetail = (admissionId: number) => {
    setSelectedAdmissionId(admissionId);
    window.scrollTo(0, 0);
  };

  if (isLoading || isLoadingScores) {
    return <LoadingSpinner className="pt-40" />;
  }

  // 모의고사 점수가 없는 경우
  if (!effectiveMockExamScores || !effectiveMockExamScores.data || effectiveMockExamScores.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-red-500">
          모의고사 점수가 등록되지 않았습니다.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          먼저 모의고사 점수를 입력해주세요.
        </p>
      </div>
    );
  }

  if (selectedAdmissionId) {
    return (
      <div className="mx-auto max-w-screen-lg space-y-6">
        {/* 상단 버튼 */}
        <div className="sticky top-20 z-10 flex justify-center">
          <Button
            className="w-full max-w-md"
            variant="outline"
            onClick={resetSelectedItems}
          >
            ← 탐색으로 돌아가기
          </Button>
        </div>

        <JungsiReport admissionId={selectedAdmissionId} />

        {/* 하단 버튼 */}
        <div className="flex justify-center pb-10">
          <Button
            className="w-full max-w-md"
            variant="outline"
            onClick={resetSelectedItems}
          >
            ← 탐색으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pt-4 md:space-y-6">
      <p className="text-red-500">
        ⭐ 차트에서는 원활한 대학 비교를 위해 총점과 점수가{" "}
        <b>1000점으로 통일</b>되어 있습니다.
      </p>
      <div className="py-4">
        <div className="h-[500px] w-full overflow-x-auto">
          <JungsiStep3Chart
            data={processedAdmissions}
            onSelectAdmission={(id) => {
              setSelectedAdmissions((prev) =>
                prev.includes(id)
                  ? prev.filter((item) => item !== id)
                  : [...prev, id],
              );
            }}
            selectedAdmissions={selectedAdmissions}
            isSorted={isSorted}
          />
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="sort-switch"
            checked={isSorted}
            onCheckedChange={setIsSorted}
          />
          <Label htmlFor="sort-switch">추합컷 정렬</Label>
        </div>

        <JungsiStep3TableComponent
          admissions={processedAdmissions}
          selectedAdmissions={selectedAdmissions}
          toggleSelection={toggleSelection}
          onSelectAll={handleSelectAll}
          onClickDetail={onClickDetail}
        />
      </div>

      <div className="flex items-center justify-center gap-4 py-12">
        <Button variant={"outline"} onClick={prevStep}>
          이전 단계
        </Button>
        <Button
          onClick={handleNextClick}
          disabled={selectedAdmissions.length === 0}
        >
          다음 단계
        </Button>
      </div>
    </div>
  );
};

export default JungsiStep3;
