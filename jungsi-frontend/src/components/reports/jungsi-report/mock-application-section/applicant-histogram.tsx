import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApplicantItem } from "./types";

interface ApplicantHistogramProps {
  applicants: ApplicantItem[];
  universityName: string;
  recruitmentUnit: string;
  myScore?: number;
}

// 정규분포 확률밀도함수
function normalPDF(x: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return x === mean ? 1 : 0;
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
  return coefficient * Math.exp(exponent);
}

// 통계값 계산
function calculateStatistics(scores: number[]) {
  const n = scores.length;
  if (n === 0) return { mean: 0, stdDev: 0, min: 0, max: 0 };

  const mean = scores.reduce((sum, s) => sum + s, 0) / n;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...scores);
  const max = Math.max(...scores);

  return { mean, stdDev, min, max };
}

// 점수대별 지원자 수 계산
function calculateScoreBins(applicants: ApplicantItem[], binSize: number = 5) {
  if (applicants.length === 0) return [];

  const scores = applicants.map((a) => a.score);
  const min = Math.floor(Math.min(...scores) / binSize) * binSize;
  const max = Math.ceil(Math.max(...scores) / binSize) * binSize;

  const bins: Map<number, number> = new Map();
  for (let start = min; start <= max; start += binSize) {
    bins.set(start, 0);
  }

  applicants.forEach((a) => {
    const binStart = Math.floor(a.score / binSize) * binSize;
    bins.set(binStart, (bins.get(binStart) || 0) + 1);
  });

  return Array.from(bins.entries())
    .map(([binStart, count]) => ({
      binStart,
      binEnd: binStart + binSize,
      count,
      midPoint: binStart + binSize / 2,
    }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.binStart - a.binStart); // 점수 높은 순
}

// 합격 기준점수 계산 (안정합격 최저점)
function getPassThreshold(applicants: ApplicantItem[]) {
  const passApplicants = applicants.filter(
    (a) => a.passStatus === "안정합격" || a.passStatus === "추가합격" || a.passStatus === "합격가능"
  );
  if (passApplicants.length === 0) return null;
  return Math.min(...passApplicants.map((a) => a.score));
}

// 안정합격 기준점수 계산
function getSafePassThreshold(applicants: ApplicantItem[]) {
  const safePassApplicants = applicants.filter((a) => a.passStatus === "안정합격");
  if (safePassApplicants.length === 0) return null;
  return Math.min(...safePassApplicants.map((a) => a.score));
}

export const ApplicantHistogram: React.FC<ApplicantHistogramProps> = ({
  applicants,
  universityName,
  recruitmentUnit,
  myScore,
}) => {
  // 통계 계산
  const stats = useMemo(() => {
    const scores = applicants.map((a) => a.score);
    return calculateStatistics(scores);
  }, [applicants]);

  // 점수대별 지원자 수
  const scoreBins = useMemo(() => calculateScoreBins(applicants, 5), [applicants]);
  const maxBinCount = useMemo(() => Math.max(...scoreBins.map((b) => b.count), 1), [scoreBins]);

  // 합격 기준점들
  const passThreshold = useMemo(() => getPassThreshold(applicants), [applicants]);
  const safePassThreshold = useMemo(() => getSafePassThreshold(applicants), [applicants]);

  // SVG 설정
  const width = 600;
  const height = 350; // 높이 증가 (히스토그램 바 표시용)
  const padding = { top: 40, right: 40, bottom: 60, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const curveHeight = chartHeight * 0.6; // 정규분포 곡선 영역
  const barHeight = chartHeight * 0.35; // 히스토그램 바 영역
  const barTop = curveHeight + 10;

  // 정규분포 곡선 경로 생성 (X축 반전: 높은 점수가 왼쪽)
  const { curvePath, areaPath, xScale, xMin, xMax } = useMemo(() => {
    if (applicants.length === 0 || stats.stdDev === 0) {
      return { curvePath: "", areaPath: "", xScale: () => 0, xMin: 0, xMax: 0 };
    }

    const { mean, stdDev, min, max } = stats;
    // X축 범위: 평균 ± 4*표준편차 또는 데이터 범위
    const xMin = Math.min(min, mean - 4 * stdDev);
    const xMax = Math.max(max, mean + 4 * stdDev);
    const xRange = xMax - xMin;

    // X 스케일 함수 (반전: 높은 점수가 왼쪽 = 0, 낮은 점수가 오른쪽 = chartWidth)
    const xScale = (x: number) => chartWidth - ((x - xMin) / xRange) * chartWidth;

    // Y값 계산을 위한 포인트들
    const numPoints = 200;
    const points: Array<{ x: number; y: number }> = [];

    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + (i / numPoints) * xRange;
      const y = normalPDF(x, mean, stdDev);
      points.push({ x, y });
    }

    // Y축 최대값
    const yMax = Math.max(...points.map((p) => p.y));

    // Y 스케일 함수
    const yScale = (y: number) => curveHeight - (y / yMax) * curveHeight;

    // 곡선 경로 생성
    const curvePath = points
      .map((p, i) => {
        const px = xScale(p.x);
        const py = yScale(p.y);
        return i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`;
      })
      .join(" ");

    // 면적 경로 (아래까지 채우기)
    const areaPath =
      curvePath +
      ` L ${xScale(xMin)} ${curveHeight} L ${xScale(xMax)} ${curveHeight} Z`;

    return { curvePath, areaPath, xScale, xMin, xMax };
  }, [applicants, stats, chartWidth, curveHeight]);

  // 내 점수 위치
  const myScoreX = useMemo(() => {
    if (!myScore || !xScale) return null;
    return xScale(myScore);
  }, [myScore, xScale]);

  // 합격 기준선 위치
  const passLineX = useMemo(() => {
    if (!passThreshold || !xScale) return null;
    return xScale(passThreshold);
  }, [passThreshold, xScale]);

  const safePassLineX = useMemo(() => {
    if (!safePassThreshold || !xScale) return null;
    return xScale(safePassThreshold);
  }, [safePassThreshold, xScale]);

  if (!applicants.length) {
    return null;
  }

  // 내 합격 상태 판단
  const getMyStatus = () => {
    if (!myScore) return null;
    if (safePassThreshold && myScore >= safePassThreshold) return "안정합격";
    if (passThreshold && myScore >= passThreshold) return "합격가능";
    return "불합격 위험";
  };

  const myStatus = getMyStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-primary">📊</span>
          {universityName} {recruitmentUnit} 지원현황
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          총 {applicants.length}명 지원 | 정규분포 곡선 + 점수대별 지원자수
        </p>
      </CardHeader>
      <CardContent>
        {/* 통계 요약 */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-gray-500">최고:</span>{" "}
            <span className="font-semibold">{stats.max.toFixed(1)}</span>
          </div>
          <div className="bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-gray-500">평균:</span>{" "}
            <span className="font-semibold">{stats.mean.toFixed(1)}</span>
          </div>
          <div className="bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-gray-500">최저:</span>{" "}
            <span className="font-semibold">{stats.min.toFixed(1)}</span>
          </div>
          <div className="bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-gray-500">표준편차:</span>{" "}
            <span className="font-semibold">{stats.stdDev.toFixed(2)}</span>
          </div>
        </div>

        {/* 정규분포 그래프 + 히스토그램 */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-[600px] mx-auto"
            style={{ minWidth: "400px" }}
          >
            <defs>
              {/* 안정합격 영역 그라데이션 */}
              <linearGradient id="safePassGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
              </linearGradient>
              {/* 합격가능 영역 그라데이션 */}
              <linearGradient id="possiblePassGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0.1" />
              </linearGradient>
              {/* 불합격 영역 그라데이션 */}
              <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <g transform={`translate(${padding.left}, ${padding.top})`}>
              {/* 불합격 영역 (전체 배경) - 반전된 방향 */}
              <path d={areaPath} fill="url(#failGradient)" />

              {/* 합격가능 영역 (합격 기준선 이상) - 왼쪽이 높은 점수 */}
              {passLineX !== null && (
                <clipPath id="possiblePassClip">
                  <rect x={0} y={0} width={passLineX} height={curveHeight} />
                </clipPath>
              )}
              {passLineX !== null && (
                <path
                  d={areaPath}
                  fill="url(#possiblePassGradient)"
                  clipPath="url(#possiblePassClip)"
                />
              )}

              {/* 안정합격 영역 (안정합격 기준선 이상) - 왼쪽이 높은 점수 */}
              {safePassLineX !== null && (
                <clipPath id="safePassClip">
                  <rect x={0} y={0} width={safePassLineX} height={curveHeight} />
                </clipPath>
              )}
              {safePassLineX !== null && (
                <path
                  d={areaPath}
                  fill="url(#safePassGradient)"
                  clipPath="url(#safePassClip)"
                />
              )}

              {/* 정규분포 곡선 */}
              <path
                d={curvePath}
                fill="none"
                stroke="#1E40AF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* 평균선 */}
              {xScale && (
                <line
                  x1={xScale(stats.mean)}
                  y1={0}
                  x2={xScale(stats.mean)}
                  y2={curveHeight}
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              )}
              {xScale && (
                <text
                  x={xScale(stats.mean)}
                  y={-8}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  평균
                </text>
              )}

              {/* 합격 기준선 */}
              {passLineX !== null && (
                <>
                  <line
                    x1={passLineX}
                    y1={0}
                    x2={passLineX}
                    y2={curveHeight}
                    stroke="#22C55E"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                  />
                  <text
                    x={passLineX}
                    y={-8}
                    textAnchor="middle"
                    className="text-xs fill-green-600 font-medium"
                  >
                    합격선
                  </text>
                </>
              )}

              {/* 안정합격 기준선 */}
              {safePassLineX !== null && safePassLineX !== passLineX && (
                <>
                  <line
                    x1={safePassLineX}
                    y1={0}
                    x2={safePassLineX}
                    y2={curveHeight}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                  />
                  <text
                    x={safePassLineX}
                    y={-8}
                    textAnchor="middle"
                    className="text-xs fill-blue-600 font-medium"
                  >
                    안정선
                  </text>
                </>
              )}

              {/* 내 점수 표시 */}
              {myScoreX !== null && myScore && (
                <>
                  <line
                    x1={myScoreX}
                    y1={0}
                    x2={myScoreX}
                    y2={chartHeight}
                    stroke="#F97316"
                    strokeWidth="3"
                  />
                  <circle
                    cx={myScoreX}
                    cy={curveHeight * 0.3}
                    r="8"
                    fill="#F97316"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={myScoreX}
                    y={curveHeight * 0.3 - 18}
                    textAnchor="middle"
                    className="text-sm fill-orange-600 font-bold"
                  >
                    내 점수
                  </text>
                </>
              )}

              {/* 점수대별 지원자수 히스토그램 바 */}
              {xScale && scoreBins.map((bin) => {
                const barX = xScale(bin.binEnd);
                const barW = Math.abs(xScale(bin.binStart) - xScale(bin.binEnd)) - 2;
                const barH = (bin.count / maxBinCount) * barHeight;

                // 해당 점수대의 합격상태 결정
                let barColor = "#EF4444"; // 불합격
                if (safePassThreshold && bin.midPoint >= safePassThreshold) {
                  barColor = "#3B82F6"; // 안정합격
                } else if (passThreshold && bin.midPoint >= passThreshold) {
                  barColor = "#22C55E"; // 합격가능
                }

                return (
                  <g key={bin.binStart}>
                    <rect
                      x={barX + 1}
                      y={barTop + barHeight - barH}
                      width={Math.max(barW, 4)}
                      height={barH}
                      fill={barColor}
                      opacity={0.7}
                      rx={2}
                    />
                    {/* 지원자 수 표시 */}
                    <text
                      x={barX + barW / 2 + 1}
                      y={barTop + barHeight - barH - 4}
                      textAnchor="middle"
                      className="text-xs fill-gray-700 font-medium"
                    >
                      {bin.count}
                    </text>
                    {/* 점수 범위 표시 */}
                    <text
                      x={barX + barW / 2 + 1}
                      y={barTop + barHeight + 12}
                      textAnchor="middle"
                      className="text-[9px] fill-gray-400"
                    >
                      {bin.binStart}
                    </text>
                  </g>
                );
              })}

              {/* X축 */}
              <line
                x1={0}
                y1={barTop + barHeight}
                x2={chartWidth}
                y2={barTop + barHeight}
                stroke="#E5E7EB"
                strokeWidth="1"
              />

              {/* X축 레이블 (반전) */}
              {xScale && (
                <>
                  <text
                    x={0}
                    y={barTop + barHeight + 30}
                    textAnchor="start"
                    className="text-xs fill-gray-400"
                  >
                    {xMax.toFixed(0)} (고)
                  </text>
                  <text
                    x={chartWidth}
                    y={barTop + barHeight + 30}
                    textAnchor="end"
                    className="text-xs fill-gray-400"
                  >
                    {xMin.toFixed(0)} (저)
                  </text>
                  <text
                    x={chartWidth / 2}
                    y={barTop + barHeight + 45}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    환산점수 (← 높음 | 낮음 →)
                  </text>
                </>
              )}
            </g>
          </svg>
        </div>

        {/* 내 위치 요약 */}
        {myScore && myStatus && (
          <div className={`mt-4 p-4 rounded-lg border ${
            myStatus === "안정합격"
              ? "bg-blue-50 border-blue-200"
              : myStatus === "합격가능"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center gap-2">
              <span className="font-medium">내 예상 결과:</span>
              <span className={`font-bold ${
                myStatus === "안정합격"
                  ? "text-blue-600"
                  : myStatus === "합격가능"
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                {myStatus}
              </span>
              <span className="text-sm text-gray-500">
                (점수: {myScore.toFixed(1)}, 평균 대비: {(myScore - stats.mean).toFixed(1)})
              </span>
            </div>
          </div>
        )}

        {/* 범례 */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500/70 rounded" />
            <span className="text-sm text-gray-600">안정합격</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/70 rounded" />
            <span className="text-sm text-gray-600">합격가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/70 rounded" />
            <span className="text-sm text-gray-600">불합격위험</span>
          </div>
          {myScore && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full" />
              <span className="text-sm text-gray-600">내 위치</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
