import { useState, useEffect, useMemo } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { RequireLoginMessage } from "@/components/require-login-message";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import {
  useGetRegularCombinations,
  useGetCalculatedScores,
} from "@/stores/server/features/jungsi/queries";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import {
  IRegularCombination,
  IRegularAdmission,
  ISavedScore,
} from "@/stores/server/features/jungsi/interfaces";
import { calc정시위험도 } from "@/lib/calculations/regular-v2/risk";
import { MockApplicationSection } from "@/components/reports/jungsi-report/mock-application-section";
import { RiskBadge } from "@/components/custom/risk-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

// 군 정렬 순서
const GROUP_ORDER: Record<string, number> = {
  "가": 0,
  "나": 1,
  "다": 2,
};
const getGroupOrder = (type: string) => GROUP_ORDER[type] ?? 3;

export const Route = createLazyFileRoute("/mock-apply/")({
  component: MockApplyPage,
});

function MockApplyPage() {
  const { data: currentUser, isLoading: isUserLoading } = useGetCurrentUser();
  const { data: combinations, isLoading: isCombinationsLoading } = useGetRegularCombinations();
  const { data: _mockExamScores } = useGetMockExamStandardScores();
  const { data: backendCalculatedScores, isLoading: isLoadingScores } =
    useGetCalculatedScores();

  const [selectedCombination, setSelectedCombination] = useState<IRegularCombination | null>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<IRegularAdmission | null>(null);
  const [isAdmissionListOpen, setIsAdmissionListOpen] = useState(true);

  // 백엔드 calculatedScores를 scoreMap으로 매핑 (scoreCalculationCode 기준)
  const scoreMap = useMemo(() => {
    if (!backendCalculatedScores) return new Map<string, ISavedScore>();

    return new Map(
      backendCalculatedScores.map((score) => [
        `${score.universityId}_${score.scoreCalculationCode}`,
        score,
      ]),
    );
  }, [backendCalculatedScores]);

  // admission별 점수 조회 헬퍼 (scoreCalculationCode 기준)
  const getScoreForAdmission = (admission: IRegularAdmission): number | null => {
    const scoreKey = `${admission.university?.id}_${admission.scoreCalculationCode}`;
    const savedScore = scoreMap.get(scoreKey);
    return savedScore?.convertedScore ?? null;
  };

  // 페이지 로드 시 자동으로 첫 번째 조합 선택
  useEffect(() => {
    if (combinations?.length && !selectedCombination) {
      setSelectedCombination(combinations[0]);
    }
  }, [combinations, selectedCombination]);

  // 조합 선택 시 자동으로 첫 번째 모집단위 선택
  useEffect(() => {
    if (selectedCombination && !selectedAdmission) {
      const sortedAdmissions = [...selectedCombination.regularAdmissions].sort(
        (a, b) => getGroupOrder(a.admissionType) - getGroupOrder(b.admissionType)
      );
      if (sortedAdmissions.length > 0) {
        setSelectedAdmission(sortedAdmissions[0]);
      }
    }
  }, [selectedCombination, selectedAdmission]);

  // 조합 변경 핸들러
  const handleCombinationChange = (combinationId: string) => {
    const combination = combinations?.find((c) => c.id.toString() === combinationId);
    if (combination) {
      setSelectedCombination(combination);
      setSelectedAdmission(null); // 조합 변경 시 선택된 모집단위 초기화
    }
  };

  // 모집단위 선택 핸들러
  const handleAdmissionSelect = (admission: IRegularAdmission) => {
    setSelectedAdmission(admission);
  };

  // 로딩 중
  if (isUserLoading || isCombinationsLoading || isLoadingScores) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 로그인 필요
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <RequireLoginMessage />
      </div>
    );
  }

  // 조합 없음
  if (!combinations?.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-semibold mb-2">저장된 조합이 없습니다</p>
            <p className="text-sm text-muted-foreground text-center">
              정시 관심대학에서 조합을 먼저 생성해주세요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedAdmissions = selectedCombination
    ? [...selectedCombination.regularAdmissions].sort(
        (a, b) => getGroupOrder(a.admissionType) - getGroupOrder(b.admissionType)
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-4">모의지원 시뮬레이션</h1>

          {/* 조합 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">조합 선택</label>
            <Select
              value={selectedCombination?.id.toString()}
              onValueChange={handleCombinationChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="조합을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {combinations?.map((combination) => (
                  <SelectItem key={combination.id} value={combination.id.toString()}>
                    {combination.name} ({combination.regularAdmissions?.length}개 대학)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 거북쌤 안내 */}
        <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <img
            src="/images/turtle-teacher.png"
            alt="거북쌤"
            className="w-16 h-16 object-contain flex-shrink-0"
          />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">2026 정시 모의지원 시뮬레이션</p>
            <p className="leading-relaxed text-xs">
              작년 경쟁률 상황에서, "작년 입결 + 올해 실제 모의지원" 데이터를 기반으로
              합격/불합격 가능성과 예상 등수를 알려드립니다.
            </p>
          </div>
        </div>

        {/* 모집단위 목록 */}
        {selectedCombination && (
          <Card>
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between py-3"
              onClick={() => setIsAdmissionListOpen(!isAdmissionListOpen)}
            >
              <CardTitle className="text-base">
                모집단위 목록 ({sortedAdmissions.length}개)
              </CardTitle>
              {isAdmissionListOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CardHeader>
            {isAdmissionListOpen && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {sortedAdmissions.map((admission) => {
                    const score = getScoreForAdmission(admission);
                    const isSelected = selectedAdmission?.id === admission.id;

                    return (
                      <div
                        key={admission.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/10 border-primary"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handleAdmissionSelect(admission)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {admission.admissionType}군
                              </span>
                              <span className="font-medium truncate">
                                {admission.university?.name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {admission.recruitmentName || admission.admissionName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            {/* 내 점수 */}
                            <div className="text-right">
                              <p className="text-xs text-gray-500">내 점수</p>
                              <p className="text-sm font-medium">
                                {score ? score.toFixed(1) : "-"}
                              </p>
                            </div>
                            {/* 위험도 */}
                            <div>
                              {score ? (
                                <RiskBadge
                                  risk={calc정시위험도(score, {
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
                                  })}
                                />
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* 선택된 대학 시뮬레이션 */}
        {selectedAdmission && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground">
                    {selectedAdmission.admissionType}군
                  </span>
                  {selectedAdmission.university?.name} - {selectedAdmission.recruitmentName || selectedAdmission.admissionName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MockApplicationSection
                  universityCode={selectedAdmission.university?.code || ""}
                  universityName={selectedAdmission.university?.name || ""}
                  recruitmentUnit={selectedAdmission.recruitmentName || ""}
                  admissionType={selectedAdmission.admissionType}
                  myScore={getScoreForAdmission(selectedAdmission) ?? undefined}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
