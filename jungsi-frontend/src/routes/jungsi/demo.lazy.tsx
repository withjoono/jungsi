import { JungsiDemoSteps } from "@/components/services/explore/jungsi/demo/jungsi-demo-steps";
import { ExploreJungsiStepperProvider } from "@/components/services/explore/jungsi/context/explore-jungsi-provider";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/jungsi/demo")({
  component: JungsiDemo,
});

function JungsiDemo() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10">
      <ExploreJungsiStepperProvider admissionType="가" isDemo={true}>
        <JungsiDemoSteps />
      </ExploreJungsiStepperProvider>
    </div>
  );
}
