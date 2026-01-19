import { useExploreEarlySubjectStepper } from "../context/explore-early-subject-provider";
import { EarlySubjectStep1 } from "./step-1/step-1";
import { EarlySubjectStep2 } from "./step-2/step-2";
import { EarlySubjectStep3 } from "./step-3/step-3";
import { EarlySubjectStep4 } from "./step-4/step-4";
import { EarlySubjectStep5 } from "./step-5/step-5";
import { Step } from "./stepper";
import { EarlySubjectFinish } from "./early-subject-finish";
import { Link } from "@tanstack/react-router";

export const EarlySubjectSteps = () => {
  const { step } = useExploreEarlySubjectStepper();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <EarlySubjectStep1 />;
      case 2:
        return <EarlySubjectStep2 />;
      case 3:
        return <EarlySubjectStep3 />;
      case 4:
        return <EarlySubjectStep4 />;
      case 5:
        return <EarlySubjectStep5 />;
      case 6:
        return <EarlySubjectFinish />;
      default:
        return null;
    }
  };
  const stepLabels = [
    {
      step: 1,
      text: "자격 및 대학선택",
    },
    {
      step: 2,
      text: "최저등급",
    },
    {
      step: 3,
      text: "비교과",
    },
    {
      step: 4,
      text: "모집단위",
    },
    {
      step: 5,
      text: "전형일자 확인",
    },
  ];

  return (
    <>
      <Link
        to="/susi/comprehensive"
        className="flex items-center justify-center pb-2 text-blue-500"
      >
        <p className="text-center text-sm">학종 전형을 찾으시나요?</p>
      </Link>
      <p className="pb-2 text-center text-2xl font-semibold md:text-3xl">
        🏫 교과 전형 탐색 하기
      </p>
      <p className="pb-8 text-center text-sm text-foreground/70">
        단계별 필터링을 통해 나에게 딱 맞는 입시 전형을 찾아보세요!
      </p>
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
