import { useState, useMemo } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calcRealRate, type CrawlerDataEntry } from "./types";
import { CompetitionRateTable } from "./competition-rate-table";

interface UniversitySectionProps {
  data: CrawlerDataEntry[];
  groupName: string;
  groupColor: {
    bg: string;
    text: string;
    border: string;
  };
}

const DISPLAY_OPTIONS = [10, 20, 50] as const;

export function UniversitySection({
  data,
  groupColor,
}: UniversitySectionProps) {
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    [],
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [isCountDropdownOpen, setIsCountDropdownOpen] = useState(false);

  const availableUniversities = useMemo(() => {
    const universities = [...new Set(data.map((d) => d.대학명))];
    return universities.sort();
  }, [data]);

  const filteredUniversities = useMemo(() => {
    if (!searchQuery) return availableUniversities;
    return availableUniversities.filter((u) =>
      u.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [availableUniversities, searchQuery]);

  const selectedData = useMemo(() => {
    if (selectedUniversities.length === 0) return [];
    return [...data]
      .filter((d) => selectedUniversities.includes(d.대학명))
      .sort((a, b) => calcRealRate(a) - calcRealRate(b))
      .slice(0, displayCount);
  }, [data, selectedUniversities, displayCount]);

  const totalCount = useMemo(() => {
    if (selectedUniversities.length === 0) return 0;
    return data.filter((d) => selectedUniversities.includes(d.대학명)).length;
  }, [data, selectedUniversities]);

  const handleAddUniversity = (university: string) => {
    if (!selectedUniversities.includes(university)) {
      setSelectedUniversities([...selectedUniversities, university]);
    }
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleRemoveUniversity = (university: string) => {
    setSelectedUniversities(selectedUniversities.filter((u) => u !== university));
  };

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <CardTitle className="text-base">해당 지역 대학별 경쟁률</CardTitle>
            {selectedUniversities.length > 0 && (
              <span className="text-sm text-gray-500">
                ({selectedUniversities.length}개 대학 · 총 {totalCount}개 중{" "}
                {Math.min(displayCount, totalCount)}개)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedUniversities.length > 0 && (
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

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${groupColor.bg} ${groupColor.text} hover:opacity-80`}
              >
                <Plus size={16} />
                대학 추가
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="border-b border-gray-100 p-2">
                    <Input
                      type="text"
                      placeholder="대학 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredUniversities.length === 0 ? (
                      <div className="p-3 text-center text-sm text-gray-500">
                        검색 결과가 없습니다
                      </div>
                    ) : (
                      filteredUniversities.map((university) => (
                        <button
                          key={university}
                          onClick={() => handleAddUniversity(university)}
                          disabled={selectedUniversities.includes(university)}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${selectedUniversities.includes(university) ? "bg-gray-50 text-gray-400" : "text-gray-700"}`}
                        >
                          {university}
                          {selectedUniversities.includes(university) && (
                            <span className="ml-2 text-xs text-gray-400">
                              (선택됨)
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedUniversities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedUniversities.map((university) => (
              <span
                key={university}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${groupColor.bg} ${groupColor.text}`}
              >
                {university}
                <button
                  onClick={() => handleRemoveUniversity(university)}
                  className="rounded-full p-0.5 hover:bg-black/10"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {selectedData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>대학을 선택하면 모집단위별 경쟁률을 확인할 수 있습니다.</p>
          </div>
        ) : (
          <CompetitionRateTable data={selectedData} />
        )}
      </CardContent>
    </Card>
  );
}
