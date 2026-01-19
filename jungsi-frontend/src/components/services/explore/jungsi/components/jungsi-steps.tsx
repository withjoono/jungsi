import { useEffect } from "react";
import { JungsiStep2 } from "./step-2/step-2";
import { JungsiStep3 } from "./step-3/step-3";
import { Step } from "./stepper";
import { Link } from "@tanstack/react-router";
import { JungsiFinish } from "./jungsi-finish";
import { useExploreJungsiStepper } from "../context/explore-jungsi-provider";
import { JungsiStep4 } from "./step-4/step-4";
import { JungsiStep1v3 } from "./step-1-v3/step-1";
import { useCalculateScores } from "@/stores/server/features/jungsi/queries";
import { useAuthStore } from "@/stores/client/use-auth-store";

export const JungsiSteps = () => {
  const { step, formData } = useExploreJungsiStepper();
  const { mutate: calculateScores, isPending: isCalculating } = useCalculateScores();
  const accessToken = useAuthStore((state) => state.accessToken);

  // 페이지 진입 시 환산점수 계산 호출 (로그인된 경우에만)
  useEffect(() => {
    if (accessToken) {
      console.log("[JungsiSteps] 환산점수 계산 시작...");
      calculateScores();
    } else {
      console.log("[JungsiSteps] 로그인 필요 - 환산점수 계산 건너뜀");
    }
  }, [calculateScores, accessToken]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <JungsiStep1v3 />;
      case 2:
        return <JungsiStep2 />;
      case 3:
        return <JungsiStep3 />;
      case 4:
        return <JungsiStep4 />;
      case 5:
        return <JungsiFinish />;
      default:
        return null;
    }
  };
  const stepLabels = [
    {
      step: 1,
      text: "대학별 탐색",
    },
    {
      step: 2,
      text: "학과별 탐색",
    },
    {
      step: 3,
      text: "위험도 확인",
    },
    {
      step: 4,
      text: "대학별 유불리",
    },
  ];

  return (
    <>
      <div>
        <p className="text-center text-sm">다른 모집군을 찾으시나요?</p>

        <div className="flex items-center justify-center gap-4">
          <Link
            to="/jungsi/a"
            className="flex items-center justify-center pb-2 text-blue-500"
          >
            <p className="text-center text-sm">가군</p>
          </Link>
          <Link
            to="/jungsi/b"
            className="flex items-center justify-center pb-2 text-blue-500"
          >
            <p className="text-center text-sm">나군</p>
          </Link>
          <Link
            to="/jungsi/c"
            className="flex items-center justify-center pb-2 text-blue-500"
          >
            <p className="text-center text-sm">다군</p>
          </Link>
        </div>
      </div>
      <p className="pb-2 text-center text-2xl font-semibold md:text-3xl">
        정시 전형 탐색 하기 ({formData.admissionType}군)
      </p>
      <p className="pb-8 text-center text-sm text-foreground/70">
        대학별 계산식에 따른 내 점수를 한눈에 확인하고 어느 대학이 유리한지
        탐색해보세요.
      </p>
      {isCalculating && (
        <p className="pb-4 text-center text-sm text-blue-500">
          환산점수 계산 중...
        </p>
      )}
      <div className="flex w-full flex-wrap items-center justify-center gap-y-2 pb-8 md:gap-2">
        {stepLabels.map((label) => {
          return (
            <Step
              key={label.step}
              id={label.step}
              text={label.text}
              isLast={label.step === stepLabels.length}
            />
          );
        })}
      </div>
      {renderStep()}
    </>
  );
};
