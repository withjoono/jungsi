import { createLazyFileRoute } from "@tanstack/react-router";
import { SusiComparison } from "@/components/services/comparison/susi-comparison";

export const Route = createLazyFileRoute("/analysis/comparison")({
  component: SusiComparisonPage,
});

function SusiComparisonPage() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-20 pb-8">
      <SusiComparison />
    </div>
  );
}
