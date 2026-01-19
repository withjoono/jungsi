import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FrequencyDistributionItem, MockApplicationBasicInfo } from "./types";

interface FrequencyDistributionTableProps {
  frequencyDistribution: FrequencyDistributionItem[];
  basicInfo: MockApplicationBasicInfo | null;
  myScore?: number;
}

// 합격상태별 스타일
const STATUS_STYLES: Record<string, { bg: string; text: string; badge: string }> = {
  "안정합격": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
  },
  "추가합격": {
    bg: "bg-green-50",
    text: "text-green-700",
    badge: "bg-green-100 text-green-700",
  },
  "합격가능": {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700",
  },
  "불합격": {
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
};

// 도수분포 데이터 재집계
function aggregateDistribution(
  data: FrequencyDistributionItem[],
  intervalSize: number
): FrequencyDistributionItem[] {
  if (data.length === 0 || intervalSize <= 0) return [];

  // 점수 범위 구하기
  const allScores = data.flatMap((d) => [d.scoreLower, d.scoreUpper]);
  const minScore = Math.floor(Math.min(...allScores) / intervalSize) * intervalSize;
  const maxScore = Math.ceil(Math.max(...allScores) / intervalSize) * intervalSize;

  // 새 구간 생성
  const bins: Map<number, { count: number; statuses: Map<string, number> }> = new Map();

  for (let start = minScore; start < maxScore; start += intervalSize) {
    bins.set(start, { count: 0, statuses: new Map() });
  }

  // 기존 데이터를 새 구간에 할당
  data.forEach((item) => {
    const midScore = (item.scoreLower + item.scoreUpper) / 2;
    const binStart = Math.floor(midScore / intervalSize) * intervalSize;
    const bin = bins.get(binStart);
    if (bin) {
      bin.count += item.applicantCount;
      const currentStatusCount = bin.statuses.get(item.passStatus) || 0;
      bin.statuses.set(item.passStatus, currentStatusCount + item.applicantCount);
    }
  });

  // 누적인원 계산 및 결과 배열 생성 (점수 높은 순)
  const sortedBins = Array.from(bins.entries()).sort((a, b) => b[0] - a[0]);

  let cumulativeCount = 0;
  const result: FrequencyDistributionItem[] = [];

  sortedBins.forEach(([binStart, bin]) => {
    if (bin.count === 0) return; // 빈 구간 제외

    cumulativeCount += bin.count;

    // 가장 많은 합격상태 결정
    let dominantStatus = "불합격";
    let maxCount = 0;
    bin.statuses.forEach((count, status) => {
      if (count > maxCount) {
        maxCount = count;
        dominantStatus = status;
      }
    });

    result.push({
      scoreLower: binStart,
      scoreUpper: binStart + intervalSize,
      applicantCount: bin.count,
      cumulativeCount,
      passStatus: dominantStatus,
    });
  });

  return result;
}

