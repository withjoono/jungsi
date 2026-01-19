import {
  IMajorFieldData,
  IMidFieldData,
  IMinorFieldData,
} from "@/stores/server/features/static-data/interfaces";
import { IRegion } from "@/types/region.type";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

interface StepperContextProps {
  step: number;
  formData: FormData;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (key: keyof FormData, data: any) => void;
  resetStep: () => void;
  isLastStep: boolean;
}

interface FormData {
  evaluation_id: number | null; // 선택한 평가 id
  majorField: IMajorFieldData | null; // 대계열
  midField: IMidFieldData | null; // 대계열
  minorField: IMinorFieldData | null; // 대계열
  step1SelectedIds: number[];
  step2SelectedIds: number[];
  step3SelectedIds: number[];
  step4SelectedIds: number[];
  step5SelectedIds: number[];
  basicType: "일반" | "특별";
  region: IRegion[];
  selectedGeneralFieldIds: number[];
  selectedSubtypeIds: number[];
}

const initialData: FormData = {
  evaluation_id: null,
  majorField: null,
  midField: null,
  minorField: null,
  step1SelectedIds: [],
  step2SelectedIds: [],
  step3SelectedIds: [],
  step4SelectedIds: [],
  step5SelectedIds: [],
  basicType: "일반",
  region: [],
  selectedGeneralFieldIds: [1],
  selectedSubtypeIds: [],
};

const ExploreEarlyComprehensiveStepperContext = createContext<
  StepperContextProps | undefined
>(undefined);

const ExploreEarlyComprehensiveStepperProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const LAST_STEP = 6; // finish 포함
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialData);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const nextStep = useCallback(() => {
    setStep((prevStep) => {
      const newStep = prevStep < LAST_STEP ? prevStep + 1 : prevStep;
      if (newStep !== prevStep) {
        scrollToTop();
      }
      return newStep;
    });
  }, [scrollToTop]);

  const prevStep = useCallback(() => {
    setStep((prevStep) => {
      const newStep = prevStep > 1 ? prevStep - 1 : prevStep;
      if (newStep !== prevStep) {
        scrollToTop();
      }
      return newStep;
    });
  }, [scrollToTop]);

  const resetStep = useCallback(() => {
    setStep(1);
    setFormData(initialData);
    scrollToTop();
  }, [scrollToTop]);

  const updateFormData = useCallback((key: keyof FormData, data: any) => {
    setFormData((prevData) => {
      // 데이터 유효성 검사
      if (key === "region" && !Array.isArray(data)) {
        console.error("Region must be an array");
        return prevData;
      }
      if (key === "basicType" && data !== "일반" && data !== "특별") {
        console.error("Invalid basic_type");
        return prevData;
      }

      return { ...prevData, [key]: data };
    });
  }, []);

  const isLastStep = useMemo(() => step === LAST_STEP, [step]);

  const value = useMemo(
    () => ({
      step,
      formData,
      nextStep,
      prevStep,
      updateFormData,
      resetStep,
      isLastStep,
    }),
    [step, formData, nextStep, prevStep, updateFormData, resetStep, isLastStep],
  );

  return (
    <ExploreEarlyComprehensiveStepperContext.Provider value={value}>
      {children}
    </ExploreEarlyComprehensiveStepperContext.Provider>
  );
};

const useExploreEarlyComprehensiveStepper = (): StepperContextProps => {
  const context = useContext(ExploreEarlyComprehensiveStepperContext);
  if (!context) {
    throw new Error(
      "useExploreEarlyComprehensiveStepper must be used within a ExploreEarlyComprehensiveStepperProvider",
    );
  }
  return context;
};

export {
  ExploreEarlyComprehensiveStepperProvider,
  useExploreEarlyComprehensiveStepper,
};
