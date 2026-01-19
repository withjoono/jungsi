import { useState, useMemo } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calcRealRate, type CrawlerDataEntry } from "./types";
import { CompetitionRateTable } from "./competition-rate-table";

interface DepartmentSectionProps {
  data: CrawlerDataEntry[];
  groupName: string;
  groupColor: {
    bg: string;
    text: string;
    border: string;
  };
}

const DISPLAY_OPTIONS = [10, 20, 50] as const;

export function DepartmentSection({
  data,
  groupColor,
}: DepartmentSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [isCountDropdownOpen, setIsCountDropdownOpen] = useState(false);

  const allDepartments = useMemo(() => {
    const depts = [...new Set(data.map((d) => d.모집단위))];
    return depts.sort();
  }, [data]);

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allDepartments
      .filter((dept) => dept.toLowerCase().includes(query))
      .slice(0, 30);
  }, [allDepartments, searchQuery]);

  const selectedData = useMemo(() => {
    if (selectedDepartments.length === 0) return [];
    return [...data]
      .filter((d) => selectedDepartments.includes(d.모집단위))
      .sort((a, b) => calcRealRate(a) - calcRealRate(b))
      .slice(0, displayCount);
  }, [data, selectedDepartments, displayCount]);

  const totalCount = useMemo(() => {
    if (selectedDepartments.length === 0) return 0;
    return data.filter((d) => selectedDepartments.includes(d.모집단위)).length;
  }, [data, selectedDepartments]);

  const handleAddDepartment = (dept: string) => {
    if (!selectedDepartments.includes(dept)) {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };

  const handleRemoveDepartment = (dept: string) => {
    setSelectedDepartments(selectedDepartments.filter((d) => d !== dept));
  };

  const handleAddAll = () => {
    const newDepts = filteredDepartments.filter(
      (d) => !selectedDepartments.includes(d),
    );
    setSelectedDepartments([...selectedDepartments, ...newDepts]);
    setSearchQuery("");
  };

  const handleClearAll = () => {
    setSelectedDepartments([]);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <CardTitle className="text-base">
              해당지역 모집단위별 경쟁률
            </CardTitle>
            {selectedDepartments.length > 0 && (
              <span className="text-sm text-gray-500">
                ({selectedDepartments.length}개 모집단위 · 총 {totalCount}개 중{" "}
                {Math.min(displayCount, totalCount)}개)
              </span>
            )}
          </div>

          {selectedDepartments.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsCountDropdownOpen(!isCountDropdownOpen)}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                {displayCount}개 표시
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isCountDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCountDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
                  {DISPLAY_OPTIONS.map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        setDisplayCount(count);
                        setIsCountDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${displayCount === count ? `${groupColor.bg} ${groupColor.text}` : "text-gray-700"}`}
                    >
                      {count}개
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="모집단위명을 입력하세요 (예: 의, 간호, 컴퓨터...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchQuery && filteredDepartments.length > 0 && (
          <div className="mt-4 text-center">
            <p className="mb-3 text-sm font-semibold text-gray-700">
              검색 할 학과 (총 {filteredDepartments.length}개)
            </p>
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {filteredDepartments.map((dept) => {
                const isSelected = selectedDepartments.includes(dept);
                return (
                  <button
                    key={dept}
                    onClick={() =>
                      isSelected
                        ? handleRemoveDepartment(dept)
                        : handleAddDepartment(dept)
                    }
                    className={`rounded-full border-2 px-3 py-1.5 text-sm transition-colors ${
                      isSelected
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-orange-500 bg-white text-orange-500 hover:bg-orange-50"
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleAddAll}
              className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              전체선택
            </button>
          </div>
        )}

        {searchQuery && filteredDepartments.length === 0 && (
          <p className="mt-4 text-center text-sm text-gray-500">
            "{searchQuery}"에 해당하는 모집단위가 없습니다.
          </p>
        )}

        {!searchQuery && selectedDepartments.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">
              선택된 모집단위
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDepartments.map((dept) => (
                <span
                  key={dept}
                  className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-sm text-white"
                >
                  {dept}
                  <button
                    onClick={() => handleRemoveDepartment(dept)}
                    className="rounded-full p-0.5 hover:bg-white/20"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearAll}
                className="rounded-full px-3 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                전체 삭제
              </button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {selectedDepartments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>
              모집단위명을 검색하고 선택하면 해당 학과를 모집하는 모든 대학의
              경쟁률을 비교할 수 있습니다.
            </p>
          </div>
        ) : selectedData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>선택한 모집단위에 해당하는 데이터가 없습니다.</p>
          </div>
        ) : (
          <CompetitionRateTable data={selectedData} showDepartment={false} />
        )}
      </CardContent>
    </Card>
  );
}
