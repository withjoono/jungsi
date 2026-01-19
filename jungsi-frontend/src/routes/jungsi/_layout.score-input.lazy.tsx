import { RequireLogin } from "@/components/access-control";
import { Button } from "@/components/custom/button";
import { MockExamRawForm } from "@/components/services/mock-exam/mock-exam-raw-form";
import { MockExamStandardForm } from "@/components/services/mock-exam/mock-exam-standard-form";
import { Separator } from "@/components/ui/separator";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createLazyFileRoute("/jungsi/_layout/score-input")({
  component: ScoreInput,
});

function ScoreInput() {
  const [mode, setMode] = useState<"raw" | "standard">("standard");
  const date = new Date();
  const currentDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  return (
    <div className="space-y-4 pb-10">
      <div>
        <h3 className="text-lg font-medium">성적 입력</h3>
        <p className="text-sm text-muted-foreground">
          모의고사/수능 성적을 입력해보세요. 교과/학종 분석 시 최저등급 여부를
          판단하거나 정시 점수 산출에 활용됩니다.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={() => setMode("raw")}
          variant={mode === "raw" ? "default" : "outline"}
          disabled
        >
          원점수 입력
        </Button>
        <Button
          type="button"
          onClick={() => setMode("standard")}
          variant={mode === "standard" ? "default" : "outline"}
        >
          표준점수 입력
        </Button>
      </div>
      <Separator />
      <p>
        {currentDate} 기준:{" "}
        <b className="font-semibold text-red-500">2025 대학 수학 능력 시험</b>{" "}
        성적을 입력해주세요.
      </p>
      <RequireLogin featureName="성적 입력">
        {mode === "raw" ? <MockExamRawForm /> : <MockExamStandardForm />}
      </RequireLogin>
    </div>
  );
}
