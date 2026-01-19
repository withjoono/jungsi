import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/mock-analysis")({
  component: MockAnalysisRoute,
});

function MockAnalysisRoute() {
  return <Outlet />;
}
