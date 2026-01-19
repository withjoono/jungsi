import { Button } from "@/components/custom/button";
import { RequireLoginMessage } from "@/components/require-login-message";
import { RequireSchoolRecordMessage } from "@/components/require-schoolrecord-message";
import { RowSeriesSearch } from "@/components/row-series-search";
import { MyCompatibility } from "@/components/services/evaluation/my-compatibility";
import { SeriesSelector } from "@/components/services/evaluation/series-selector";
import { Separator } from "@/components/ui/separator";
import { ICompatibilityData } from "@/constants/compatibility-series";
import { UNIVERSITY_COMPATIBILITY_LEVELS } from "@/constants/compatibility-univ";
import {
  useGetCurrentUser,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createLazyFileRoute("/susi/_layout/compatibility")({
  component: SusiCompatibility,
});

function SusiCompatibility() {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: schoolRecords } = useGetSchoolRecords();

  const [selectedSeries, setSelectedSeries] = useState({
    grandSeries: "",
    middleSeries: "",
    rowSeries: "",
  });

  const [searchSeries, setSearchSeries] = useState<ICompatibilityData | null>(
    null,
  );

  const [selectedUniv, setSelectedUniv] = useState(
    UNIVERSITY_COMPATIBILITY_LEVELS[0],
  );

  useEffect(() => {
    if (searchSeries) {
      setSelectedSeries({
        grandSeries: searchSeries.grandSeries,
        middleSeries: searchSeries.middleSeries,
        rowSeries: searchSeries.rowSeries,
      });
    }
  }, [searchSeries]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">계열 적합성 진단</h3>
        <p className="text-sm text-muted-foreground">
          내 생기부의 데이터를 분석하여 계열별 적합도를 진단하는 서비스입니다.
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : !schoolRecords || schoolRecords.isEmpty ? (
        <RequireSchoolRecordMessage />
      ) : (
        <div className="">
          <div className="space-y-2 py-4 pt-12">
            <p className="text-center text-lg font-semibold">
              목표 계열을 선택해주세요!
            </p>
            <p className="text-center text-sm">
              내 생기부가 선택한 계열에 적합한지 확인해요.
            </p>
          </div>
          <div className="space-y-4 py-12">
            <RowSeriesSearch
              selectedSeries={searchSeries}
              setSelectedSeries={setSearchSeries}
              className="mx-auto max-w-sm"
            />
            <SeriesSelector
              selectedSeries={selectedSeries}
              setSelectedSeries={setSelectedSeries}
            />
          </div>

          {selectedSeries.rowSeries ? (
            <div className="space-y-8 py-8">
              <div className="flex flex-wrap gap-2">
                {UNIVERSITY_COMPATIBILITY_LEVELS.map((n, idx) => {
                  return (
                    <Button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedUniv(n)}
                      variant={
                        n.level === selectedUniv.level ? "default" : "outline"
                      }
                    >
                      Lv{n.level} - {n.text}
                    </Button>
                  );
                })}
              </div>
              <MyCompatibility
                selectedSeries={selectedSeries}
                selectedUniv={selectedUniv}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
