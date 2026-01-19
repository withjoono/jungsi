import { EarlySubjectSteps } from "@/components/services/explore/early-subject/components/early-subject-steps";
import { ExploreEarlySubjectStepperProvider } from "@/components/services/explore/early-subject/context/explore-early-subject-provider";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/explore/early-subject")({
  component: ExploreEarlySubject,
});

function ExploreEarlySubject() {
  return (
    <div className="mx-auto w-full max-w-screen-xl py-20 pb-8">
      <ExploreEarlySubjectStepperProvider>
        <EarlySubjectSteps />
      </ExploreEarlySubjectStepperProvider>
    </div>
  );
}
