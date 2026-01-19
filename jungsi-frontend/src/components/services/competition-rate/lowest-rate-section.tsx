import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcRealRate, type CrawlerDataEntry } from "./types";
import { CompetitionRateTable } from "./competition-rate-table";

interface LowestRateSectionProps {
  data: CrawlerDataEntry[];
  groupName: string;
  groupColor: {
    bg: string;
    text: string;
    border: string;
  };
}

const DISPLAY_OPTIONS = [10, 20, 50] as const;

export function LowestRateSection({
  data,
  groupColor,
}: LowestRateSectionProps) {
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const lowestRateData = useMemo(() => {
    return [...data]
      .sort((a, b) => calcRealRate(a) - calcRealRate(b))
      .slice(0, displayCount);
  }, [data, displayCount]);

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📉</span>
            <CardTitle className="text-base">해당지역 경쟁률 리스트</CardTitle>
            <span className="text-sm text-gray-500">
              (총 {data.length}개 중 {Math.min(displayCount, data.length)}개)
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              {displayCount}개 표시
              <ChevronDown
                size={14}
                className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
                {DISPLAY_OPTIONS.map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setDisplayCount(count);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${displayCount === count ? `${groupColor.bg} ${groupColor.text}` : "text-gray-700"}`}
                  >
                    {count}개
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <CompetitionRateTable data={lowestRateData} />
      </CardContent>
    </Card>
  );
}
