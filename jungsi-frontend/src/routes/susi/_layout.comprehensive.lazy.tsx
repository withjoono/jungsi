import { EarlyComprehensiveSteps } from "@/components/services/explore/early-comprehensive/components/early-comprehensive-steps";
import { ExploreEarlyComprehensiveStepperProvider } from "@/components/services/explore/early-comprehensive/context/explore-early-comprehensive-provider";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/susi/_layout/comprehensive")({
  component: SusiComprehensive,
});

function SusiComprehensive() {
  return (
    <div className="w-full pb-8">
      <ExploreEarlyComprehensiveStepperProvider>
        <EarlyComprehensiveSteps />
      </ExploreEarlyComprehensiveStepperProvider>
    </div>
  );
}
