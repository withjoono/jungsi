import { EarlySubjectSteps } from "@/components/services/explore/early-subject/components/early-subject-steps";
import { ExploreEarlySubjectStepperProvider } from "@/components/services/explore/early-subject/context/explore-early-subject-provider";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/grade-analysis/_layout/subject")({
  component: GradeAnalysisSubject,
});

function GradeAnalysisSubject() {
  return (
    <div className="w-full pb-8">
      <ExploreEarlySubjectStepperProvider>
        <EarlySubjectSteps />
      </ExploreEarlySubjectStepperProvider>
    </div>
  );
}
