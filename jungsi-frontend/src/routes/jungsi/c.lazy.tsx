import { JungsiSteps } from "@/components/services/explore/jungsi/components/jungsi-steps";
import { ExploreJungsiStepperProvider } from "@/components/services/explore/jungsi/context/explore-jungsi-provider";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/jungsi/c")({
  component: JungsiC,
});

function JungsiC() {
  return (
    <div className="mx-auto w-full max-w-screen-xl py-20 pb-8">
      <ExploreJungsiStepperProvider admissionType="다">
        <JungsiSteps />
      </ExploreJungsiStepperProvider>
    </div>
  );
}
