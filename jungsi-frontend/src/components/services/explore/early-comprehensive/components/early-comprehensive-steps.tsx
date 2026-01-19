import { Step } from "./stepper";
import { useExploreEarlyComprehensiveStepper } from "../context/explore-early-comprehensive-provider";
import { EarlyComprehensiveStep0 } from "./step-0";
import { EarlyComprehensiveStep1 } from "./step-1";
import { EarlyComprehensiveStep2 } from "./step-2";
import { EarlyComprehensiveStep3 } from "./step-3";
import { EarlyComprehensiveStep4 } from "./step-4";
import { EarlyComprehensiveFinish } from "./early-comprehensive-finish";
import { Link } from "@tanstack/react-router";

export const EarlyComprehensiveSteps = () => {
  const { step } = useExploreEarlyComprehensiveStepper();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <EarlyComprehensiveStep0 />;
      case 2:
        return <EarlyComprehensiveStep1 />;
      case 3:
        return <EarlyComprehensiveStep2 />;
      case 4:
        return <EarlyComprehensiveStep3 />;
      case 5:
        return <EarlyComprehensiveStep4 />;
      case 6:
        return <EarlyComprehensiveFinish />;
      default:
        return null;
    }
  };
  const stepLabels = [
    {
      step: 1,
      text: "생기부 선택",
    },
    {
      step: 2,
      text: "대학선택",
    },
    {
      step: 3,
      text: "대학별 유불리",
    },
    {
      step: 4,
      text: "최저확인",
    },
    {
      step: 5,
      text: "전형일자 확인",
    },
  ];

  return (
    <div className="w-full pb-8">
      <Link
        to="/susi/subject"
        className="flex items-center justify-center pb-2 text-blue-500"
      >
        <p className="text-center text-sm">교과 전형을 찾으시나요?</p>
      </Link>
      <p className="pb-2 text-center text-3xl font-semibold">
        🧐 학종 분석 및 대학 찾기
      </p>
      <p className="pb-8 text-center text-sm text-foreground/70">
        단계별 필터링을 통해 나에게 딱 맞는 입시 전형을 찾아보세요!
      </p>
      <div className="flex w-full flex-wrap items-center justify-center gap-y-2 pb-8 lg:gap-4">
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
    </div>
  );
};
