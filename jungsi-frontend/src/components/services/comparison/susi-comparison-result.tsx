import { useEffect, useState, useMemo } from "react";
import { useGetRecruitmentUnitsByIds } from "@/stores/server/features/explore/search/queries";
import {
  useGetMyGrade,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import { useGetCalculatedScores } from "@/stores/server/features/jungsi/queries";
import { ISavedScore } from "@/stores/server/features/jungsi/interfaces";
import { RiskBadge } from "@/components/custom/risk-badge";
import { calculateComprehensiveRisk } from "@/lib/calculations/early-compatibility-risk";
import { calculateSubjectRisk } from "@/lib/calculations/subject/risk";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useGetOfficerEvaluationList,
  useGetOfficerEvaluations,
} from "@/stores/server/features/susi/evaluation/queries";
import { Badge } from "@/components/ui/badge";
import { calc정시위험도 } from "@/lib/calculations/regular-v2/risk";

interface SusiComparisonResultProps {
  recruitmentIds: number[];
}

export function SusiComparisonResult({
  recruitmentIds,
}: SusiComparisonResultProps) {
  const { data, isLoading, error } =
    useGetRecruitmentUnitsByIds(recruitmentIds);
  const { data: myGrade } = useGetMyGrade();

  interface ProcessedAdmission {
    item: NonNullable<typeof data>[number];
    susi: {
      risk: number | null;
      errorMessage: string | null;
    };
    jungsi: {
      myScore: number | null;
      risk: number | null;
      scoreDifference: number | null;
      errorMessage: string | null;
    };
  }

  const [processedAdmissions, setProcessedAdmissions] = useState<ProcessedAdmission[]>([]);
  const { data: mockExamScores } = useGetMockExamStandardScores();
  const { data: schoolRecord } = useGetSchoolRecords();
  const { data: staticData } = useGetStaticData();
  const { data: officerList } = useGetOfficerEvaluationList();
  const evaluations = useGetOfficerEvaluations([
    ...new Set(officerList?.map((n) => n.id)),
  ]);
  const { data: backendCalculatedScores, isLoading: isLoadingScores } =
    useGetCalculatedScores();

  // 백엔드 calculatedScores를 scoreMap으로 매핑
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
  const getScoreForRegularAdmission = (regularAdmission: {
    university?: { id: number };
    scoreCalculationCode?: string;
  } | null): number | null => {
    if (!regularAdmission) return null;
    const scoreKey = `${regularAdmission.university?.id}_${regularAdmission.scoreCalculationCode}`;
    const savedScore = scoreMap.get(scoreKey);
    return savedScore?.convertedScore ?? null;
  };

  useEffect(() => {
    const processAdmissions = () => {
      if (!data) return;

      const processed: ProcessedAdmission[] = [];

      for (const item of data) {
        let susiRisk: number | null = null;
        let regularRisk: number | null = null;
        let myScore: number | null = null;
        let scoreDifference: number | null = null;
        let regularErrorMessage: string | null = null;
        let susiErrorMessage: string | null = null;
        if (!myGrade) {
          susiErrorMessage = "생기부/성적이 필요합니다.";
        } else if (
          item?.recruitmentUnit?.admission?.category?.name === "학생부교과"
        ) {
          susiRisk = calculateSubjectRisk(myGrade, {
            risk_1: item.recruitmentUnit.scores?.risk_plus_5 || null,
            risk_2: item.recruitmentUnit.scores?.risk_plus_4 || null,
            risk_3: item.recruitmentUnit.scores?.risk_plus_3 || null,
            risk_4: item.recruitmentUnit.scores?.risk_plus_2 || null,
            risk_5: item.recruitmentUnit.scores?.risk_plus_1 || null,
            risk_6: item.recruitmentUnit.scores?.risk_minus_1 || null,
            risk_7: item.recruitmentUnit.scores?.risk_minus_2 || null,
            risk_8: item.recruitmentUnit.scores?.risk_minus_3 || null,
            risk_9: item.recruitmentUnit.scores?.risk_minus_4 || null,
            risk_10: item.recruitmentUnit.scores?.risk_minus_5 || null,
          });
        } else if (
          item?.recruitmentUnit?.admission?.category?.name === "학생부종합" &&
          schoolRecord &&
          staticData
        ) {
          const evaluation = officerList?.find((n) => {
            const series = n.series.split(">");
            const major = series[0];
            const mid = series.length > 0 ? series[1] : "";
            const minor = series.length > 1 ? series[2] : "";
            return (
              item.recruitmentUnit.fields.major?.name === major &&
              item.recruitmentUnit.fields.mid?.name === mid &&
              item.recruitmentUnit.fields.minor?.name === minor
            );
          });

          const evaluationScore = evaluation
            ? evaluations[evaluation.id]
            : null;
          const _risk = calculateComprehensiveRisk({
            recruitmentUnit: item.recruitmentUnit,
            myEvaluationFactorScore: evaluationScore?.factorScores || {}, // This can be replaced with actual data if available
            myGrade,
            schoolRecord: schoolRecord, // Assuming this is static data or fetched elsewhere
            staticData: staticData, // Assuming this is static data or fetched elsewhere
          });
          susiRisk = _risk.totalRisk;
          if (!evaluationScore)
            susiErrorMessage = `[${item.recruitmentUnit.fields.major?.name}] [${item.recruitmentUnit.fields.mid?.name}] [${item.recruitmentUnit.fields.minor?.name}]의 평가 내역이 필요합니다.`;
        }

        // Handling Regular (정시) admissions - using backend calculated scores
        if (!mockExamScores?.data.length) {
          regularErrorMessage = "모의고사 성적이 필요합니다.";
        } else if (item?.regularAdmission) {
          myScore = getScoreForRegularAdmission(item.regularAdmission);

          if (myScore !== null) {
            regularRisk = calc정시위험도(myScore, {
              risk_10: parseFloat(item.regularAdmission.riskPlus5 || "0"),
              risk_9: parseFloat(item.regularAdmission.riskPlus4 || "0"),
              risk_8: parseFloat(item.regularAdmission.riskPlus3 || "0"),
              risk_7: parseFloat(item.regularAdmission.riskPlus2 || "0"),
              risk_6: parseFloat(item.regularAdmission.riskPlus1 || "0"),
              risk_5: parseFloat(item.regularAdmission.riskMinus1 || "0"),
              risk_4: parseFloat(item.regularAdmission.riskMinus2 || "0"),
              risk_3: parseFloat(item.regularAdmission.riskMinus3 || "0"),
              risk_2: parseFloat(item.regularAdmission.riskMinus4 || "0"),
              risk_1: parseFloat(item.regularAdmission.riskMinus5 || "0"),
            });

            scoreDifference =
              myScore -
              (parseFloat(item.regularAdmission?.minCut || "0") || 0);
          } else {
            regularErrorMessage = "환산점수 없음";
          }
        }

        processed.push({
          item,
          susi: {
            risk: susiRisk,
            errorMessage: susiErrorMessage,
          },
          jungsi: {
            myScore,
            risk: regularRisk,
            scoreDifference,
            errorMessage: regularErrorMessage,
          },
        });
      }

      setProcessedAdmissions(processed);
    };

    processAdmissions();
    // getScoreForRegularAdmission, officerList, evaluations는 의도적으로 제외
    // (내부 함수 및 안정적인 참조)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, myGrade, mockExamScores, schoolRecord, staticData, scoreMap]);

  if (isLoading || isLoadingScores) return <div>로딩 중...</div>;
  if (error) return <div>에러가 발생했습니다.</div>;

  const headers = ["1", "2", "3", "4", "5", "6"];

  const getRowData = (
    title: string,
    formatter: (
      item: ProcessedAdmission | undefined,
      index: number,
    ) => string | number | JSX.Element | null,
  ) => {
    return [
      title,
      ...Array(6)
        .fill(null)
        .map((_, index) => formatter(processedAdmissions?.[index], index)),
    ];
  };

  const susiRows = [
    getRowData(
      "대학명",
      (item) => item?.item.recruitmentUnit.university.name ?? "-",
    ),
    getRowData(
      "교과/학종",
      (item) => item?.item?.recruitmentUnit?.admission?.category?.name ?? "-",
    ),
    getRowData(
      "전형명",
      (item) => item?.item.recruitmentUnit.admission.name ?? "-",
    ),
    getRowData("모집단위", (item) => item?.item.recruitmentUnit.name ?? "-"),
    getRowData("교과 최초컷", (item) =>
      item?.item.recruitmentUnit.scores?.grade_50_cut
        ? parseFloat(item.item.recruitmentUnit.scores.grade_50_cut)
        : "-",
    ),
    getRowData("교과 추합컷", (item) =>
      item?.item.recruitmentUnit.scores?.grade_70_cut
        ? parseFloat(item.item.recruitmentUnit.scores.grade_70_cut)
        : "-",
    ),
    getRowData("내점수", (item) =>
      item?.susi?.errorMessage
        ? item.susi.errorMessage
        : item
          ? myGrade ?? "-"
          : "-",
    ),
    getRowData("교과컷 차이", (item) =>
      myGrade && item?.item.recruitmentUnit.scores?.grade_50_cut
        ? (item?.item.recruitmentUnit.scores?.grade_50_cut - myGrade)?.toFixed(
            3,
          )
        : "-",
    ),
    getRowData("종합 위험도", (item) =>
      item?.susi?.risk ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {item?.susi?.errorMessage ? (
                <Badge variant={"outline"}>계산 불가</Badge>
              ) : (
                <RiskBadge risk={item.susi.risk} />
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>학종의 경우 계열적합성, 비교과 항목이 함께 계산됩니다.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        "-"
      ),
    ),
  ];

  const regularRows = [
    getRowData("최초컷", (item) =>
      item?.item.recruitmentUnit
        ? item?.item?.regularAdmission?.min_cut
          ? parseFloat(item.item.regularAdmission.min_cut).toFixed(3)
          : "정시 전형이 없어요."
        : "-",
    ),
    getRowData("추합컷", (item) =>
      item?.item?.regularAdmission
        ? parseFloat(item.item?.regularAdmission.max_cut).toFixed(3)
        : "-",
    ),
    getRowData("내점수", (item) =>
      item?.jungsi?.errorMessage
        ? item.jungsi.errorMessage
        : item?.jungsi?.myScore
          ? item.jungsi.myScore?.toFixed(2)
          : "-",
    ),
    getRowData(
      "최초컷 차이",
      (item) => item?.jungsi?.scoreDifference?.toFixed(2) ?? "-",
    ),
    getRowData("위험도", (item) =>
      item?.jungsi?.risk ? <RiskBadge risk={item.jungsi.risk} /> : "-",
    ),
  ];

  const comparisonRow = getRowData("유불리 비교", (item) => {
    if (item?.susi?.errorMessage || item?.jungsi?.errorMessage) {
      return "비교 불가";
    }
    if (!item?.susi?.risk && !item?.jungsi?.risk) {
      return "-";
    } else if (item?.susi?.risk && !item?.jungsi?.risk) {
      return "수시 유리";
    } else if (!item?.susi?.risk && item?.jungsi?.risk) {
      return "정시 유리";
    } else if (item?.susi?.risk === item?.jungsi?.risk) {
      return "동일";
    } else if (item?.susi?.risk > item?.jungsi?.risk) {
      return "수시 유리";
    } else {
      return "정시 유리";
    }
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse bg-white">
        <thead>
          <tr>
            <th className="min-w-[80px] border border-gray-300 bg-gray-100 px-4 py-2">
              구분
            </th>
            <th className="min-w-[140px] border border-gray-300 bg-gray-100 px-4 py-2">
              항목
            </th>
            {headers.map((header, index) => (
              <th
                key={index}
                className="min-w-[160px] border border-gray-300 bg-gray-100 px-4 py-2"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {susiRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {rowIndex === 0 && (
                <td
                  className="border border-gray-300 px-4 py-2 text-center text-sm"
                  rowSpan={susiRows.length}
                >
                  수시
                </td>
              )}
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-gray-300 px-4 py-2 text-center text-sm"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {regularRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {rowIndex === 0 && (
                <td
                  className="border border-gray-300 px-4 py-2 text-center text-sm"
                  rowSpan={regularRows.length}
                >
                  정시
                </td>
              )}
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-gray-300 px-4 py-2 text-center text-sm"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            {comparisonRow.map((cell, cellIndex) =>
              cellIndex === 0 ? (
                <td
                  key={cellIndex}
                  className="border border-gray-300 px-4 py-2 text-center text-sm"
                  colSpan={2}
                >
                  유불리 비교
                </td>
              ) : (
                <td
                  key={cellIndex}
                  className="border border-gray-300 px-4 py-2 text-center text-sm"
                >
                  {cell}
                </td>
              ),
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
