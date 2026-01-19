import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/susi")({
  component: SusiRoute,
});

function SusiRoute() {
  return <Outlet />;
}
