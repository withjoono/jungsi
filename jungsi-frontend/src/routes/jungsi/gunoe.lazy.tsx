import { JungsiSteps } from "@/components/services/explore/jungsi/components/jungsi-steps";
import { ExploreJungsiStepperProvider } from "@/components/services/explore/jungsi/context/explore-jungsi-provider";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/jungsi/gunoe")({
  component: JungsiGunoe,
});

function JungsiGunoe() {
  return (
    <div className="mx-auto w-full max-w-screen-xl py-20 pb-8">
      <ExploreJungsiStepperProvider admissionType="군외">
        <JungsiSteps />
      </ExploreJungsiStepperProvider>
    </div>
  );
}
