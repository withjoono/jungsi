import { useState, useMemo, useEffect } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RegionSelector } from "./region-selector";
import { AdmissionTypeSelector } from "./admission-type-selector";
import { UniversitySection } from "./university-section";
import { DepartmentSection } from "./department-section";
import { LowestRateSection } from "./lowest-rate-section";
import {
  getRegionName,
  GROUP_COLORS,
  type AdmissionGroup,
  type AdmissionType,
  type CrawlerData,
  type CrawlerDataEntry,
  type RegionId,
  type SpecialAdmissionCategory,
} from "./types";

export function CompetitionRate() {
  const [activeTab, setActiveTab] = useState<AdmissionGroup>("가군");
  const [selectedRegion, setSelectedRegion] = useState<RegionId>("all");
  const [selectedAdmissionType, setSelectedAdmissionType] =
    useState<AdmissionType>("전체");
  const [selectedSpecialCategories, setSelectedSpecialCategories] = useState<
    SpecialAdmissionCategory[]
  >([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [crawlerData, setCrawlerData] = useState<CrawlerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 크롤러 데이터 로드
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/data/competition-rate.json");
      if (!response.ok) throw new Error("데이터를 불러올 수 없습니다");
      const data = await response.json();
      setCrawlerData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      console.error("Failed to load crawler data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 지역 + 전형유형 필터링된 데이터
  const filteredData = useMemo(() => {
    if (!crawlerData) return { 가군: [], 나군: [], 다군: [] };

    const filterData = (data: CrawlerDataEntry[]) => {
      return data.filter((item) => {
        // 지역 필터
        if (selectedRegion !== "all") {
          const regionName = getRegionName(selectedRegion);
          if (item.지역 !== regionName) return false;
        }

        // 전형유형 필터
        if (selectedAdmissionType !== "전체") {
          if (selectedAdmissionType === "일반") {
            if (item.전형유형 === "특별") return false;
          } else if (selectedAdmissionType === "특별") {
            if (item.전형유형 !== "특별") return false;

            if (selectedSpecialCategories.length > 0) {
              if (
                !item.특별전형카테고리 ||
                !selectedSpecialCategories.includes(
                  item.특별전형카테고리 as SpecialAdmissionCategory,
                )
              ) {
                return false;
              }
            }
          }
        }

        return true;
      });
    };

    return {
      가군: filterData(crawlerData.가군 || []),
      나군: filterData(crawlerData.나군 || []),
      다군: filterData(crawlerData.다군 || []),
    };
  }, [crawlerData, selectedRegion, selectedAdmissionType, selectedSpecialCategories]);

  const currentData = filteredData[activeTab];

  const stats = useMemo(() => {
    const allData = [
      ...filteredData.가군,
      ...filteredData.나군,
      ...filteredData.다군,
    ];
    const universities = new Set(allData.map((d) => d.대학명));
    return {
      total: allData.length,
      universities: universities.size,
    };
  }, [filteredData]);

  const tabs: AdmissionGroup[] = ["가군", "나군", "다군"];

  return (
    <div className="space-y-6">
      {/* 상단 컨트롤 */}
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {currentTime.toLocaleTimeString("ko-KR")}
          </span>
          <span className="ml-1 h-2 w-2 animate-pulse rounded-full bg-green-400" />
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm transition-colors hover:bg-primary/20 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          새로고침
        </button>
      </div>

      {/* 거북 선생님 안내 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 shadow-md">
        <div className="flex items-start gap-6">
          {/* 거북 선생님 이미지 */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src="/images/geobuk-teacher.png"
                alt="거북 선생님"
                className="h-24 w-24 object-contain drop-shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 animate-bounce rounded-full bg-green-400 shadow-lg" />
            </div>
          </div>

          {/* 말풍선 */}
          <div className="relative flex-1">
            <div className="relative max-h-[600px] overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
              {/* 말풍선 꼬리 */}
              <div className="absolute left-0 top-8 -ml-2 h-0 w-0 border-b-[10px] border-r-[12px] border-t-[10px] border-b-transparent border-r-white border-t-transparent" />

              {/* 내용 */}
              <div className="space-y-5">
                {/* 제목 */}
                <h3 className="text-xl font-bold text-gray-900">실시간 경쟁율 페이지란?</h3>

                {/* 본문 */}
                <div className="space-y-4 text-sm leading-relaxed text-gray-700">
                  <p>
                    정시 접수기간때, <span className="font-semibold text-indigo-600">5분에 한번씩, 로봇이 모든 대학을 돌아다니며, 경쟁률 현황을 긁어오는</span> 페이지입니다.
                  </p>

                  <p>
                    접수기간 경쟁률을 확인하는 사이트는, 진학사와 유웨이가 각 대학 경쟁률 페이지를 링크 건 사이트 2곳이 유일합니다.
                  </p>

                  <p>
                    하지만, 경험이 있으신 분은 아시겠지만, 진학사, 유웨이 페이지에서,<br />
                    경쟁률 낮은 곳을 찾으려고, 이 대학, 저 대학 링크 타고 돌아다니다보면,<br />
                    <span className="font-semibold text-rose-600">비교도 힘들고, 찾다가 접수기간 놓쳐서, 원서 못 내는 일도 허다합니다.</span>
                  </p>

                  {/* 기능 1 */}
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-bold text-blue-900">🤖 로봇이 5분마다 전국 대학 경쟁률 크롤링!</h4>
                    <p className="text-blue-800">
                      그래서, 거북스쿨은 모든 대학의 실시간 경쟁률 상황을 긁어서, 이곳 한곳에서,<br />
                      <span className="font-semibold">입맛대로(대학별, 모집단위별, 지역별)</span> 경쟁률 확인하고, 유리한 대학을 선택할 수 있도록 했습니다.
                    </p>
                  </div>

                  {/* 기능 2 */}
                  <div className="rounded-lg bg-purple-50 p-4">
                    <h4 className="mb-2 font-bold text-purple-900">🤖 AI가 과거 5년간 각 대학, 학과의 1일차, 2일차.. 경쟁률과 최종경쟁율 상황을 학습해서, 현 시점에서 최종 경쟁률 예측!</h4>
                    <p className="text-purple-800">
                      하지만, 지금 당장 경쟁율이 낮아도 펑크가 날 것이라고 속단할 수 없습니다.<br />
                      그래서, AI에게 학습을 시켰습니다.<br />
                      모든 대학, 학과별로 과거 5년동안, 1일차, 2일차.. 경쟁률과 최종 경쟁률 상황을 딥러닝 시켰습니다.<br />
                      <span className="font-semibold">그래서, 당장의 상황으로 속단하지 않도록, AI가 예측 최종 경쟁률을 보여드립니다.</span>
                    </p>
                  </div>

                  {/* 기능 3 */}
                  <div className="rounded-lg bg-amber-50 p-4">
                    <h4 className="mb-2 font-bold text-amber-900">📊 펑크난 대학을 찾는, 핵심은 경쟁률이 아니라, 추합까지 포함한 실질경쟁율입니다.</h4>
                    <p className="text-amber-800">
                      그래서, 작년 추합 인원을 넣어서, 몇 명이 빠질거라서, 결국 실질 경쟁률은 얼마다 라고 보여줍니다.<br />
                      <span className="font-semibold">실질 경쟁율을 봐야, 펑크난 대학을 찾을 수 있습니다.</span>
                    </p>
                  </div>

                  {/* 마무리 */}
                  <div className="border-t pt-4">
                    <p className="mb-2 font-semibold text-gray-900">아래는 2026 정시 접수기간 실시간 경쟁률 현황입니다</p>
                    <p className="mb-3 text-rose-600">
                      2027 접수기간 실시간 경쟁률은 거북스쿨 정시 서비스 사용자에게만 개방합니다.
                    </p>
                    <p>
                      거북스쿨 정시 서비스는 정시 기간에만 서비스 되는것이 아니라,<br />
                      <span className="font-bold text-indigo-600">교육청, 평가원 모의고사 서비스</span>도 함께 제공되기 때문에,<br />
                      <span className="font-bold text-purple-600">1년내내 서비스 됩니다.</span>
                    </p>
                  </div>
                </div>

                {/* CTA 버튼 */}
                <div className="pt-2">
                  <a
                    href="/jungsi"
                    className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg"
                  >
                    <span>거북스쿨 정시 서비스 자세히 알아보기</span>
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 군 선택 탭 */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const count = filteredData[tab].length;
          const style = GROUP_COLORS[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-6 py-3 text-base font-bold transition-all ${
                activeTab === tab
                  ? `bg-gradient-to-r ${style.gradient} scale-105 text-white shadow-lg`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
              <span
                className={`ml-2 text-sm ${activeTab === tab ? "text-white/80" : "text-gray-400"}`}
              >
                ({count.toLocaleString()})
              </span>
            </button>
          );
        })}
      </div>

      {/* 지역 선택 + 전형유형 선택 */}
      <div className="rounded-lg border bg-card p-4">
        <RegionSelector
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
        />
        <AdmissionTypeSelector
          selectedType={selectedAdmissionType}
          selectedCategories={selectedSpecialCategories}
          onTypeChange={setSelectedAdmissionType}
          onCategoryChange={setSelectedSpecialCategories}
        />
      </div>

      {/* 메인 콘텐츠 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="font-medium text-muted-foreground">
              데이터를 불러오는 중...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="mb-2 font-medium text-red-500">오류 발생</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              다시 시도
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <UniversitySection
            data={currentData}
            groupName={activeTab}
            groupColor={GROUP_COLORS[activeTab]}
          />

          <DepartmentSection
            data={currentData}
            groupName={activeTab}
            groupColor={GROUP_COLORS[activeTab]}
          />

          <LowestRateSection
            data={currentData}
            groupName={activeTab}
            groupColor={GROUP_COLORS[activeTab]}
          />
        </div>
      )}

      {/* 범례 */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-emerald-500" />
              <span className="text-muted-foreground">경쟁률 3:1 미만</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-amber-500" />
              <span className="text-muted-foreground">경쟁률 3~5:1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-rose-500" />
              <span className="text-muted-foreground">경쟁률 5:1 이상</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                미달
              </span>
              <span className="text-muted-foreground">실질경쟁률 1:1 이하</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {stats.universities}개 대학 · {stats.total}개 모집단위
          </div>
        </div>
      </div>
    </div>
  );
}
