import { EarlySubjectSteps } from "@/components/services/explore/early-subject/components/early-subject-steps";
import { ExploreEarlySubjectStepperProvider } from "@/components/services/explore/early-subject/context/explore-early-subject-provider";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/susi/_layout/subject")({
  component: SusiSubject,
});

function SusiSubject() {
  return (
    <div className="w-full pb-8">
      <ExploreEarlySubjectStepperProvider>
        <EarlySubjectSteps />
      </ExploreEarlySubjectStepperProvider>
    </div>
  );
}