export const FrequencyDistributionTable: React.FC<FrequencyDistributionTableProps> = ({
  frequencyDistribution,
  basicInfo,
  myScore,
}) => {
  const [intervalSize, setIntervalSize] = useState<number>(5);
  const [inputValue, setInputValue] = useState<string>("5");

  // 원본 데이터의 구간 크기 계산
  const originalIntervalSize = useMemo(() => {
    if (frequencyDistribution.length < 2) return 5;
    const item = frequencyDistribution[0];
    return Math.abs(item.scoreUpper - item.scoreLower) || 5;
  }, [frequencyDistribution]);

  // 선택된 구간에 따라 데이터 재집계
  const aggregatedData = useMemo(() => {
    if (intervalSize <= 0) {
      return [...frequencyDistribution].sort((a, b) => b.scoreLower - a.scoreLower);
    }

    // 원본 구간이 목표 구간보다 작거나 같으면 원본 사용 또는 집계
    if (intervalSize <= originalIntervalSize) {
      // 좁은 구간 요청 시 원본 그대로 사용
      return [...frequencyDistribution].sort((a, b) => b.scoreLower - a.scoreLower);
    }

    return aggregateDistribution(frequencyDistribution, intervalSize);
  }, [frequencyDistribution, intervalSize, originalIntervalSize]);

  // 내 점수가 어느 구간에 속하는지 찾기
  const myScoreRange = useMemo(() => {
    if (!myScore || !aggregatedData.length) return null;
    return aggregatedData.find(
      (item) => myScore >= item.scoreLower && myScore < item.scoreUpper
    );
  }, [myScore, aggregatedData]);

  // 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 100) {
      setIntervalSize(numValue);
    }
  };

  // 빠른 선택 버튼
  const quickSelectOptions = [1, 2, 5, 10, 20];

  if (!frequencyDistribution.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-primary">📋</span>
              도수분포표
            </CardTitle>
            {basicInfo && (
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                <span>모집인원: <strong>{basicInfo.recruitmentCount}명</strong></span>
                <span>경쟁률: <strong>{basicInfo.competitionRate.toFixed(2)}:1</strong></span>
                <span>총 합격자: <strong>{basicInfo.totalPassCount}명</strong></span>
                <span>모의지원자: <strong>{basicInfo.mockApplicantCount}명</strong></span>
              </div>
            )}
          </div>

          {/* 구간폭 설정 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="interval-size" className="text-xs text-muted-foreground">
              구간폭 설정 (점)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="interval-size"
                type="number"
                min="0.5"
                max="100"
                step="0.5"
                value={inputValue}
                onChange={handleInputChange}
                className="w-20 h-9 text-center"
              />
              <span className="text-sm text-muted-foreground">점</span>
            </div>
            {/* 빠른 선택 */}
            <div className="flex gap-1 flex-wrap">
              {quickSelectOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setIntervalSize(size);
                    setInputValue(size.toString());
                  }}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    intervalSize === size
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary"
                  }`}
                >
                  {size}점
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-center p-3 font-semibold text-gray-700 whitespace-nowrap">
                  점수 구간
                </th>
                <th className="text-center p-3 font-semibold text-gray-700 whitespace-nowrap">
                  지원자수
                </th>
                <th className="text-center p-3 font-semibold text-gray-700 whitespace-nowrap">
                  누적인원
                </th>
                <th className="text-center p-3 font-semibold text-gray-700 whitespace-nowrap">
                  합격상태
                </th>
              </tr>
            </thead>
            <tbody>
              {aggregatedData.map((item, index) => {
                const isMyRange =
                  myScore !== undefined &&
                  myScore >= item.scoreLower &&
                  myScore < item.scoreUpper;
                const style = STATUS_STYLES[item.passStatus] || {
                  bg: "bg-gray-50",
                  text: "text-gray-700",
                  badge: "bg-gray-100 text-gray-700",
                };

                return (
                  <tr
                    key={`${item.scoreLower}-${item.scoreUpper}-${index}`}
                    className={`border-b transition-colors ${
                      isMyRange
                        ? "bg-primary/10 ring-2 ring-inset ring-primary font-bold"
                        : index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50/50"
                    } hover:bg-gray-100/50`}
                  >
                    <td className="text-center p-3 whitespace-nowrap">
                      <span className="font-mono">
                        {item.scoreLower.toFixed(1)} ~ {item.scoreUpper.toFixed(1)}
                      </span>
                      {isMyRange && (
                        <span className="ml-2 text-xs text-primary animate-pulse">
                          ← 내 위치
                        </span>
                      )}
                    </td>
                    <td className="text-center p-3">
                      <span className="font-medium">{item.applicantCount}</span>명
                    </td>
                    <td className="text-center p-3">
                      <span className="font-medium">{item.cumulativeCount}</span>명
                    </td>
                    <td className="text-center p-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.badge}`}
                      >
                        {item.passStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 상태별 범례 */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t">
          {Object.entries(STATUS_STYLES).map(([status, style]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.badge}`}>
                {status}
              </span>
            </div>
          ))}
        </div>

        {/* 요약 정보 */}
        {myScoreRange && myScore && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-primary">내 예상 위치:</span>
              <span>
                점수 <strong>{myScore.toFixed(1)}</strong>점 →{" "}
                누적 <strong>{myScoreRange.cumulativeCount}</strong>등 →{" "}
                <span
                  className={`font-bold ${
                    STATUS_STYLES[myScoreRange.passStatus]?.text || "text-gray-700"
                  }`}
                >
                  {myScoreRange.passStatus}
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
